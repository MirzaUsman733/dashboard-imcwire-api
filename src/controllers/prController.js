const connection = require("../config/dbconfig");

// ✅ **Submit Single PR with Auto Plan Record Creation & Status Handling**
exports.submitSinglePR = async (req, res) => {
  const { pr_id, company_id, pdf_file, url, tags } = req.body;
  const user_id = req.user.id;
  let dbConnection;

  if (!pr_id || !company_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ 1. Fetch PR data and verify ownership
    const [prData] = await dbConnection.query(
      "SELECT id, user_id, prType, payment_status, pr_status FROM pr_data WHERE id = ?",
      [pr_id]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "PR not found." });
    }

    const pr = prData[0];

    // ✅ 2. Check if PR belongs to the requesting user
    if (pr.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: This PR does not belong to you." });
    }

    // ✅ 3. Check if PR is paid
    if (pr.payment_status !== "paid") {
      return res.status(400).json({ message: "PR is not paid yet." });
    }

    // ✅ 4. Check if PR status is pending (Admin Approval Required)
    if (pr.pr_status === "pending") {
      return res
        .status(403)
        .json({ message: "Waiting for approval from the admin." });
    }

    // ✅ 5. Check if the company belongs to the authenticated user
    const [companyData] = await dbConnection.query(
      "SELECT id FROM companies WHERE id = ? AND user_id = ?",
      [company_id, user_id]
    );
    if (companyData.length === 0) {
      return res
        .status(404)
        .json({ message: "Company not found or does not belong to the user." });
    }

    const pr_type = pr.prType;
    // ✅ 6. Validate required fields based on PR type
    if (pr_type === "Self-Written") {
      if (!pdf_file) {
        return res
          .status(400)
          .json({ message: "PDF file is required for Self-Written PRs." });
      }
      if (url || (tags && tags.length > 0)) {
        return res.status(400).json({
          message: "URL and Tags are not allowed for Self-Written PRs.",
        });
      }
    } else if (pr_type === "IMCWire Written") {
      if (!url) {
        return res
          .status(400)
          .json({ message: "URL is required for IMCWire Written PRs." });
      }
      if (!tags || tags.length === 0) {
        return res.status(400).json({
          message: "Tags are required for IMCWire Written PRs.",
        });
      }
      if (pdf_file) {
        return res.status(400).json({
          message: "PDF file is not allowed for IMCWire Written PRs.",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid PR type." });
    }

    // ✅ 7. Get User's Active Plan
    let [planRecord] = await dbConnection.query(
      "SELECT id, used_prs, plan_id, total_prs FROM plan_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user_id]
    );

    let planId;
    let totalPrs;
    let usedPrs = 0;

    if (planRecord.length === 0) {
      // ✅ 8. If no active plan, create a new plan record
      const [userPlan] = await dbConnection.query(
        "SELECT plan_id FROM pr_data WHERE id = ? AND user_id = ?",
        [pr_id, user_id]
      );

      if (userPlan.length === 0) {
        return res
          .status(400)
          .json({ message: "No plan found for this user." });
      }

      const userPlanId = userPlan[0].plan_id;

      // ✅ 9. Get Total PRs from `plan_items`
      const [planItem] = await dbConnection.query(
        "SELECT numberOfPr FROM plan_items WHERE id = ?",
        [userPlanId]
      );

      if (planItem.length === 0) {
        return res.status(400).json({ message: "Plan details not found." });
      }

      totalPrs = planItem[0].numberOfPr;

      // ✅ 10. Create a new `plan_records` entry for the user
      const [newPlanRecord] = await dbConnection.query(
        "INSERT INTO plan_records (user_id, plan_id, total_prs, used_prs) VALUES (?, ?, ?, ?)",
        [user_id, userPlanId, totalPrs, 0]
      );

      planId = newPlanRecord.insertId;
    } else {
      planId = planRecord[0].id;
      totalPrs = planRecord[0].total_prs;
      usedPrs = planRecord[0].used_prs;
    }

    if (usedPrs >= totalPrs) {
      return res
        .status(400)
        .json({ message: "PR limit reached for this plan." });
    }

    // ✅ 11. Insert Single PR Details with Status 'Not Started'
    const [singlePrResult] = await dbConnection.query(
      "INSERT INTO single_pr_details (pr_id, user_id, company_id, pr_type, pdf_file, url, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        pr_id,
        user_id,
        company_id,
        pr_type,
        pdf_file || null,
        url || null,
        "Not Started",
      ]
    );
    const singlePrId = singlePrResult.insertId;

    // ✅ 12. If IMCWire-Written, Insert Tags
    if (pr_type === "IMCWire Written" && tags && tags.length > 0) {
      for (const tag of tags) {
        let tagId;
        const [existingTag] = await dbConnection.query(
          "SELECT id FROM tags WHERE name = ?",
          [tag]
        );

        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const [tagInsert] = await dbConnection.query(
            "INSERT INTO tags (name) VALUES (?)",
            [tag]
          );
          tagId = tagInsert.insertId;
        }

        await dbConnection.query(
          "INSERT INTO single_pr_tags (single_pr_id, tag_id) VALUES (?, ?)",
          [singlePrId, tagId]
        );
      }
    }

    // ✅ 13. Update Plan Usage Only If PR Is Not Rejected
    if (pr_type !== "Rejected") {
      await dbConnection.query(
        "UPDATE plan_records SET used_prs = used_prs + 1 WHERE id = ?",
        [planId]
      );
    }

    await dbConnection.commit();

    res.status(201).json({
      message: "Single PR submitted successfully.",
      pr_id: singlePrId,
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
