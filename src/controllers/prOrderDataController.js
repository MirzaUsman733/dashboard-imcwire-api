require("dotenv").config(); // This loads variables from a .env file
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
    ip_address,
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
        ip_address,
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
// exports.getUserPRs = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // ✅ Fetch PR Data for the logged-in user
//     const [prData] = await connection.query(
//       "SELECT * FROM pr_data WHERE user_id = ? ORDER BY created_at DESC",
//       [userId]
//     );

//     if (prData.length === 0) {
//       return res.status(404).json({ message: "No PRs found" });
//     }

//     // ✅ Fetch Related Data for Each PR
//     for (let pr of prData) {
//       // Fetch Target Countries & Translations for PR
//       const [targetCountries] = await connection.query(
//         `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation, tr.translationPrice
//            FROM pr_target_countries ptc
//            JOIN target_countries tc ON ptc.target_country_id = tc.id
//            LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
//            WHERE ptc.pr_id = ?`,
//         [pr.id]
//       );

//       // Fetch Industry Categories for PR
//       const [industryCategories] = await connection.query(
//         `SELECT ic.id, ic.categoryName, ic.categoryPrice
//            FROM pr_industry_categories pic
//            JOIN industry_categories ic ON pic.target_industry_id = ic.id
//            WHERE pic.pr_id = ?`,
//         [pr.id]
//       );

//       // Add Related Data to PR Object
//       pr.targetCountries = targetCountries.length ? targetCountries : [];
//       pr.industryCategories = industryCategories.length
//         ? industryCategories
//         : [];
//     }

//     res.status(200).json(prData);
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.getUserPRs = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch PR Data along with user and plan item data for the logged-in user
    const [prData] = await connection.query(
      `
      SELECT pr.*, au.email, pi.planName, pi.totalPlanPrice, pi.priceSingle, pi.planDescription, pi.type, pi.pdfLink, pi.numberOfPR, pi.perma
       FROM pr_data pr
      JOIN auth_user au ON pr.user_id = au.auth_user_id
      JOIN plan_items pi ON pr.plan_id = pi.id
      WHERE pr.user_id = ?
      ORDER BY pr.created_at DESC
    `,
      [userId]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found" });
    }

    // Fetch Related Data for Each PR
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

      // Fetch Plan Record Data
      const [planRecords] = await connection.query(
        `SELECT * FROM plan_records WHERE pr_id = ?`,
        [pr.id]
      );

      // Fetch Single PR Details
      // Fetch Single PR Details
      const [singlePRDetails] = await connection.query(
        `SELECT spd.*, r.id AS report_id, r.title AS report_title,
                ref.excel_name, ref.excel_url,
                pdf.pdf_name AS pdf_name, pdf.pdf_url AS pdf_url
         FROM single_pr_details spd
         LEFT JOIN reports r ON spd.id = r.single_pr_id
         LEFT JOIN report_excel_files ref ON r.id = ref.report_id
         LEFT JOIN report_pr_pdfs pdf ON r.id = pdf.report_id
         WHERE spd.pr_id = ?`,
        [pr.id]
      );

      for (let spd of singlePRDetails) {
        const promises = [
          connection.query(`SELECT c.* FROM companies c WHERE c.id = ?`, [
            spd.company_id,
          ]),
          spd.pdf_id
            ? connection.query(
              `SELECT pdf.* FROM pr_pdf_files pdf WHERE pdf.id = ?`,
              [spd.pdf_id]
            )
            : Promise.resolve([[]]),
          connection.query(
            `SELECT t.*, ut.url
             FROM single_pr_tags spt
             JOIN tags t ON spt.tag_id = t.id
             JOIN pr_url_tags ut ON spt.single_pr_id = ut.single_pr_id
             WHERE spt.single_pr_id = ?`,
            [spd.id]
          ),
        ];

        const [company, pdfFile, tagsUrls] = await Promise.all(promises);
        pr.targetCountries = targetCountries.length ? targetCountries : null;
        pr.industryCategories = industryCategories.length
          ? industryCategories
          : null;
        pr.planRecords = planRecords.length ? planRecords : null;
        spd.company = company.length ? company[0] : null;
        spd.pdfFile = pdfFile.length ? pdfFile[0] : null;
        spd.tagsUrls = tagsUrls.length ? tagsUrls[0] : null;
        // Filter out null values in case no report data exists
        spd.reports = spd.report_id ? {
          id: spd.report_id,
          title: spd.report_title,
          excelFile: spd.excel_name ? {
            name: spd.excel_name,
            url: spd.excel_url
          } : null,
          pdfFile: spd.pdf_name ? {
            name: spd.pdf_name,
            url: spd.pdf_url
          } : null
        } : null;
      }

      // Add Single PR Details to PR Object
      pr.singlePRDetails = singlePRDetails;
    }


    res.status(200).json(prData);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUserPRsIds = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch only PR ID and User ID (Client ID)
    const [prData] = await connection.query(
      `SELECT pr.id AS pr_id, pr.client_id AS order_id 
       FROM pr_data pr
       WHERE pr.user_id = ?
       ORDER BY pr.created_at DESC`,
      [userId]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found" });
    }

    res.status(200).json(prData);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Retrieve All PRs (SuperAdmin Only)**
