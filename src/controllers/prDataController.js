const connection = require("../config/dbconfig");
const stripe = require("stripe")(process.env.EXPRESS_STRIPE_SECRET_KEY);

// ✅ **Submit PR & Initialize Plan Records if Not Exists**
// exports.submitPR = async (req, res) => {
//   const {
//     client_id,
//     plan_id,
//     prType,
//     pr_status,
//     payment_method,
//     targetCountries, // Array of { name, price, translationRequired }
//     industryCategories, // Array of { name, price }
//     total_price,
//     payment_status,
//   } = req.body;

//   if (
//     !client_id ||
//     !plan_id ||
//     !prType ||
//     !payment_method ||
//     !targetCountries.length ||
//     !industryCategories.length ||
//     !total_price ||
//     !pr_status ||
//     !payment_status
//   ) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const connectionPromise = connection.getConnection(); // Get DB connection for transaction
//   let dbConnection;

//   try {
//     dbConnection = await connectionPromise;
//     await dbConnection.beginTransaction(); // Begin Transaction

//     // ✅ 1. Check if Plan Record Exists
//     let [planRecord] = await dbConnection.query(
//       "SELECT id FROM plan_records WHERE user_id = ? AND plan_id = ?",
//       [req.user.id, plan_id]
//     );

//     if (planRecord.length === 0) {
//       // ✅ 2. Get Total PRs from `plan_items`
//       const [planItem] = await dbConnection.query(
//         "SELECT numberOfPR FROM plan_items WHERE id = ?",
//         [plan_id]
//       );

//       if (planItem.length === 0) {
//         return res.status(400).json({ message: "Plan details not found." });
//       }

//       const totalPrs = planItem[0].numberOfPR;

//       // ✅ 3. Initialize `plan_records`
//       const [newPlanRecord] = await dbConnection.query(
//         "INSERT INTO plan_records (user_id, plan_id, total_prs, used_prs) VALUES (?, ?, ?, ?)",
//         [req.user.id, plan_id, totalPrs, 0]
//       );

//       planRecord = [{ id: newPlanRecord.insertId }];
//     }

//     // ✅ 4. Insert Multiple Target Countries with Individual Translations
//     let targetCountryIds = [];
//     for (const country of targetCountries) {
//       let translationId = null;
//       if (country.translationRequired) {
//         const [translationResult] = await dbConnection.query(
//           "INSERT INTO translation_required (translation, translationPrice) VALUES (?, ?)",
//           [country.translationRequired, country.translationPrice]
//         );

//         translationId = translationResult.insertId;
//       }

//       const [targetCountryResult] = await dbConnection.query(
//         "INSERT INTO target_countries (countryName, countryPrice, translation_required_id) VALUES (?, ?, ?)",
//         [country.name, country.price, translationId]
//       );
//       targetCountryIds.push(targetCountryResult.insertId);
//     }

//     // ✅ 5. Insert Multiple Industry Categories
//     let industryCategoryIds = [];
//     for (const category of industryCategories) {
//       const [industryCategoryResult] = await dbConnection.query(
//         "INSERT INTO industry_categories (categoryName, categoryPrice) VALUES (?, ?)",
//         [category.name, category.price]
//       );
//       industryCategoryIds.push(industryCategoryResult.insertId);
//     }

//     // ✅ 6. Insert PR Data
//     const [prResult] = await dbConnection.query(
//       "INSERT INTO pr_data (client_id, user_id, plan_id, prType, pr_status, payment_method, total_price, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         client_id,
//         req.user.id,
//         plan_id,
//         prType,
//         pr_status,
//         payment_method,
//         total_price,
//         payment_status,
//       ]
//     );
//     const prId = prResult.insertId;

//     // ✅ 7. Link PR to Multiple Target Countries
//     for (const countryId of targetCountryIds) {
//       await dbConnection.query(
//         "INSERT INTO pr_target_countries (pr_id, target_country_id) VALUES (?, ?)",
//         [prId, countryId]
//       );
//     }

//     // ✅ 8. Link PR to Multiple Industry Categories
//     for (const categoryId of industryCategoryIds) {
//       await dbConnection.query(
//         "INSERT INTO pr_industry_categories (pr_id, target_industry_id) VALUES (?, ?)",
//         [prId, categoryId]
//       );
//     }

//     await dbConnection.commit(); // Commit Transaction

//     res.status(201).json({
//       message: "PR submitted successfully",
//     });
//   } catch (error) {
//     if (dbConnection) {
//       await dbConnection.rollback();
//     }
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// ✅ **Submit PR & Initialize Plan Records if Not Exists**
exports.submitPR = async (req, res) => {
  const {
    client_id,
    plan_id,
    prType,
    pr_status,
    payment_method,
    targetCountries, // Array of { name, price, translationRequired }
    industryCategories, // Array of { name, price }
    total_price,
    payment_status,
  } = req.body;

  if (
    !client_id ||
    !plan_id ||
    !prType ||
    !payment_method ||
    !targetCountries.length ||
    !industryCategories.length ||
    !total_price ||
    !pr_status ||
    !payment_status
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction(); // Begin Transaction

    // ✅ 1. Fetch User Email from `auth_user`
    const [userResult] = await dbConnection.query(
      "SELECT email FROM auth_user WHERE auth_user_id = ?",
      [req.user.id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User email not found." });
    }

    const userEmail = userResult[0].email;

    // ✅ 2. Check if Plan Record Exists
    // let [planRecord] = await dbConnection.query(
    //   "SELECT id FROM plan_records WHERE user_id = ? AND plan_id = ?",
    //   [req.user.id, plan_id]
    // );

    // if (planRecord.length === 0) {
    // ✅ 3. Get Total PRs from `plan_items`
    const [planItem] = await dbConnection.query(
      "SELECT numberOfPR FROM plan_items WHERE id = ?",
      [plan_id]
    );

    if (planItem.length === 0) {
      return res.status(400).json({ message: "Plan details not found." });
    }

    const totalPrs = planItem[0].numberOfPR;

    // ✅ 3. Always Create a New `plan_record` for Each PR Submission
    const [newPlanRecord] = await dbConnection.query(
      "INSERT INTO plan_records (user_id, plan_id, total_prs, used_prs) VALUES (?, ?, ?, ?)",
      [req.user.id, plan_id, totalPrs, 0] // `used_prs` starts from 1 because it's a new PR
    );

    const planRecordId = newPlanRecord.insertId;
    // }

    // ✅ 5. Insert Multiple Target Countries with Individual Translations
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
      "INSERT INTO pr_data (client_id, user_id, plan_id, prType, pr_status, payment_method, total_price, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        client_id,
        req.user.id,
        plan_id,
        prType,
        pr_status,
        payment_method,
        total_price,
        payment_status,
      ]
    );
    const prId = prResult.insertId;

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

    // ✅ 10. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: total_price * 100, // Convert to cents
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

    await dbConnection.commit(); // Commit Transaction

    res.status(201).json({
      message: "PR submitted successfully",
      stripeSessionUrl: session.url,
    });
  } catch (error) {
    if (dbConnection) {
      await dbConnection.rollback();
    }
    console.error("Error in submitPR:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
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
