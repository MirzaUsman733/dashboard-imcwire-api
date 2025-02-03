const connection = require("../config/dbconfig");

// Get all records
exports.getAll = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    const [results] = await dbConnection.query("SELECT * FROM how_it_works");

    res.status(201).json({
      message: "How It Works data retrieved successfully",
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

exports.getById = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    const [results] = await dbConnection.query(
      "SELECT * FROM how_it_works WHERE id = ?",
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(201).json({
      message: "How It Works record retrieved successfully",
      data: results[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// Create new record
exports.create = async (req, res) => {
  let dbConnection;

  try {
    const { title, youtube_channel } = req.body;

    if (!title || !youtube_channel) {
      return res.status(400).json({ message: "All fields required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Insert Data**
    const [result] = await dbConnection.query(
      "INSERT INTO how_it_works (title, youtube_channel) VALUES (?, ?)",
      [title, youtube_channel]
    );

    // ✅ **Commit transaction after successful insertion**
    await dbConnection.commit();
    dbConnection.release();

    res.status(201).json({
      message: "How IT Works added successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Internal Server Error",
      error: error.sqlMessage || error.message,
    });
  }
};

// Update record by ID
exports.update = async (req, res) => {
  let dbConnection;

  try {
    const { title, youtube_channel } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    if (!title || !youtube_channel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Check if the record exists**
    const [record] = await dbConnection.query(
      "SELECT id FROM how_it_works WHERE id = ?",
      [id]
    );

    if (record.length === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "Record not found" });
    }

    // ✅ **Update Record**
    const [result] = await dbConnection.query(
      "UPDATE how_it_works SET title = ?, youtube_channel = ? WHERE id = ?",
      [title, youtube_channel, id]
    );

    if (result.affectedRows === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "No changes made" });
    }

    // ✅ **Commit transaction after successful update**
    await dbConnection.commit();
    dbConnection.release();

    res.json({ message: "Record updated successfully" });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Internal Server Error",
      error: error.sqlMessage || error.message,
    });
  }
};


exports.delete = async (req, res) => {
  let dbConnection;

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Check if the record exists before deleting**
    const [record] = await dbConnection.query(
      "SELECT id FROM how_it_works WHERE id = ?",
      [id]
    );

    if (record.length === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "Record not found" });
    }

    // ✅ **Delete Record**
    const [result] = await dbConnection.query(
      "DELETE FROM how_it_works WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "No record found to delete" });
    }

    // ✅ **Commit transaction after successful deletion**
    await dbConnection.commit();
    dbConnection.release();

    res.status(200).json({
      message: "How It Works record deleted successfully",
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Internal Server Error",
      error: error.sqlMessage || error.message,
    });
  }
};
