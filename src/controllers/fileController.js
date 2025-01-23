const { Client } = require("basic-ftp");
const db = require("../config/dbconfig");
const ftpConfig = require("../config/ftpConfig");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ✅ Upload PR (Handles Both PDF & URL)
async function uploadPR(req, res) {
  try {
    const { pr_id, user_id, company_id, pr_type, url, tags } = req.body;
    const pdfFile = req.file;

    if (!pr_id || !user_id || !company_id || !pr_type) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ✅ Insert into `single_pr_details` first
    const [insertResult] = await db.query(
      "INSERT INTO single_pr_details (pr_id, user_id, company_id, pr_type) VALUES (?, ?, ?, ?)",
      [pr_id, user_id, company_id, pr_type]
    );
    const singlePrId = insertResult.insertId;

    if (pr_type === "Self-Written") {
      if (!pdfFile) {
        return res.status(400).json({ error: "No PDF file provided." });
      }

      // ✅ Generate Unique ID for PDF
      const uniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const pdfPath = pdfFile.path;
      const pdfFirstChar = sanitizedPdfName[0].toLowerCase();
      const newFileName = `${uniqueId}_${sanitizedPdfName}`;
      const ftpFilePath = `/public_html/files/uploads/pdf-Data/${pdfFirstChar}/${newFileName}`;

      // ✅ Upload PDF to FTP
      const client = new Client();
      await client.access(ftpConfig);
      await client.ensureDir(
        `/public_html/files/uploads/pdf-Data/${pdfFirstChar}`
      );
      await client.uploadFrom(pdfPath, ftpFilePath);
      client.close();
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

      // ✅ Insert into `pr_pdf_files`
      const [pdfInsert] = await db.query(
        "INSERT INTO pr_pdf_files (single_pr_id, unique_id, pdf_file, url) VALUES (?, ?, ?, ?)",
        [
          singlePrId,
          uniqueId,
          newFileName,
          ftpFilePath.replace("/public_html/files", ""),
        ]
      );

      // ✅ Update `single_pr_details` with `pdf_id`
      await db.query("UPDATE single_pr_details SET pdf_id = ? WHERE id = ?", [
        pdfInsert.insertId,
        singlePrId,
      ]);

      return res.status(201).json({
        message: "PR uploaded successfully (Self-Written).",
        unique_id: uniqueId,
        pdf_name: newFileName,
        pdf_path: ftpFilePath.replace("/public_html/files", ""),
      });
    } else if (pr_type === "IMCWire-Written") {
      if (!url) {
        return res
          .status(400)
          .json({ error: "URL is required for IMCWire-Written PR." });
      }

      // ✅ Insert into `pr_url_tags`
      const [urlInsert] = await db.query(
        "INSERT INTO pr_url_tags (single_pr_id, url) VALUES (?, ?)",
        [singlePrId, url]
      );

      // ✅ Insert Tags (if provided)
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          let [tagRow] = await db.query("SELECT id FROM tags WHERE name = ?", [
            tag,
          ]);

          if (tagRow.length === 0) {
            const [newTag] = await db.query(
              "INSERT INTO tags (name) VALUES (?)",
              [tag]
            );
            tagRow = [{ id: newTag.insertId }];
          }

          await db.query(
            "INSERT INTO single_pr_tags (pr_url_tags_id, tag_id) VALUES (?, ?)",
            [urlInsert.insertId, tagRow[0].id]
          );
        }
      }

      // ✅ Update `single_pr_details` with `url_tags_id`
      await db.query(
        "UPDATE single_pr_details SET url_tags_id = ? WHERE id = ?",
        [urlInsert.insertId, singlePrId]
      );

      return res.status(201).json({
        message: "PR uploaded successfully (IMCWire-Written).",
        url: url,
        tags: tags || [],
      });
    }
  } catch (error) {
    console.error("Error during PR upload:", error);
    res.status(500).json({ error: "Something went wrong during PR upload." });
  }
}
