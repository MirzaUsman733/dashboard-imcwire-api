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
  console.log(req.body);
  try {
    const { title, youtube_channel } = req.body;
    if (!title || !youtube_channel)
      return res.status(400).json({ message: "All fields required" });

    const [result] = await connection.query(
      "INSERT INTO how_it_works (title, youtube_channel) VALUES (?, ?)",
      [title, youtube_channel]
    );
    res.status(201).json({
      message: "How IT Works added successfully",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update record by ID
exports.update = async (req, res) => {
  try {
    const { title, youtube_channel } = req.body;
    const { id } = req.params;

    if (!title || !youtube_channel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await connection.query(
      "UPDATE how_it_works SET title = ?, youtube_channel = ? WHERE id = ?",
      [title, youtube_channel, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ message: "Record updated successfully" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();
    const [result] = await dbConnection.query(
      "DELETE FROM how_it_works WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.status(201).json({
      message: "How It Works record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};



