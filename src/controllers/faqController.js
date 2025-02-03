const connection = require("../config/dbconfig");

exports.getAllFaqs = async (req, res) => {
  try {
    const [faqs] = await connection.query("SELECT * FROM faqs");
    res.json(faqs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching FAQs", error: error.message });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const [faqs] = await connection.query("SELECT * FROM faqs WHERE id = ?", [
      req.params.id,
    ]);
    if (faqs.length === 0) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.json(faqs[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching FAQ", error: error.message });
  }
};

exports.createFaq = async (req, res) => {
  const faqs = req.body; // Expecting an array of FAQ objects
  let dbConnection;

  try {
    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ message: "Invalid FAQ data provided" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    const insertResults = [];
    for (const faq of faqs) {
      const { question, answer } = faq;

      if (!question || !answer) {
        await dbConnection.rollback();
        return res
          .status(400)
          .json({ message: "Both question and answer are required" });
      }

      const [result] = await dbConnection.query(
        "INSERT INTO faqs (question, answer) VALUES (?, ?)",
        [question, answer]
      );

      insertResults.push({
        id: result.insertId,
        question,
        answer,
      });
    }

    // ✅ **Commit transaction after successful FAQ insertions**
    await dbConnection.commit();
    dbConnection.release();

    res.status(201).json(insertResults);
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Error creating FAQs",
      error: error.sqlMessage || error.message,
    });
  }
};

exports.updateFaq = async (req, res) => {
  const { question, answer } = req.body;
  const { id } = req.params;

  let dbConnection;

  try {
    if (!id) {
      return res.status(400).json({ message: "FAQ ID is required" });
    }

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Both question and answer are required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Check if FAQ exists**
    const [faq] = await dbConnection.query("SELECT * FROM faqs WHERE id = ?", [
      id,
    ]);

    if (faq.length === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "FAQ not found" });
    }

    // ✅ **Update FAQ**
    await dbConnection.query(
      "UPDATE faqs SET question = ?, answer = ? WHERE id = ?",
      [question, answer, id]
    );

    // ✅ **Commit transaction after successful update**
    await dbConnection.commit();
    dbConnection.release();

    res.status(200).json({ message: "FAQ updated successfully" });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Error updating FAQ",
      error: error.sqlMessage || error.message,
    });
  }
};

exports.deleteFaq = async (req, res) => {
  const { id } = req.params;
  let dbConnection;

  try {
    if (!id) {
      return res.status(400).json({ message: "FAQ ID is required" });
    }

    dbConnection = await connection.getConnection(); // Get a DB connection from the pool
    await dbConnection.beginTransaction(); // Start a transaction

    // ✅ **Check if FAQ exists before deleting**
    const [faq] = await dbConnection.query("SELECT * FROM faqs WHERE id = ?", [
      id,
    ]);

    if (faq.length === 0) {
      await dbConnection.rollback();
      return res.status(404).json({ message: "FAQ not found" });
    }

    // ✅ **Delete FAQ**
    await dbConnection.query("DELETE FROM faqs WHERE id = ?", [id]);

    // ✅ **Commit transaction after successful deletion**
    await dbConnection.commit();
    dbConnection.release();

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback(); // Rollback in case of an error
    if (dbConnection) dbConnection.release(); // Ensure the connection is released

    res.status(500).json({
      message: "Error deleting FAQ",
      error: error.sqlMessage || error.message,
    });
  }
};