// exports.getAllPRs = async (req, res) => {
//   try {
//     // Fetch all PR Data along with user and plan item data
//     const [prData] = await connection.query(
//       `SELECT pr.*, au.email, pi.planName, pi.totalPlanPrice, pi.priceSingle, pi.planDescription, pi.pdfLink, pi.numberOfPR, pi.created_at AS plan_created_at, pi.updated_at AS plan_updated_at, pi.perma
//        FROM pr_data pr
//        JOIN auth_user au ON pr.user_id = au.auth_user_id
//        JOIN plan_items pi ON pr.plan_id = pi.id
//        ORDER BY pr.created_at DESC`
//     );

//     if (prData.length === 0) {
//       return res.status(404).json({ message: "No PRs found" });
//     }

//     // Fetch Related Data for Each PR
//     for (let pr of prData) {
//       // Fetch Target Countries & Translations for PR
//       const [targetCountries] = await connection.query(
//         `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation, tr.translationPrice
//          FROM pr_target_countries ptc
//          JOIN target_countries tc ON ptc.target_country_id = tc.id
//          LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
//          WHERE ptc.pr_id = ?`,
//         [pr.id]
//       );

//       // Fetch Industry Categories for PR
//       const [industryCategories] = await connection.query(
//         `SELECT ic.id, ic.categoryName, ic.categoryPrice
//          FROM pr_industry_categories pic
//          JOIN industry_categories ic ON pic.target_industry_id = ic.id
//          WHERE pic.pr_id = ?`,
//         [pr.id]
//       );

//       // Fetch Plan Record Data
//       const [planRecords] = await connection.query(
//         `SELECT * FROM plan_records WHERE pr_id = ?`,
//         [pr.id]
//       );

//       // Fetch Single PR Details
//       const [singlePRDetails] = await connection.query(
//         `SELECT * FROM single_pr_details WHERE pr_id = ?`,
//         [pr.id]
//       );

//       // Add Related Data to PR Object
//       pr.targetCountries = targetCountries.length ? targetCountries : [];
//       pr.industryCategories = industryCategories.length
//         ? industryCategories
//         : [];
//       pr.planRecords = planRecords.length ? planRecords : [];
//       pr.singlePRDetails = singlePRDetails.length ? singlePRDetails : [];
//     }

//     res.status(200).json(prData);
//   } catch (error) {
//     console.error("Error fetching PRs:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

