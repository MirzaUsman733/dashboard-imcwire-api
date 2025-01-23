const db = require("../config/dbconfig")

exports.getAllFaqs = async (req, res) => {
  try {
    const [faqs] = await db.query("SELECT * FROM faqs")
    res.json(faqs)
  } catch (error) {
    res.status(500).json({ message: "Error fetching FAQs", error: error.message })
  }
}

exports.getFaqById = async (req, res) => {
  try {
    const [faqs] = await db.query("SELECT * FROM faqs WHERE id = ?", [req.params.id])
    if (faqs.length === 0) {
      return res.status(404).json({ message: "FAQ not found" })
    }
    res.json(faqs[0])
  } catch (error) {
    res.status(500).json({ message: "Error fetching FAQ", error: error.message })
  }
}

exports.createFaq = async (req, res) => {
    const faqs = req.body; // Expecting an array of FAQ objects
    try {
      const insertPromises = faqs.map(faq => {
        const { question, answer } = faq;
        return db.query("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer]);
      });
  
      // Wait for all insertions to complete
      const results = await Promise.all(insertPromises);
  
      // Map results to get the inserted IDs
      const insertedFaqs = results.map((result, index) => ({
        id: result[0].insertId,
        ...faqs[index]
      }));
  
      res.status(201).json(insertedFaqs);
    } catch (error) {
      res.status(500).json({ message: "Error creating FAQs", error: error.message });
    }
  }

exports.updateFaq = async (req, res) => {
  const { question, answer } = req.body
  try {
    await db.query("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, req.params.id])
    res.json({ message: "FAQ updated successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error updating FAQ", error: error.message })
  }
}

exports.deleteFaq = async (req, res) => {
  try {
    await db.query("DELETE FROM faqs WHERE id = ?", [req.params.id])
    res.json({ message: "FAQ deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting FAQ", error: error.message })
  }
}

