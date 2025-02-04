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

    if (!planName || !totalPlanPrice || !priceSingle || !numberOfPR || !perma) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    res
      .status(201)
      .json({ message: "Plan added successfully", planId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update an existing plan (Admin Only)
exports.updatePlan = async (req, res) => {
  try {
    const {
      id,
      planName,
      totalPlanPrice,
      priceSingle,
      planDescription,
      pdfLink,
      numberOfPR,
      activate_plan,
      type,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const queryParts = [];
    const values = [];

    if (planName !== undefined) {
      queryParts.push("planName = ?");
      values.push(planName);
    }
    if (totalPlanPrice !== undefined) {
      queryParts.push("totalPlanPrice = ?");
      values.push(totalPlanPrice);
    }
    if (priceSingle !== undefined) {
      queryParts.push("priceSingle = ?");
      values.push(priceSingle);
    }
    if (planDescription !== undefined) {
      queryParts.push("planDescription = ?");
      values.push(planDescription);
    }
    if (pdfLink !== undefined) {
      queryParts.push("pdfLink = ?");
      values.push(pdfLink);
    }
    if (numberOfPR !== undefined) {
      queryParts.push("numberOfPR = ?");
      values.push(numberOfPR);
    }
    if (activate_plan !== undefined) {
      queryParts.push("activate_plan = ?");
      values.push(activate_plan);
    }
    if (type !== undefined) {
      queryParts.push("type = ?");
      values.push(type);
    }

    if (queryParts.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    values.push(id);

    await connection.query(
      `UPDATE plan_items SET ${queryParts.join(", ")} WHERE id = ?`,
      values
    );

    res.status(200).json({ message: "Plan updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
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
    const { id } = req.params; // Extract the plan ID from route parameters

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const [plans] = await connection.query(
      "SELECT * FROM plan_items WHERE id = ?",
      [id]
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