exports.getAllPRs = async (req, res) => {
  try {
    // Fetch all PR Data along with user and plan item data
    const [prData] = await connection.query(
      `SELECT pr.*, au.email, pi.planName, pi.totalPlanPrice, pi.priceSingle, pi.planDescription, pi.type, pi.pdfLink, pi.numberOfPR, pi.created_at AS plan_created_at, pi.updated_at AS plan_updated_at
       FROM pr_data pr
       JOIN auth_user au ON pr.user_id = au.auth_user_id
       JOIN plan_items pi ON pr.plan_id = pi.id
       ORDER BY pr.created_at DESC`
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "No PRs found" });
    }

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

      // Fetch Plan Record Data
      const [planRecords] = await connection.query(
        `SELECT * FROM plan_records WHERE pr_id = ?`,
        [pr.id]
      );

      // Fetch Single PR Details
      // Fetch Single PR Details
      const [singlePRDetails] = await connection.query(
        `SELECT spd.*, r.id AS report_id, r.title AS report_title,
                ref.excel_name, ref.excel_url,
                pdf.pdf_name AS pdf_name, pdf.pdf_url AS pdf_url
         FROM single_pr_details spd
         LEFT JOIN reports r ON spd.id = r.single_pr_id
         LEFT JOIN report_excel_files ref ON r.id = ref.report_id
         LEFT JOIN report_pr_pdfs pdf ON r.id = pdf.report_id
         WHERE spd.pr_id = ?`,
        [pr.id]
      );

      for (let spd of singlePRDetails) {
        const promises = [
          connection.query(`SELECT c.* FROM companies c WHERE c.id = ?`, [
            spd.company_id,
          ]),
          spd.pdf_id
            ? connection.query(
              `SELECT pdf.* FROM pr_pdf_files pdf WHERE pdf.id = ?`,
              [spd.pdf_id]
            )
            : Promise.resolve([[]]),
          connection.query(
            `SELECT t.*, ut.url
             FROM single_pr_tags spt
             JOIN tags t ON spt.tag_id = t.id
             JOIN pr_url_tags ut ON spt.single_pr_id = ut.single_pr_id
             WHERE spt.single_pr_id = ?`,
            [spd.id]
          ),
        ];

        const [company, pdfFile, tagsUrls] = await Promise.all(promises);
        pr.targetCountries = targetCountries.length ? targetCountries : null;
        pr.industryCategories = industryCategories.length
          ? industryCategories
          : null;
        pr.planRecords = planRecords.length ? planRecords : null;
        spd.company = company.length ? company[0] : null;
        spd.pdfFile = pdfFile.length ? pdfFile[0] : null;
        spd.tagsUrls = tagsUrls.length ? tagsUrls[0] : null;
        // Filter out null values in case no report data exists
        spd.reports = spd.report_id ? {
          id: spd.report_id,
          title: spd.report_title,
          excelFile: spd.excel_name ? {
            name: spd.excel_name,
            url: spd.excel_url
          } : null,
          pdfFile: spd.pdf_name ? {
            name: spd.pdf_name,
            url: spd.pdf_url
          } : null
        } : null;
      }

      // Add Single PR Details to PR Object
      pr.singlePRDetails = singlePRDetails;
    }

    res.status(200).json(prData);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ **Update PR Order Status (SuperAdmin)**
