const connection = require("../config/dbconfig");

// ✅ **Create a new company (Admin Only)**
exports.createCompany = async (req, res) => {
  try {
    const {
      companyName,
      address1,
      address2,
      contactName,
      phone,
      email,
      country,
      city,
      state,
      websiteUrl,
    } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const [result] = await connection.query(
      "INSERT INTO companies (user_id, companyName, address1, address2, contactName, phone, email, country, city, state, websiteUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        companyName,
        address1,
        address2,
        contactName,
        phone,
        email,
        country,
        city,
        state,
        websiteUrl,
      ]
    );

    res
      .status(201)
      .json({
        message: "Company added successfully",
        companyId: result.insertId,
      });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Update an existing company (Admin Only)**
exports.updateCompany = async (req, res) => {
  try {
    const { id, ...updatedData } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const queryParts = [];
    const values = [];

    Object.keys(updatedData).forEach((key) => {
      queryParts.push(`${key} = ?`);
      values.push(updatedData[key]);
    });

    values.push(id);

    await connection.query(
      `UPDATE companies SET ${queryParts.join(", ")} WHERE id = ?`,
      values
    );

    res.status(200).json({ message: "Company updated successfully" });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Get all companies for the authenticated user**
exports.getUserCompanies = async (req, res) => {
  try {
    const [companies] = await connection.query(
      "SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Get company details by ID**
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const [company] = await connection.query(
      "SELECT * FROM companies WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (!company.length) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company[0]);
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Delete a company (Admin Only)**
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    await connection.query("DELETE FROM companies WHERE id = ?", [id]);

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
