const connection = require("../config/dbconfig");

// ✅ **Create a new company (Admin Only)**
exports.createCompany = async (req, res) => {
  let dbConnection;

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

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    const [result] = await dbConnection.query(
      `INSERT INTO companies 
      (user_id, companyName, address1, address2, contactName, phone, email, country, city, state, websiteUrl) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        companyName || null,
        address1 || null,
        address2 || null,
        contactName || null,
        phone || null,
        email || null,
        country || null,
        city || null,
        state || null,
        websiteUrl || null,
      ]
    );

    const companyId = result.insertId;

    // Commit transaction after successful company creation
    await dbConnection.commit();

    res.status(201).json({
      message: "Company added successfully",
      companyId,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback transaction if an error occurs
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (dbConnection) dbConnection.release(); // Release connection back to the pool
  }
};

// ✅ **Update an existing company (Admin Only, but only the owner can update)**
exports.updateCompany = async (req, res) => {
  let dbConnection;

  try {
    const { id, ...updatedData } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // Check if the company exists and belongs to the authenticated user
    const [company] = await dbConnection.query(
      "SELECT user_id FROM companies WHERE id = ?",
      [id]
    );

    if (!company.length) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company[0].user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this company" });
    }

    // Prepare dynamic query for updating only provided fields
    const queryParts = [];
    const values = [];

    Object.keys(updatedData).forEach((key) => {
      queryParts.push(`${key} = ?`);
      values.push(updatedData[key]);
    });

    values.push(id);

    if (queryParts.length > 0) {
      await dbConnection.query(
        `UPDATE companies SET ${queryParts.join(", ")} WHERE id = ?`,
        values
      );
    }

    // Commit transaction after a successful update
    await dbConnection.commit();

    res.status(200).json({ message: "Company updated successfully" });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback if any error occurs
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release(); // Release the connection back to the pool
  }
};

// ✅ **Get all companies for the authenticated user**
exports.getUserCompanies = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection(); // Get a DB connection from the pool

    const [companies] = await dbConnection.query(
      "SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json(companies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release(); // Release the connection back to the pool
  }
};

exports.getUserCompanyNames = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection(); // Get a DB connection from the pool

    const [companies] = await dbConnection.query(
      "SELECT id, companyName FROM companies WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.status(200).json(companies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) dbConnection.release(); // Release the connection back to the pool
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
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Super Admin: Get all companies**
exports.getAllCompanies = async (req, res) => {
  try {
    const [companies] = await connection.query(
      `SELECT 
          c.*, 
          u.email AS user_email,  -- ✅ Renamed to user_email 
          c.email AS company_email -- ✅ Renamed to company_email
       FROM companies AS c 
       INNER JOIN auth_user AS u ON c.user_id = u.auth_user_id 
       ORDER BY c.created_at DESC`
    );

    res.status(200).json(companies);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ **Super Admin: Get company details by company ID**
exports.getCompanyDetailsById = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const [company] = await connection.query(
      "SELECT * FROM companies WHERE id = ?",
      [company_id]
    );

    if (!company.length) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ **Super Admin: Get all companies of a specific user**
exports.getCompaniesByUserId = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Ensure only super admins can access this route
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Super Admin access required" });
    }

    const [companies] = await connection.query(
      "SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
