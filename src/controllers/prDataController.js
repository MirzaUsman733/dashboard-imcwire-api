const connection = require("../config/dbconfig");

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

  const connectionPromise = connection.getConnection(); // Get DB connection for transaction
  let dbConnection;

  try {
    dbConnection = await connectionPromise;
    await dbConnection.beginTransaction(); // Begin Transaction

    // ✅ 1. Check if Plan Record Exists
    let [planRecord] = await dbConnection.query(
      "SELECT id FROM plan_records WHERE user_id = ? AND plan_id = ?",
      [req.user.id, plan_id]
    );

    if (planRecord.length === 0) {
      // ✅ 2. Get Total PRs from `plan_items`
      const [planItem] = await dbConnection.query(
        "SELECT numberOfPR FROM plan_items WHERE id = ?",
        [plan_id]
      );

      if (planItem.length === 0) {
        return res.status(400).json({ message: "Plan details not found." });
      }

      const totalPrs = planItem[0].numberOfPR;

      // ✅ 3. Initialize `plan_records`
      const [newPlanRecord] = await dbConnection.query(
        "INSERT INTO plan_records (user_id, plan_id, total_prs, used_prs) VALUES (?, ?, ?, ?)",
        [req.user.id, plan_id, totalPrs, 0]
      );

      planRecord = [{ id: newPlanRecord.insertId }];
    }

    // ✅ 4. Insert Multiple Target Countries with Individual Translations
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

    // ✅ 5. Insert Multiple Industry Categories
    let industryCategoryIds = [];
    for (const category of industryCategories) {
      const [industryCategoryResult] = await dbConnection.query(
        "INSERT INTO industry_categories (categoryName, categoryPrice) VALUES (?, ?)",
        [category.name, category.price]
      );
      industryCategoryIds.push(industryCategoryResult.insertId);
    }

    // ✅ 6. Insert PR Data
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

    // ✅ 7. Link PR to Multiple Target Countries
    for (const countryId of targetCountryIds) {
      await dbConnection.query(
        "INSERT INTO pr_target_countries (pr_id, target_country_id) VALUES (?, ?)",
        [prId, countryId]
      );
    }

    // ✅ 8. Link PR to Multiple Industry Categories
    for (const categoryId of industryCategoryIds) {
      await dbConnection.query(
        "INSERT INTO pr_industry_categories (pr_id, target_industry_id) VALUES (?, ?)",
        [prId, categoryId]
      );
    }

    await dbConnection.commit(); // Commit Transaction

    res.status(201).json({
      message: "PR submitted successfully",
    });
  } catch (error) {
    if (dbConnection) {
      await dbConnection.rollback();
    }
    console.error("Error submitting PR:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
    console.error("Error retrieving user PR data:", error);
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
    console.error("Error retrieving all PR data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
