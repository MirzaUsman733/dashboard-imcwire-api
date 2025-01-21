const connection = require("../config/dbconfig");

// Create a new plan (Admin Only)
exports.createPlan = async (req, res) => {
  try {
    const { planName, totalPlanPrice, priceSingle, planDescription, pdfLink, numberOfPR } = req.body;

    if (!planName || !totalPlanPrice || !priceSingle || !numberOfPR) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await connection.query(
      "INSERT INTO plan_items (planName, totalPlanPrice, priceSingle, planDescription, pdfLink, numberOfPR) VALUES (?, ?, ?, ?, ?, ?)",
      [planName, totalPlanPrice, priceSingle, planDescription, pdfLink, numberOfPR]
    );

    res.status(201).json({ message: "Plan added successfully", planId: result.insertId });
  } catch (error) {
    console.error("Error adding plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update an existing plan (Admin Only)
exports.updatePlan = async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    const queryParts = [];
    const values = [];

    Object.keys(updatedData).forEach((key) => {
      queryParts.push(`${key} = ?`);
      values.push(updatedData[key]);
    });

    values.push(id);

    await connection.query(
      `UPDATE plan_items SET ${queryParts.join(", ")} WHERE id = ?`,
      values
    );

    res.status(200).json({ message: "Plan updated successfully" });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all plans
exports.getPlans = async (req, res) => {
  try {
    const [plans] = await connection.query("SELECT * FROM plan_items ORDER BY created_at DESC");
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
    console.error("Error deleting plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