exports.updatePROrderStatusBySuperAdmin = async (req, res) => {
  try {
    const { prId } = req.params; // Extract the PR ID from route parameters
    const { newStatus, newPaymentStatus } = req.body; // Extract the new status and new payment status from the request body

    if (!prId) {
      return res
        .status(400)
        .json({ message: "PR ID is required for update the order " });
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

    // ✅ Update the status and payment status of the PR data
    const updateResult = await connection.query(
      "UPDATE pr_data SET pr_status = ?, payment_status = ? WHERE id = ?",
      [newStatus, newPaymentStatus, prId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "No change in status or payment status" });
    }

    // ✅ Add notification for the user
    await connection.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [
        userId,
        `PR Order ${prId} Status and Payment Updated`,
        `Your PR Order ${prId} status has been updated to ${newStatus} and payment status to ${newPaymentStatus}.`
      ]
    );

    res
      .status(200)
      .json({ message: "PR status and payment status updated successfully, notification sent" });
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
      `SELECT pr.*, au.email, pi.planName, pi.totalPlanPrice, pi.priceSingle, pi.planDescription, pi.pdfLink, pi.numberOfPR, pi.created_at AS plan_created_at, pi.updated_at AS plan_updated_at
       FROM pr_data pr
       JOIN auth_user au ON pr.user_id = au.auth_user_id
       JOIN plan_items pi ON pr.plan_id = pi.id
       ORDER BY pr.created_at DESC`
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

      // Fetch Plan Record Data
      const [planRecords] = await connection.query(
        `SELECT * FROM plan_records WHERE pr_id = ?`,
        [pr.id]
      );

      // Fetch Single PR Details
      // Fetch Single PR Details
      const [singlePRDetails] = await connection.query(
        `SELECT spd.*, r.id AS report_id, r.title AS report_title,
                ref.excel_name, ref.excel_url,
                pdf.pdf_name AS pdf_name, pdf.pdf_url AS pdf_url
         FROM single_pr_details spd
         LEFT JOIN reports r ON spd.id = r.single_pr_id
         LEFT JOIN report_excel_files ref ON r.id = ref.report_id
         LEFT JOIN report_pr_pdfs pdf ON r.id = pdf.report_id
         WHERE spd.pr_id = ?`,
        [pr.id]
      );

      for (let spd of singlePRDetails) {
        const promises = [
          connection.query(`SELECT c.* FROM companies c WHERE c.id = ?`, [
            spd.company_id,
          ]),
          spd.pdf_id
            ? connection.query(
              `SELECT pdf.* FROM pr_pdf_files pdf WHERE pdf.id = ?`,
              [spd.pdf_id]
            )
            : Promise.resolve([[]]),
          connection.query(
            `SELECT t.*, ut.url
             FROM single_pr_tags spt
             JOIN tags t ON spt.tag_id = t.id
             JOIN pr_url_tags ut ON spt.single_pr_id = ut.single_pr_id
             WHERE spt.single_pr_id = ?`,
            [spd.id]
          ),
        ];

        const [company, pdfFile, tagsUrls] = await Promise.all(promises);
        pr.targetCountries = targetCountries.length ? targetCountries : null;
        pr.industryCategories = industryCategories.length
          ? industryCategories
          : null;
        pr.planRecords = planRecords.length ? planRecords : null;
        spd.company = company.length ? company[0] : null;
        spd.pdfFile = pdfFile.length ? pdfFile[0] : null;
        spd.tagsUrls = tagsUrls.length ? tagsUrls[0] : null;
        // Filter out null values in case no report data exists
        spd.reports = spd.report_id ? {
          id: spd.report_id,
          title: spd.report_title,
          excelFile: spd.excel_name ? {
            name: spd.excel_name,
            url: spd.excel_url
          } : null,
          pdfFile: spd.pdf_name ? {
            name: spd.pdf_name,
            url: spd.pdf_url
          } : null
        } : null;
      }

      // Add Single PR Details to PR Object
      pr.singlePRDetails = singlePRDetails;
    }


    res.status(200).json(prData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.submitCustomOrder = async (req, res) => {
  const {
    planName,
    perma,
    totalPlanPrice,
    priceSingle,
    planDescription,
    pdfLink,
    numberOfPR,
    activate_plan = 0, // Default to inactive
    type,
    orderType,
    targetCountries,
    industryCategories,
    total_price,
    payment_status,
    payment_method,
    is_active = 0, // Default to inactive
  } = req.body;

  // Validate Required Fields
  if (
    !planName ||
    !perma ||
    !totalPlanPrice ||
    !priceSingle ||
    !planDescription ||
    !orderType ||
    !payment_method ||
    !targetCountries.length ||
    !industryCategories.length ||
    !total_price ||
    !payment_status
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction(); // Begin Transaction

    // 1. Insert Plan into `plan_items` if it doesn't exist
    let plan_id;
    const [existingPlan] = await dbConnection.query(
      "SELECT id FROM plan_items WHERE perma = ?",
      [perma]
    );

    if (existingPlan.length > 0) {
      // Plan already exists, use the existing ID
      plan_id = existingPlan[0].id;
    } else {
      // Insert new plan
      const [planResult] = await dbConnection.query(
        `INSERT INTO plan_items 
        (planName, perma, totalPlanPrice, priceSingle, planDescription, pdfLink, numberOfPR, activate_plan, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          planName,
          perma,
          totalPlanPrice,
          priceSingle,
          planDescription,
          pdfLink,
          numberOfPR,
          activate_plan,
          type,
        ]
      );
      plan_id = planResult.insertId; // Get newly inserted plan ID
    }

    // 2. Generate unique orderId and client_id
    const orderId = uuidv4();
    const client_id = uuidv4();

    // 3. Store Custom Order
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
        is_active ? 1 : 0,
      ]
    );
    const customOrderId = orderResult.insertId;

    // 4. Insert Target Countries with Translations
    let targetCountryIds = [];
    for (const country of targetCountries) {
      let translationId = null;
      if (country.translationRequired) {
        // const [translationResult] = await dbConnection.query(
        //   "INSERT INTO translation_required (translation) VALUES (?)",
        //   [country.translationRequired]
        // );
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

    // 5. Insert Industry Categories for the Order
    let industryCategoryIds = [];
    for (const category of industryCategories) {
      const [industryCategoryResult] = await dbConnection.query(
        "INSERT INTO industry_categories (categoryName, categoryPrice) VALUES (?, ?)",
        [category.name, category.price]
      );
      industryCategoryIds.push(industryCategoryResult.insertId);
    }

    // 6. Link Order to Target Countries
    for (const countryId of targetCountryIds) {
      await dbConnection.query(
        "INSERT INTO custom_order_target_countries (order_id, target_country_id) VALUES (?, ?)",
        [customOrderId, countryId]
      );
    }

    // 7. Link Order to Industry Categories
    for (const categoryId of industryCategoryIds) {
      await dbConnection.query(
        "INSERT INTO custom_order_industry_categories (order_id, industry_category_id) VALUES (?, ?)",
        [customOrderId, categoryId]
      );
    }

    // 8. Generate Invoice URL using the provided perma
    const invoiceUrl = `https://dashboard.imcwire.com/custom-invoice/${perma}`;

    await dbConnection.commit();
    res.status(201).json({
      message: "Custom order and plan submitted successfully",
      invoiceUrl,
      plan_id,
      orderId,
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
// exports.getCustomOrder = async (req, res) => {
//   const { perma } = req.params;
//   if (!perma) {
//     return res.status(400).json({ message: "Perma is required" });
//   }

//   let dbConnection;
//   try {
//     dbConnection = await connection.getConnection();

//     // 1. Fetch Custom Order Data by perma
//     const [orderResult] = await dbConnection.query(
//       "SELECT * FROM custom_orders WHERE perma = ?",
//       [perma]
//     );
//     if (orderResult.length === 0) {
//       return res.status(404).json({ message: "Order not found" });
//     }
//     const customOrder = orderResult[0];

//     // 2. Fetch Target Countries Linked to the Order
//     const [targetCountries] = await dbConnection.query(
//       `SELECT tc.id, tc.countryName, tc.countryPrice
//        FROM custom_order_target_countries cotc
//        JOIN target_countries tc ON cotc.target_country_id = tc.id
//        WHERE cotc.order_id = ?`,
//       [customOrder.id]
//     );

//     // 3. Fetch Industry Categories Linked to the Order
//     const [industryCategories] = await dbConnection.query(
//       `SELECT ic.id, ic.categoryName, ic.categoryPrice
//        FROM custom_order_industry_categories coic
//        JOIN industry_categories ic ON coic.industry_category_id = ic.id
//        WHERE coic.order_id = ?`,
//       [customOrder.id]
//     );

//     // 4. Build the Response, using the perma field for the invoice URL.
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
//       invoiceUrl: `https://dashboard.imcwire.com/custom-invoice/${customOrder.perma}`,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   } finally {
//     if (dbConnection) dbConnection.release();
//   }
// };

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
      `SELECT tc.id, tc.countryName, tc.countryPrice, tr.translation AS translationValue
       FROM custom_order_target_countries cotc
       JOIN target_countries tc ON cotc.target_country_id = tc.id
       LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
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

    // 4. Fetch Plan Details (Associated with the Custom Order)
    const [planResult] = await dbConnection.query(
      "SELECT * FROM plan_items WHERE id = ?",
      [customOrder.plan_id]
    );

    const planData = planResult.length ? planResult[0] : null;

    // 5. Build the Response
    const response = {
      plan_id: customOrder.plan_id,
      perma: customOrder.perma,
      orderType: customOrder.orderType,
      total_price: customOrder.total_price,
      payment_status: customOrder.payment_status,
      payment_method: customOrder.payment_method,
      is_active: customOrder.is_active,
      created_at: customOrder.created_at,
      targetCountries,
      industryCategories,
      planData: planData
        ? {
          plan_id: planData.id,
          planName: planData.planName,
          perma: planData.perma,
          totalPlanPrice: planData.totalPlanPrice,
          priceSingle: planData.priceSingle,
          planDescription: planData.planDescription,
          pdfLink: planData.pdfLink,
          numberOfPR: planData.numberOfPR,
          activate_plan: planData.activate_plan,
          type: planData.type,
        }
        : null,
      invoiceUrl: `https://dashboard.imcwire.com/custom-invoice/${customOrder.perma}`,
    };

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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

    // 1️⃣ Retrieve all orders sorted by `created_at DESC`
    const [orders] = await dbConnection.query(
      `SELECT co.*, pi.planName, pi.totalPlanPrice, pi.priceSingle, pi.planDescription, pi.pdfLink, 
              pi.numberOfPR, pi.activate_plan, pi.type 
       FROM custom_orders co
       LEFT JOIN plan_items pi ON co.plan_id = pi.id
       ORDER BY co.created_at DESC` // ✅ Latest orders appear first
    );

    // 2️⃣ Fetch all target countries (with translations)
    const [targetCountries] = await dbConnection.query(
      `SELECT ctc.order_id, tc.id, tc.countryName, tc.countryPrice, tr.translation AS translationValue 
       FROM custom_order_target_countries ctc
       JOIN target_countries tc ON ctc.target_country_id = tc.id
       LEFT JOIN translation_required tr ON tc.translation_required_id = tr.id
       ORDER BY ctc.order_id DESC` // ✅ Order by latest first
    );

    // 3️⃣ Fetch all industry categories
    const [industryCategories] = await dbConnection.query(
      `SELECT coic.order_id, ic.id, ic.categoryName, ic.categoryPrice 
       FROM custom_order_industry_categories coic
       JOIN industry_categories ic ON coic.industry_category_id = ic.id
       ORDER BY coic.order_id DESC` // ✅ Order by latest first
    );

    // 4️⃣ Map each order with its associated data
    const orderMap = {};

    for (let order of orders) {
      orderMap[order.id] = {
        orderId: order.orderId,
        client_id: order.client_id,
        perma: order.perma,
        orderType: order.orderType,
        total_price: order.total_price,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        is_active: order.is_active,
        created_at: order.created_at,
        invoiceUrl: `https://dashboard.imcwire.com/custom-invoice/${order.perma}`,
        plan: order.planName
          ? {
            plan_id: order.plan_id,
            planName: order.planName,
            totalPlanPrice: order.totalPlanPrice,
            priceSingle: order.priceSingle,
            planDescription: order.planDescription,
            pdfLink: order.pdfLink,
            numberOfPR: order.numberOfPR,
            activate_plan: order.activate_plan,
            type: order.type,
          }
          : null,
        targetCountries: [],
        industryCategories: [],
      };
    }

    // 5️⃣ Assign target countries to corresponding orders
    for (let country of targetCountries) {
      if (orderMap[country.order_id]) {
        orderMap[country.order_id].targetCountries.push({
          id: country.id,
          countryName: country.countryName,
          countryPrice: country.countryPrice,
          translationValue: country.translationValue || null,
        });
      }
    }

    // 6️⃣ Assign industry categories to corresponding orders
    for (let category of industryCategories) {
      if (orderMap[category.order_id]) {
        orderMap[category.order_id].industryCategories.push({
          id: category.id,
          categoryName: category.categoryName,
          categoryPrice: category.categoryPrice,
        });
      }
    }

    // 7️⃣ Convert object back to an array for API response
    const response = Object.values(orderMap);

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

exports.updateOrderOrPlanActivationByPerma = async (req, res) => {
  const { perma } = req.params; // ✅ Extract perma from the URL
  const { is_active, activate_plan } = req.body; // ✅ Extract fields from request body

  if (!perma) {
    return res.status(400).json({ message: "Perma is required in the URL" });
  }

  let dbConnection;
  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction(); // ✅ Start transaction

    // 1️⃣ Check if the order exists using perma
    const [orderResult] = await dbConnection.query(
      "SELECT orderId, plan_id FROM custom_orders WHERE perma = ?",
      [perma]
    );

    if (orderResult.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { orderId, plan_id } = orderResult[0];

    // 2️⃣ Update `is_active` (order activation) if provided
    if (is_active !== undefined) {
      await dbConnection.query(
        "UPDATE custom_orders SET is_active = ? WHERE perma = ?",
        [is_active ? 1 : 0, perma]
      );
    }

    // 3️⃣ Update `activate_plan` (plan activation) if provided & plan exists
    if (activate_plan !== undefined && plan_id) {
      await dbConnection.query(
        "UPDATE plan_items SET activate_plan = ? WHERE id = ?",
        [activate_plan ? 1 : 0, plan_id]
      );
    }

    await dbConnection.commit(); // ✅ Commit transaction

    res.status(200).json({
      message: "Order/Plan activation updated successfully",
      updated: {
        perma,
        orderId,
        is_active: is_active !== undefined ? is_active : "Not updated",
        activate_plan:
          activate_plan !== undefined ? activate_plan : "Not updated",
      },
    });
  } catch (error) {
    await dbConnection.rollback();
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
