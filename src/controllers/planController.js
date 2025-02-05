const connection = require("../config/dbconfig");

// Create a new plan (Admin Only)
exports.createPlan = async (req, res) => {
  try {
    const {
      planName,
      perma,
      totalPlanPrice,
      priceSingle,
      planDescription,
      pdfLink,
      numberOfPR,
      activate_plan = true,
      type = "package",
    } = req.body;

    // ✅ Validate Required Fields
    if (!planName || !totalPlanPrice || !priceSingle || !numberOfPR || !perma) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check if Perma Already Exists
    const [existingPlan] = await connection.query(
      "SELECT id FROM plan_items WHERE perma = ?",
      [perma]
    );

    if (existingPlan.length > 0) {
      return res.status(409).json({ message: "Perma already exists, choose a unique perma" });
    }

    // ✅ Insert New Plan (if perma is unique)
    const [result] = await connection.query(
      "INSERT INTO plan_items (planName, perma, totalPlanPrice, priceSingle, planDescription, pdfLink, numberOfPR, activate_plan, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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

    res.status(201).json({ message: "Plan added successfully", planId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update an existing plan (Admin Only)
exports.updatePlan = async (req, res) => {
  try {
    const { perma } = req.params; // ✅ Extract `perma` from URL
    const { activate_plan } = req.body; // ✅ Extract only `activate_plan`

    if (!perma) {
      return res.status(400).json({ message: "Perma is required in the URL" });
    }

    if (activate_plan === undefined) {
      return res.status(400).json({ message: "activate_plan field is required in the request body" });
    }

    let dbConnection;
    try {
      dbConnection = await connection.getConnection();
      await dbConnection.beginTransaction(); // ✅ Start transaction

      // ✅ Check if the plan exists using perma
      const [planResult] = await dbConnection.query(
        "SELECT id FROM plan_items WHERE perma = ?",
        [perma]
      );

      if (planResult.length === 0) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // ✅ Update only `activate_plan`
      const [updateResult] = await dbConnection.query(
        "UPDATE plan_items SET activate_plan = ? WHERE perma = ?",
        [activate_plan ? 1 : 0, perma]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(400).json({ message: "No changes made, plan already in the requested state" });
      }

      await dbConnection.commit(); // ✅ Commit transaction

      res.status(200).json({
        message: "Plan activation updated successfully",
        updated: {
          perma,
          activate_plan,
        },
      });
    } catch (error) {
      await dbConnection.rollback(); // ❌ Rollback transaction on error
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
      if (dbConnection) dbConnection.release();
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// Get all plans (with optional filtering by type)
exports.getPlans = async (req, res) => {
  try {
    const { type } = req.query; // Extract query parameter

    let query = "SELECT * FROM plan_items";
    let values = [];

    // Check if a type is provided in the query
    if (type) {
      query += " WHERE type = ?";
      values.push(type);
    }

    query += " ORDER BY created_at DESC";

    const [plans] = await connection.query(query, values);

    res.status(200).json(plans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getActivePlans = async (req, res) => {
  try {
    // Define the query to select only id and name of active plans
    let query = `
      SELECT id, planName 
      FROM plan_items 
      WHERE activate_plan = 1 
      ORDER BY created_at DESC
    `;

    // Execute the query
    const [plans] = await connection.query(query);

    // Return the results in JSON format
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete a plan (Admin Only)
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    await connection.query("DELETE FROM plan_items WHERE id = ?", [id]);

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get a single plan by ID (Admin and User)
exports.getPlanById = async (req, res) => {
  try {
    const { perma } = req.params; // Extract the plan ID from route parameters

    if (!perma) {
      return res.status(400).json({ message: "Plan Perma is required" });
    }

    const [plans] = await connection.query(
      "SELECT * FROM plan_items WHERE perma = ?",
      [perma]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json(plans[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
