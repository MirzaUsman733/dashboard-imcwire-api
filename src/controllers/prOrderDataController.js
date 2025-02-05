require('dotenv').config();  // This loads variables from a .env file
const connection = require("../config/dbconfig");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);
// ✅ **Submit PR & Initialize Plan Records if Not Exists**
exports.submitPR = async (req, res) => {
  const {
    plan_id,
    prType,
    pr_status,
    payment_method,
    targetCountries,
    industryCategories,
    total_price,
    payment_status,
    ip_address
  } = req.body;

  // Generate a random client_id
  const client_id = uuidv4();

  if (
    !plan_id ||
    !prType ||
    !payment_method ||
    !targetCountries.length ||
    !industryCategories.length ||
    !total_price ||
    !pr_status ||
    !payment_status ||
    !ip_address
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // If the total amount is greater than $250, only allow Stripe
  if (total_price > 250 && payment_method === "Paypro") {
    return res.status(400).json({
      message: "For transactions above $250, only Stripe is allowed.",
    });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction(); // Begin Transaction

    // ✅ 1. Fetch User Email from `auth_user`
    const [userResult] = await dbConnection.query(
      "SELECT username, email FROM auth_user WHERE auth_user_id = ?",
      [req.user.id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User email not found." });
    }

    const userEmail = userResult[0].email;
    let username = userResult[0].username;
    username = username.replace(/[^a-zA-Z\s]/g, "").trim();
    // ✅ 2. Check if the plan is activated
    const [planItem] = await dbConnection.query(
      "SELECT numberOfPR, activate_plan FROM plan_items WHERE id = ?",
      [plan_id]
    );

    if (planItem.length === 0) {
      return res.status(400).json({ message: "Plan details not found." });
    }

    if (planItem[0].activate_plan !== 1) {
      return res
        .status(403)
        .json({ message: "The selected plan is not activated yet." });
    }

    const totalPrs = planItem[0].numberOfPR;

    // ✅ 5. Insert Multiple Target Countries with Individual Translations
    let targetCountryIds = [];
    for (const country of targetCountries) {
      let translationId = null;
      if (country.translationRequired) {
        const [translationResult] = await dbConnection.query(
          "INSERT INTO translation_required (translation, translationPrice) VALUES (?, ?)",
          [country.translationRequired, country.translationPrice]
        );

        translationId = translationResult.insertId;
      }

      const [targetCountryResult] = await dbConnection.query(
        "INSERT INTO target_countries (countryName, countryPrice, translation_required_id) VALUES (?, ?, ?)",
        [country.name, country.price, translationId]
      );
      targetCountryIds.push(targetCountryResult.insertId);
    }

    // ✅ 6. Insert Multiple Industry Categories
    let industryCategoryIds = [];
    for (const category of industryCategories) {
      const [industryCategoryResult] = await dbConnection.query(
        "INSERT INTO industry_categories (categoryName, categoryPrice) VALUES (?, ?)",
        [category.name, category.price]
      );
      industryCategoryIds.push(industryCategoryResult.insertId);
    }
    // ✅ 7. Insert PR Data
    const [prResult] = await dbConnection.query(
      "INSERT INTO pr_data (client_id, user_id, plan_id, prType, pr_status, payment_method, total_price, payment_status, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        client_id,
        req.user.id,
        plan_id,
        prType,
        pr_status,
        payment_method,
        total_price,
        payment_status,
        ip_address
      ]
    );
    const prId = prResult.insertId;
    // Store plan records without using its ID later
    await dbConnection.query(
      "INSERT INTO plan_records (user_id, plan_id, total_prs, used_prs, pr_id) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, plan_id, totalPrs, 1, prId] // Assuming `prId` is generated from previous PR insert
    );

    // ✅ 8. Link PR to Multiple Target Countries
    for (const countryId of targetCountryIds) {
      await dbConnection.query(
        "INSERT INTO pr_target_countries (pr_id, target_country_id) VALUES (?, ?)",
        [prId, countryId]
      );
    }

    // ✅ 9. Link PR to Multiple Industry Categories
    for (const categoryId of industryCategoryIds) {
      await dbConnection.query(
        "INSERT INTO pr_industry_categories (pr_id, target_industry_id) VALUES (?, ?)",
        [prId, categoryId]
      );
    }
    let paymentUrl;
    if (payment_method === "Stripe") {
      // Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: total_price * 100,
              product_data: {
                name: "Press Release",
              },
            },
            quantity: 1,
          },
        ],
        customer_email: userEmail,
        client_reference_id: client_id,
        mode: "payment",
        success_url: `https://dashboard.imcwire.com/thankyou-stripe/${client_id}?isvalid=true`,
        cancel_url: `https://dashboard.imcwire.com/thankyou-stripe/${client_id}?isvalid=false`,
      });
      paymentUrl = session.url;
    } else if (payment_method === "Paypro") {
      // PayPro Payment
      const authResponse = await fetch(
        `${process.env.Paypro_URL}/v2/ppro/auth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientid: process.env.clientid,
            clientsecret: process.env.clientsecret,
          }),
        }
      );
      if (!authResponse.ok) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      const token = authResponse.headers.get("Token");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const issueDate = new Date().toISOString().split("T")[0];
      const orderDueDate = new Date();
      orderDueDate.setDate(orderDueDate.getDate() + 1);
      const formattedOrderDueDate = orderDueDate.toISOString().split("T")[0];
      const orderPayload = [
        { MerchantId: "NUXLAY" },
        {
          OrderNumber: client_id,
          CurrencyAmount: `${total_price}.00`,
          Currency: "USD",
          OrderDueDate: formattedOrderDueDate,
          OrderType: "Service",
          IsConverted: "true",
          IssueDate: issueDate,
          CustomerEmail: userEmail,
          CustomerName: username,
          CustomerMobile: "",
          CustomerAddress: "",
        },
      ];

      const orderResponse = await fetch(
        `${process.env.Paypro_URL}/v2/ppro/co`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Token: token },
          body: JSON.stringify(orderPayload),
        }
      );
      const result = await orderResponse.json();
      if (orderResponse.ok && result[0]?.Status === "00") {
        paymentUrl = `${result[1]?.Click2Pay}&callback_url=https://dashboard.imcwire.com/thankyou`;
      } else {
        return res.status(500).json({ message: "Order creation failed" });
      }
    } else {
      return res.status(500).json({ message: "Payment Method is Incorrect" });
    }
    await dbConnection.commit();
    res.status(201).json({
      message: "We are redirecting you to the payment page.",
      paymentUrl,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// ✅ **Retrieve PRs for Logged-in User**
exports.getUserPRs = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Fetch PR Data for the logged-in user
    const [prData] = await connection.query(
      "SELECT * FROM pr_data WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found" });
    }

    // ✅ Fetch Related Data for Each PR
    for (let pr of prData) {
      // Fetch Target Countries & Translations for PR
      const [targetCountries] = await connection.query(
        `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation, tr.translationPrice
           FROM pr_target_countries ptc
           JOIN target_countries tc ON ptc.target_country_id = tc.id
           LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
           WHERE ptc.pr_id = ?`,
        [pr.id]
      );

      // Fetch Industry Categories for PR
      const [industryCategories] = await connection.query(
        `SELECT ic.id, ic.categoryName, ic.categoryPrice
           FROM pr_industry_categories pic
           JOIN industry_categories ic ON pic.target_industry_id = ic.id
           WHERE pic.pr_id = ?`,
        [pr.id]
      );

      // Add Related Data to PR Object
      pr.targetCountries = targetCountries.length ? targetCountries : [];
      pr.industryCategories = industryCategories.length
        ? industryCategories
        : [];
    }

    res.status(200).json(prData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Retrieve All PRs (SuperAdmin Only)**
exports.getAllPRs = async (req, res) => {
  try {
    // ✅ Fetch all PR Data
    const [prData] = await connection.query(
      "SELECT * FROM pr_data ORDER BY created_at DESC"
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found" });
    }

    // ✅ Fetch Related Data for Each PR
    for (let pr of prData) {
      // Fetch Target Countries & Translations for PR
      const [targetCountries] = await connection.query(
        `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation, tr.translationPrice
           FROM pr_target_countries ptc
           JOIN target_countries tc ON ptc.target_country_id = tc.id
           LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
           WHERE ptc.pr_id = ?`,
        [pr.id]
      );

      // Fetch Industry Categories for PR
      const [industryCategories] = await connection.query(
        `SELECT ic.id, ic.categoryName, ic.categoryPrice
           FROM pr_industry_categories pic
           JOIN industry_categories ic ON pic.target_industry_id = ic.id
           WHERE pic.pr_id = ?`,
        [pr.id]
      );

      // Add Related Data to PR Object
      pr.targetCountries = targetCountries.length ? targetCountries : [];
      pr.industryCategories = industryCategories.length
        ? industryCategories
        : [];
    }

    res.status(200).json(prData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Update PR Order Status (SuperAdmin)**
exports.updatePROrderStatusBySuperAdmin = async (req, res) => {
  try {
    const { prId } = req.params; // Extract the PR ID from route parameters
    const { newStatus } = req.body; // Extract the new status from the request body

    if (!prId || !newStatus) {
      return res
        .status(400)
        .json({ message: "PR ID and new status are required" });
    }

    // ✅ Check if the PR exists and fetch user_id
    const [existingPRs] = await connection.query(
      "SELECT user_id FROM pr_data WHERE id = ?",
      [prId]
    );

    if (existingPRs.length === 0) {
      return res.status(404).json({ message: "PR not found" });
    }
    const userId = existingPRs[0].user_id; // Assuming PR is associated with a single user

    // ✅ Update the status of the PR data
    const updateResult = await connection.query(
      "UPDATE pr_data SET pr_status = ? WHERE id = ?",
      [newStatus, prId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "No change in status" });
    }

    // ✅ Add notification for the user
    await connection.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [
        userId,
        `PR Order ${prId} Status Updated`,
        `Your PR Order ${prId} status has been updated to ${newStatus}.`,
      ]
    );

    res
      .status(200)
      .json({ message: "PR status updated successfully, notification sent" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ **Retrieve PRs for Logged-in User**
exports.getUserPRsById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Fetch PR Data for the logged-in user
    const [prData] = await connection.query(
      "SELECT * FROM pr_data WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found for this user" });
    }

    // ✅ Fetch Related Data for Each PR
    for (let pr of prData) {
      // Fetch Target Countries & Translations for PR
      const [targetCountries] = await connection.query(
        `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation, tr.translationPrice
           FROM pr_target_countries ptc
           JOIN target_countries tc ON ptc.target_country_id = tc.id
           LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
           WHERE ptc.pr_id = ?`,
        [pr.id]
      );

      // Fetch Industry Categories for PR
      const [industryCategories] = await connection.query(
        `SELECT ic.id, ic.categoryName, ic.categoryPrice
           FROM pr_industry_categories pic
           JOIN industry_categories ic ON pic.target_industry_id = ic.id
           WHERE pic.pr_id = ?`,
        [pr.id]
      );

      // Add Related Data to PR Object
      pr.targetCountries = targetCountries.length ? targetCountries : [];
      pr.industryCategories = industryCategories.length
        ? industryCategories
        : [];
    }

    res.status(200).json(prData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.submitCustomOrder = async (req, res) => {
  const {
    plan_id,
    perma,
    orderType,
    targetCountries,
    industryCategories,
    total_price,
    payment_status,
    payment_method,
    // Default to inactive if not provided
    is_active = 0,
  } = req.body;

  // Check for missing fields
  if (
    !plan_id ||
    !orderType ||
    !payment_method ||
    !targetCountries.length ||
    !industryCategories.length ||
    !total_price ||
    !payment_status ||
    !perma
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();

    // 0. Verify the plan exists
    const [planRows] = await dbConnection.query(
      "SELECT id FROM plan_items WHERE id = ?",
      [plan_id]
    );
    if (!planRows.length) {
      // Plan not found: return a 404 error response
      return res.status(404).json({ message: "Plan not found" });
    }

    // Generate unique orderId and client_id
    const orderId = uuidv4();
    const client_id = uuidv4();

    await dbConnection.beginTransaction(); // Begin Transaction

    // 1. Store Order Details, including is_active and perma.
    const [orderResult] = await dbConnection.query(
      `INSERT INTO custom_orders 
      (orderId, client_id, plan_id, perma, orderType, total_price, payment_status, payment_method, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderId,
        client_id,
        plan_id,
        perma,
        orderType,
        total_price,
        payment_status,
        payment_method,
        is_active ? 1 : 0, // Ensure it's either 1 (active) or 0 (inactive)
      ]
    );
    const customOrderId = orderResult.insertId;

    // 2. Insert Target Countries with Translations
    let targetCountryIds = [];
    for (const country of targetCountries) {
      let translationId = null;
      if (country.translationRequired) {
        const [translationResult] = await dbConnection.query(
          "INSERT INTO translation_required (translation) VALUES (?)",
          [country.translationRequired]
        );
        translationId = translationResult.insertId;
      }

      const [targetCountryResult] = await dbConnection.query(
        "INSERT INTO target_countries (countryName, countryPrice, translation_required_id) VALUES (?, ?, ?)",
        [country.name, country.price, translationId]
      );
      targetCountryIds.push(targetCountryResult.insertId);
    }

    // 3. Insert Industry Categories for the Order
    let industryCategoryIds = [];
    for (const category of industryCategories) {
      const [industryCategoryResult] = await dbConnection.query(
        "INSERT INTO industry_categories (categoryName, categoryPrice) VALUES (?, ?)",
        [category.name, category.price]
      );
      industryCategoryIds.push(industryCategoryResult.insertId);
    }

    // 4. Link Order to Target Countries
    for (const countryId of targetCountryIds) {
      await dbConnection.query(
        "INSERT INTO custom_order_target_countries (order_id, target_country_id) VALUES (?, ?)",
        [customOrderId, countryId]
      );
    }

    // 5. Link Order to Industry Categories
    for (const categoryId of industryCategoryIds) {
      await dbConnection.query(
        "INSERT INTO custom_order_industry_categories (order_id, industry_category_id) VALUES (?, ?)",
        [customOrderId, categoryId]
      );
    }

    // 6. Generate Invoice URL using the provided perma
    const invoiceUrl = `https://dashboard.imcwire.com/custom-invoice/${perma}`;

    await dbConnection.commit();
    res
      .status(201)
      .json({ message: "Custom order submitted successfully", invoiceUrl });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// exports.getCustomOrder = async (req, res) => {
//   const { orderId } = req.params;
//   if (!orderId) {
//     return res.status(400).json({ message: "Order ID is required" });
//   }

//   let dbConnection;

//   try {
//     dbConnection = await connection.getConnection();

//     // ✅ 1. Fetch Custom Order Data
//     const [orderResult] = await dbConnection.query(
//       "SELECT * FROM custom_orders WHERE id = ?",
//       [orderId]
//     );

//     if (orderResult.length === 0) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const customOrder = orderResult[0];

//     // ✅ 2. Fetch Target Countries Linked to Order
//     const [targetCountries] = await dbConnection.query(
//       `SELECT tc.id, tc.countryName, tc.countryPrice
//        FROM custom_order_target_countries cotc
//        JOIN target_countries tc ON cotc.target_country_id = tc.id
//        WHERE cotc.order_id = ?`,
//       [customOrder.id]
//     );

//     // ✅ 3. Fetch Industry Categories Linked to Order
//     const [industryCategories] = await dbConnection.query(
//       `SELECT ic.id, ic.categoryName, ic.categoryPrice
//        FROM custom_order_industry_categories coic
//        JOIN industry_categories ic ON coic.industry_category_id = ic.id
//        WHERE coic.order_id = ?`,
//       [customOrder.id]
//     );

//     // ✅ 4. Build Response
//     const response = {
//       orderId: customOrder.orderId,
//       client_id: customOrder.client_id,
//       plan_id: customOrder.plan_id,
//       orderType: customOrder.orderType,
//       total_price: customOrder.total_price,
//       payment_status: customOrder.payment_status,
//       payment_method: customOrder.payment_method,
//       created_at: customOrder.created_at,
//       targetCountries,
//       industryCategories,
//       invoiceUrl: `https://dashboard.imcwire.com/custom-invoice/${customOrder.id}`,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   } finally {
//     if (dbConnection) dbConnection.release();
//   }
// };

/**
 * Get a custom order by its perma value.
 *
 * This endpoint allows you to retrieve an order using the perma field,
 * which is used to generate the invoice URL.
 */
exports.getCustomOrder = async (req, res) => {
  const { perma } = req.params;
  if (!perma) {
    return res.status(400).json({ message: "Perma is required" });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();

    // 1. Fetch Custom Order Data by perma
    const [orderResult] = await dbConnection.query(
      "SELECT * FROM custom_orders WHERE perma = ?",
      [perma]
    );
    if (orderResult.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const customOrder = orderResult[0];

    // 2. Fetch Target Countries Linked to the Order
    const [targetCountries] = await dbConnection.query(
      `SELECT tc.id, tc.countryName, tc.countryPrice
       FROM custom_order_target_countries cotc
       JOIN target_countries tc ON cotc.target_country_id = tc.id
       WHERE cotc.order_id = ?`,
      [customOrder.id]
    );

    // 3. Fetch Industry Categories Linked to the Order
    const [industryCategories] = await dbConnection.query(
      `SELECT ic.id, ic.categoryName, ic.categoryPrice
       FROM custom_order_industry_categories coic
       JOIN industry_categories ic ON coic.industry_category_id = ic.id
       WHERE coic.order_id = ?`,
      [customOrder.id]
    );

    // 4. Build the Response, using the perma field for the invoice URL.
    const response = {
      orderId: customOrder.orderId,
      client_id: customOrder.client_id,
      plan_id: customOrder.plan_id,
      orderType: customOrder.orderType,
      total_price: customOrder.total_price,
      payment_status: customOrder.payment_status,
      payment_method: customOrder.payment_method,
      created_at: customOrder.created_at,
      targetCountries,
      industryCategories,
      invoiceUrl: `https://dashboard.imcwire.com/custom-invoice/${customOrder.perma}`,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

/**
 * Retrieve all custom orders along with their target countries and industry categories.
 */
exports.getAllCustomOrders = async (req, res) => {
  let dbConnection;
  try {
    dbConnection = await connection.getConnection();

    // Retrieve all orders sorted by creation date descending.
    const [orders] = await dbConnection.query(
      "SELECT * FROM custom_orders ORDER BY created_at DESC"
    );

    // For each order, fetch the linked target countries and industry categories.
    for (let order of orders) {
      // 1. Retrieve target countries for this order (with translation info if available)
      const [targetCountries] = await dbConnection.query(
        `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation AS translationValue 
         FROM target_countries tc
         LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
         JOIN custom_order_target_countries ctc ON tc.id = ctc.target_country_id
         WHERE ctc.order_id = ?`,
        [order.id]
      );
      order.targetCountries = targetCountries;

      // 2. Retrieve industry categories for this order
      const [industryCategories] = await dbConnection.query(
        `SELECT ic.id, ic.categoryName, ic.categoryPrice 
         FROM industry_categories ic
         JOIN custom_order_industry_categories ctc ON ic.id = ctc.industry_category_id
         WHERE ctc.order_id = ?`,
        [order.id]
      );
      order.industryCategories = industryCategories;

      // 3. Generate the invoice URL using the perma field.
      order.invoiceUrl = `https://dashboard.imcwire.com/custom-invoice/${order.perma}`;
    }

    res.status(200).json({ customOrders: orders });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};
exports.deleteCustomOrder = async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction(); // Begin transaction

    // ✅ 1. Fetch Custom Order to Ensure It Exists
    const [orderResult] = await dbConnection.query(
      "SELECT id FROM custom_orders WHERE id = ?",
      [orderId]
    );

    if (orderResult.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const customOrderId = orderResult[0].id;

    // ✅ 2. Fetch Target Countries Linked to This Order
    const [targetCountryIds] = await dbConnection.query(
      "SELECT target_country_id FROM custom_order_target_countries WHERE order_id = ?",
      [customOrderId]
    );

    // ✅ 3. Fetch Industry Categories Linked to This Order
    const [industryCategoryIds] = await dbConnection.query(
      "SELECT industry_category_id FROM custom_order_industry_categories WHERE order_id = ?",
      [customOrderId]
    );

    // ✅ 4. Delete Linked Target Countries from Mapping Table
    await dbConnection.query(
      "DELETE FROM custom_order_target_countries WHERE order_id = ?",
      [customOrderId]
    );

    // ✅ 5. Delete Linked Industry Categories from Mapping Table
    await dbConnection.query(
      "DELETE FROM custom_order_industry_categories WHERE order_id = ?",
      [customOrderId]
    );

    // ✅ 6. Delete Unused Target Countries (if not linked to any other orders or PRs)
    for (const { target_country_id } of targetCountryIds) {
      const [remainingLinks] = await dbConnection.query(
        "SELECT COUNT(*) as count FROM (SELECT target_country_id FROM custom_order_target_countries WHERE target_country_id = ? UNION ALL SELECT target_country_id FROM pr_target_countries WHERE target_country_id = ?) AS links",
        [target_country_id, target_country_id]
      );
      if (remainingLinks[0].count === 0) {
        await dbConnection.query("DELETE FROM target_countries WHERE id = ?", [
          target_country_id,
        ]);
      }
    }

    // ✅ 7. Delete Unused Industry Categories (if not linked to any other orders or PRs)
    for (const { industry_category_id } of industryCategoryIds) {
      const [remainingLinks] = await dbConnection.query(
        "SELECT COUNT(*) as count FROM (SELECT industry_category_id FROM custom_order_industry_categories WHERE industry_category_id = ? UNION ALL SELECT target_industry_id FROM pr_industry_categories WHERE target_industry_id = ?) AS links",
        [industry_category_id, industry_category_id]
      );
      if (remainingLinks[0].count === 0) {
        await dbConnection.query(
          "DELETE FROM industry_categories WHERE id = ?",
          [industry_category_id]
        );
      }
    }

    // ✅ 8. Delete the Custom Order
    await dbConnection.query("DELETE FROM custom_orders WHERE id = ?", [
      customOrderId,
    ]);

    await dbConnection.commit();
    res.status(200).json({
      message: "Custom order and associated data deleted successfully",
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};
