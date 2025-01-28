const connection = require("../config/dbconfig");
const { Client } = require("basic-ftp");
const ftpConfig = require("../config/ftpConfig");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "Orders@imcwire.com",
    pass: "Sales@$$1aShahG!!boy,s",
  },
});

exports.submitSinglePR = async (req, res) => {
  let dbConnection;
  try {
    const isFormData = req.headers["content-type"]?.includes(
      "multipart/form-data"
    );

    // ✅ Extract Fields
    let { pr_id, company_id, url, tags } = req.body;
    const pdfFile = isFormData ? req.file : null;
    const user_id = req.user?.id;

    if (!pr_id || !company_id) {
      return res
        .status(400)
        .json({ message: "Missing required fields: pr_id or company_id." });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ 1. Fetch PR Data and Verify Ownership
    const [prData] = await dbConnection.query(
      "SELECT id, user_id, prType, plan_id, payment_status, pr_status FROM pr_data WHERE id = ?",
      [pr_id]
    );

    if (prData.length === 0)
      return res.status(404).json({ message: "PR not found." });

    const pr = prData[0];
    const plan_id = pr.plan_id;
    // ✅ 2. Validate PR Ownership, Payment, and Approval
    if (pr.user_id !== user_id)
      return res.status(403).json({ message: "Unauthorized PR access." });
    if (pr.payment_status !== "paid")
      return res.status(400).json({ message: "PR not paid." });
    if (pr.pr_status === "pending")
      return res.status(403).json({ message: "Waiting for admin approval." });

    // ✅ 3. Check Company Ownership
    const [companyData] = await dbConnection.query(
      "SELECT id FROM companies WHERE id = ? AND user_id = ?",
      [company_id, user_id]
    );

    if (companyData.length === 0)
      return res
        .status(404)
        .json({ message: "Company not found or unauthorized." });

    const pr_type = pr.prType;

    // ✅ 4. Validate Required Fields Based on PR Type
    if (pr_type === "Self-Written") {
      if (!pdfFile)
        return res
          .status(400)
          .json({ message: "PDF required for Self-Written PRs." });
      if (url || (tags && tags.length > 0))
        return res
          .status(400)
          .json({ message: "URL/Tags not allowed for Self-Written PRs." });
    } else if (pr_type === "IMCWire Written") {
      if (!url)
        return res
          .status(400)
          .json({ message: "URL required for IMCWire-Written PRs." });
      if (!tags || tags.length === 0)
        return res
          .status(400)
          .json({ message: "Tags required for IMCWire-Written PRs." });
      if (pdfFile)
        return res
          .status(400)
          .json({ message: "PDF not allowed for IMCWire-Written PRs." });
    } else {
      return res.status(400).json({ message: "Invalid PR type." });
    }

    // ✅ 5. Insert PR Record
    const [singlePrResult] = await dbConnection.query(
      "INSERT INTO single_pr_details (pr_id, user_id, company_id, pr_type) VALUES (?, ?, ?, ?)",
      [pr_id, user_id, company_id, pr_type]
    );
    // ✅ 6. Update Plan Record (Increment Used PRs)
    await dbConnection.query(
      "UPDATE plan_records SET used_prs = used_prs + 1 WHERE user_id = ? AND plan_id = ? AND pr_id = ?",
      [user_id, plan_id, pr_id]
    );
    console.log(pr_type);
    console.log(singlePrResult);
    const singlePrId = singlePrResult.insertId;
    console.log(singlePrId);
    // ✅ 6. Handle PR Upload Based on Type
    if (pr_type === "Self-Written") {
      // ✅ Generate Unique File Name
      const uniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const pdfFirstChar = sanitizedPdfName[0].toLowerCase();
      const newFileName = `${uniqueId}_${sanitizedPdfName}`;
      const saveFileName = sanitizedPdfName;
      const ftpFilePath = `/public_html/files/uploads/pdf-Data/${pdfFirstChar}/${newFileName}`;

      // ✅ Write Buffer to a Temp File Before Uploading
      const tempFilePath = path.join(os.tmpdir(), newFileName);
      fs.writeFileSync(tempFilePath, pdfFile.buffer);

      // ✅ Upload PDF Directly to FTP from the Temp File
      const client = new Client();
      await client.access(ftpConfig);
      await client.ensureDir(
        `/public_html/files/uploads/pdf-Data/${pdfFirstChar}`
      );

      // ✅ Upload from Temp File (Fixing `source.once` error)
      await client.uploadFrom(tempFilePath, ftpFilePath);
      client.close();

      // ✅ Insert into `pr_pdf_files`
      const [pdfInsert] = await dbConnection.query(
        "INSERT INTO pr_pdf_files (single_pr_id, unique_id, pdf_file, url) VALUES (?, ?, ?, ?)",
        [
          singlePrId,
          uniqueId,
          saveFileName,
          ftpFilePath.replace("/public_html/files", ""),
        ]
      );

      await dbConnection.query(
        "UPDATE single_pr_details SET pdf_id = ? WHERE id = ?",
        [pdfInsert.insertId, singlePrId]
      );

      // ✅ Delete Temp File After Upload
      fs.unlinkSync(tempFilePath);
    } else if (pr_type === "IMCWire Written") {
      // ✅ Insert URL
      const [urlInsert] = await dbConnection.query(
        "INSERT INTO pr_url_tags (single_pr_id, url) VALUES (?, ?)",
        [singlePrId, url]
      );

      // ✅ Insert Tags
      for (const tag of tags) {
        let tagId;
        const [existingTag] = await dbConnection.query(
          "SELECT id FROM tags WHERE name = ?",
          [tag]
        );

        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const [tagInsert] = await dbConnection.query(
            "INSERT INTO tags (name) VALUES (?)",
            [tag]
          );
          tagId = tagInsert.insertId;
        }

        await dbConnection.query(
          "INSERT INTO single_pr_tags (single_pr_id, tag_id) VALUES (?, ?)",
          [singlePrId, tagId]
        );
      }

      await dbConnection.query(
        "UPDATE single_pr_details SET url_tags_id = ? WHERE id = ?",
        [urlInsert.insertId, singlePrId]
      );
    }

    await dbConnection.commit();
    res.status(201).json({
      message: "Single PR submitted successfully.",
      single_pr_id: singlePrId,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

exports.updateSinglePR = async (req, res) => {
  let dbConnection;
  try {
    const isFormData = req.headers["content-type"]?.includes(
      "multipart/form-data"
    );

    let { pr_id, company_id, url, tags } = req.body;
    const pdfFile = isFormData ? req.file : null;
    const user_id = req.user?.id;
    const single_pr_id = req.params.single_pr_id;

    if (!pr_id || !company_id) {
      return res
        .status(400)
        .json({ message: "Missing required fields: pr_id or company_id." });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ 1. Fetch PR Data and Verify Ownership
    const [prData] = await dbConnection.query(
      "SELECT id, user_id, prType, payment_status, pr_status FROM pr_data WHERE id = ?",
      [pr_id]
    );
    if (prData.length === 0)
      return res.status(404).json({ message: "PR not found." });

    const pr = prData[0];

    // ✅ 2. Validate PR Ownership, Payment, and Approval
    if (pr.user_id !== user_id)
      return res.status(403).json({ message: "Unauthorized PR access." });
    if (pr.payment_status !== "paid")
      return res.status(400).json({ message: "PR not paid." });

    // ✅ 3. Check Company Ownership
    const [companyData] = await dbConnection.query(
      "SELECT id FROM companies WHERE id = ? AND user_id = ?",
      [company_id, user_id]
    );

    if (companyData.length === 0)
      return res
        .status(404)
        .json({ message: "Company not found or unauthorized." });

    const pr_type = pr.prType; // ✅ Get PR Type dynamically
    // ✅ 4. Fetch Current PR Record
    const [existingPR] = await dbConnection.query(
      "SELECT * FROM single_pr_details WHERE id = ? AND pr_id = ?",
      [single_pr_id, pr_id]
    );
    if (existingPR.length === 0) {
      return res.status(404).json({ message: "PR record not found." });
    }
    if (!["Not Started", "Pending"].includes(existingPR[0].status))
      return res.status(403).json({
        message: "PR cannot be updated after processing has started.",
      });

    // ✅ 5. Validate Required Fields Based on PR Type
    if (pr_type === "Self-Written") {
      if (!pdfFile)
        return res
          .status(400)
          .json({ message: "PDF required for Self-Written PRs." });
      if (url || (tags && tags.length > 0))
        return res
          .status(400)
          .json({ message: "URL/Tags not allowed for Self-Written PRs." });
    } else if (pr_type === "IMCWire Written") {
      if (!url)
        return res
          .status(400)
          .json({ message: "URL required for IMCWire-Written PRs." });
      if (!tags || tags.length === 0)
        return res
          .status(400)
          .json({ message: "Tags required for IMCWire-Written PRs." });
      if (pdfFile)
        return res
          .status(400)
          .json({ message: "PDF not allowed for IMCWire-Written PRs." });
    } else {
      return res.status(400).json({ message: "Invalid PR type." });
    }

    // ✅ 6. Update PR Data
    await dbConnection.query(
      "UPDATE single_pr_details SET company_id = ?, pr_type = ? WHERE id = ?",
      [company_id, pr_type, single_pr_id]
    );

    // ✅ 7. Handle PR Update Based on Type
    if (pr_type === "Self-Written") {
      // ✅ Generate Unique File Name
      const uniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const pdfFirstChar = sanitizedPdfName[0].toLowerCase();
      const newFileName = `${uniqueId}_${sanitizedPdfName}`;
      const saveFileName = sanitizedPdfName;
      const ftpFilePath = `/public_html/files/uploads/pdf-Data/${pdfFirstChar}/${newFileName}`;

      // Delete Old PDF from FTP if Exists
      const [oldPdfData] = await dbConnection.query(
        "SELECT pdf_file, unique_id FROM pr_pdf_files WHERE single_pr_id = ?",
        [single_pr_id]
      );

      if (oldPdfData.length > 0) {
        const oldFileName = `${oldPdfData[0].unique_id}_${oldPdfData[0].pdf_file}`;
        const oldPdfFirstChar = oldFileName[0].toLowerCase();
        const oldFilePath = `/public_html/files/uploads/pdf-Data/${oldPdfFirstChar}/${oldFileName}`;

        const client = new Client();
        await client.access(ftpConfig);
        await client.remove(oldFilePath).catch(() => {}); // Ignore error if file doesn't exist
        client.close();
      }

      // Upload New PDF
      const tempFilePath = path.join(os.tmpdir(), newFileName);
      fs.writeFileSync(tempFilePath, pdfFile.buffer);

      const client = new Client();
      await client.access(ftpConfig);
      await client.ensureDir(
        `/public_html/files/uploads/pdf-Data/${pdfFirstChar}`
      );
      await client.uploadFrom(tempFilePath, ftpFilePath);
      client.close();

      // Update pr_pdf_files table with new unique_id and url
      await dbConnection.query(
        "UPDATE pr_pdf_files SET unique_id = ?, pdf_file = ?, url = ? WHERE single_pr_id = ?",
        [
          uniqueId,
          saveFileName,
          ftpFilePath.replace("/public_html/files", ""),
          single_pr_id,
        ]
      );

      fs.unlinkSync(tempFilePath);
    } else if (pr_type === "IMCWire Written") {
      // ✅ Update URL
      await dbConnection.query(
        "UPDATE pr_url_tags SET url = ? WHERE single_pr_id = ?",
        [url, single_pr_id]
      );

      // ✅ Fetch Existing Tag IDs from `single_pr_tags`
      const [existingTags] = await dbConnection.query(
        "SELECT tag_id FROM single_pr_tags WHERE single_pr_id = ?",
        [single_pr_id]
      );

      const existingTagIdArray = existingTags.map((tag) => tag.tag_id);

      // ✅ DELETE Old Tag Links from `single_pr_tags`
      if (existingTagIdArray.length > 0) {
        await dbConnection.query(
          "DELETE FROM single_pr_tags WHERE single_pr_id = ?",
          [single_pr_id]
        );
      }

      // ✅ Delete Unused Tags from `tags` Table
      for (const tagId of existingTagIdArray) {
        const [tagUsage] = await dbConnection.query(
          "SELECT COUNT(*) AS usageCount FROM single_pr_tags WHERE tag_id = ?",
          [tagId]
        );

        if (tagUsage[0].usageCount === 0) {
          // ✅ If the tag is NOT used by any other PR, delete it from `tags` table
          await dbConnection.query("DELETE FROM tags WHERE id = ?", [tagId]);
        }
      }

      // ✅ Insert New Tags (Loop through provided `tags` array)
      for (const tagName of tags) {
        let tagId;

        // ✅ Check if Tag Already Exists by Name
        const [existingTag] = await dbConnection.query(
          "SELECT id FROM tags WHERE name = ?",
          [tagName]
        );

        if (existingTag.length > 0) {
          // ✅ If Tag Exists, Use Its ID
          tagId = existingTag[0].id;
        } else {
          // ✅ If Tag Doesn't Exist, Insert and Get New ID
          const [newTag] = await dbConnection.query(
            "INSERT INTO tags (name) VALUES (?)",
            [tagName]
          );
          tagId = newTag.insertId;
        }

        // ✅ Insert New Tags into `single_pr_tags`
        await dbConnection.query(
          "INSERT INTO single_pr_tags (single_pr_id, tag_id) VALUES (?, ?)",
          [single_pr_id, tagId]
        );
      }
    }

    await dbConnection.commit();
    res.status(200).json({
      message: "Single PR updated successfully.",
      single_pr_id: single_pr_id,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// ✅ **Get All Single PRs Related to a Specific PR Data Entry**
// ✅ **Get All Single PRs Related to a Specific PR Data Entry with Detailed Information**
exports.getSinglePRs = async (req, res) => {
  const { pr_id } = req.params;
  const user_id = req.user.id;
  console.log(user_id, pr_id);
  let dbConnection;

  if (!pr_id) {
    return res.status(400).json({ message: "Missing required PR ID." });
  }

  try {
    dbConnection = await connection.getConnection();

    // ✅ 1. Verify PR Ownership
    const [prData] = await dbConnection.query(
      "SELECT id, user_id FROM pr_data WHERE id = ?",
      [pr_id]
    );

    if (prData.length === 0) {
      return res.status(404).json({ message: "PR data not found." });
    }

    const pr = prData[0];

    // ✅ 2. Check if PR belongs to the authenticated user
    if (pr.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: This PR does not belong to you." });
    }

    // ✅ 3. Retrieve all Single PRs related to the specified PR with detailed information
    const [singlePRs] = await dbConnection.query(
      `SELECT 
        sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.status,
        c.companyName AS company_name, c.websiteUrl AS company_website, c.contactName AS contact_name,
        pdf.unique_id AS pdf_unique_id, pdf.pdf_file AS pdf_filename, pdf.url AS pdf_url,
        ut.url AS pr_url
      FROM single_pr_details sp
      JOIN companies c ON sp.company_id = c.id
      LEFT JOIN pr_pdf_files pdf ON sp.id = pdf.single_pr_id
      LEFT JOIN pr_url_tags ut ON sp.id = ut.single_pr_id
      WHERE sp.pr_id = ? AND sp.user_id = ?`,
      [pr_id, user_id]
    );

    // ✅ 4. Fetch tags for each Single PR (if applicable)
    const singlePRsWithTags = await Promise.all(
      singlePRs.map(async (singlePR) => {
        if (singlePR.pr_type === "IMCWire Written") {
          const [tags] = await dbConnection.query(
            `SELECT t.id, t.name 
          FROM single_pr_tags spt
          JOIN tags t ON spt.tag_id = t.id
          WHERE spt.single_pr_id = ?`,
            [singlePR.id]
          );
          return { ...singlePR, tags };
        }
        return singlePR;
      })
    );

    res.status(200).json({
      message: "Single PRs retrieved successfully.",
      data: singlePRsWithTags,
    });
  } catch (error) {
    console.error("Error in getSinglePRs:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

// // ✅ **Get Single PR Details Including Related Data**
// exports.getSinglePRDetails = async (req, res) => {
//   const { single_pr_id } = req.params;
//   const user_id = req.user.id;
//   let dbConnection;

//   if (!single_pr_id) {
//     return res.status(400).json({ message: "Missing required Single PR ID." });
//   }

//   try {
//     dbConnection = await connection.getConnection();

//     // ✅ 1. Verify PR Ownership
//     const [singlePR] = await dbConnection.query(
//       `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status,
//               c.companyName AS company_name, c.websiteUrl AS company_website, c.contactName AS contact_name,
//               pr.user_id AS pr_owner
//        FROM single_pr_details sp
//        JOIN pr_data pr ON sp.pr_id = pr.id
//        JOIN companies c ON sp.company_id = c.id
//        WHERE sp.id = ?`,
//       [single_pr_id]
//     );

//     if (singlePR.length === 0) {
//       return res.status(404).json({ message: "Single PR not found." });
//     }

//     const prDetail = singlePR[0];

//     // ✅ 2. Check if PR belongs to the authenticated user
//     if (prDetail.pr_owner !== user_id) {
//       return res.status(403).json({
//         message: "Unauthorized: This Single PR does not belong to you.",
//       });
//     }

//     // ✅ 3. Fetch Related Tags for IMCWire Written PRs
//     let tags = [];
//     if (prDetail.pr_type === "IMCWire Written") {
//       const [tagData] = await dbConnection.query(
//         `SELECT t.id, t.name FROM single_pr_tags spt
//          JOIN tags t ON spt.tag_id = t.id
//          WHERE spt.single_pr_id = ?`,
//         [single_pr_id]
//       );
//       tags = tagData;
//     }

//     res.status(200).json({
//       message: "Single PR details retrieved successfully.",
//       data: { ...prDetail, tags },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// exports.getAllSinglePRs = async (req, res) => {
//   let dbConnection;

//   try {
//     dbConnection = await connection.getConnection();

//     const [singlePRs] = await dbConnection.query(
//       `SELECT sp.id, sp.pr_id, sp.user_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name
//        FROM single_pr_details sp
//        JOIN companies c ON sp.company_id = c.id`
//     );

//     res.status(200).json({
//       message: "All Single PRs retrieved successfully.",
//       data: singlePRs,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// // ✅ **Superadmin: Get Single PRs by User ID**
// exports.getSinglePRsByUser = async (req, res) => {
//   const { user_id } = req.params;
//   let dbConnection;

//   try {
//     dbConnection = await connection.getConnection();

//     const [singlePRs] = await dbConnection.query(
//       `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name
//        FROM single_pr_details sp
//        JOIN companies c ON sp.company_id = c.id
//        WHERE sp.user_id = ?`,
//       [user_id]
//     );

//     res.status(200).json({
//       message: "User's Single PRs retrieved successfully.",
//       data: singlePRs,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// // ✅ **Superadmin: Get Single PRs by PR Data ID**
// exports.getSinglePRsByPRData = async (req, res) => {
//   const { pr_id } = req.params;
//   let dbConnection;

//   try {
//     dbConnection = await connection.getConnection();

//     const [singlePRs] = await dbConnection.query(
//       `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name
//        FROM single_pr_details sp
//        JOIN companies c ON sp.company_id = c.id
//        WHERE sp.pr_id = ?`,
//       [pr_id]
//     );

//     res.status(200).json({
//       message: "PR Data's Single PRs retrieved successfully.",
//       data: singlePRs,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// // ✅ **Superadmin: Get Single PR Details**
// exports.getSinglePRDetailsAdmin = async (req, res) => {
//   const { single_pr_id } = req.params;
//   let dbConnection;

//   try {
//     dbConnection = await connection.getConnection();

//     const [singlePR] = await dbConnection.query(
//       `SELECT sp.*, c.name AS company_name, c.websiteUrl AS company_website, c.contactName AS contactName
//        FROM single_pr_details sp
//        JOIN companies c ON sp.company_id = c.id
//        WHERE sp.id = ?`,
//       [single_pr_id]
//     );

//     if (singlePR.length === 0) {
//       return res.status(404).json({ message: "Single PR not found." });
//     }

//     res.status(200).json({
//       message: "Single PR details retrieved successfully.",
//       data: singlePR[0],
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal Server Error" });
//   } finally {
//     if (dbConnection) {
//       dbConnection.release();
//     }
//   }
// };

// ✅ **Get Single PR Details Including Related Data**
exports.getSinglePRDetails = async (req, res) => {
  const { single_pr_id } = req.params;
  const user_id = req.user.id;
  let dbConnection;

  if (!single_pr_id) {
    return res.status(400).json({ message: "Missing required Single PR ID." });
  }

  try {
    dbConnection = await connection.getConnection();

    // ✅ 1. Verify PR Ownership
    const [singlePR] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status,
              c.companyName AS company_name, c.websiteUrl AS company_website, c.contactName AS contact_name,
              pr.user_id AS pr_owner
       FROM single_pr_details sp
       JOIN pr_data pr ON sp.pr_id = pr.id
       JOIN companies c ON sp.company_id = c.id
       WHERE sp.id = ?`,
      [single_pr_id]
    );

    if (singlePR.length === 0) {
      return res.status(404).json({ message: "Single PR not found." });
    }

    const prDetail = singlePR[0];

    // ✅ 2. Check if PR belongs to the authenticated user
    if (prDetail.pr_owner !== user_id) {
      return res.status(403).json({
        message: "Unauthorized: This Single PR does not belong to you.",
      });
    }

    // ✅ 3. Fetch Related Tags for IMCWire Written PRs
    let tags = [];
    if (prDetail.pr_type === "IMCWire Written") {
      const [tagData] = await dbConnection.query(
        `SELECT t.id, t.name FROM single_pr_tags spt
         JOIN tags t ON spt.tag_id = t.id
         WHERE spt.single_pr_id = ?`,
        [single_pr_id]
      );
      tags = tagData;
    }

    res.status(200).json({
      message: "Single PR details retrieved successfully.",
      data: { ...prDetail, tags },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

exports.getAllSinglePRs = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    const [singlePRs] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.user_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name 
       FROM single_pr_details sp
       JOIN companies c ON sp.company_id = c.id`
    );

    res.status(200).json({
      message: "All Single PRs retrieved successfully.",
      data: singlePRs,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

// ✅ **Superadmin: Get Single PRs by User ID**
exports.getSinglePRsByUser = async (req, res) => {
  const { user_id } = req.params;
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    const [singlePRs] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name 
       FROM single_pr_details sp
       JOIN companies c ON sp.company_id = c.id
       WHERE sp.user_id = ?`,
      [user_id]
    );

    res.status(200).json({
      message: "User's Single PRs retrieved successfully.",
      data: singlePRs,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

// ✅ **Superadmin: Get Single PRs by PR Data ID**
exports.getSinglePRsByPRData = async (req, res) => {
  const { pr_id } = req.params;
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    const [singlePRs] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_file, sp.url, sp.status, c.companyName AS company_name 
       FROM single_pr_details sp
       JOIN companies c ON sp.company_id = c.id
       WHERE sp.pr_id = ?`,
      [pr_id]
    );

    res.status(200).json({
      message: "PR Data's Single PRs retrieved successfully.",
      data: singlePRs,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

// ✅ **Superadmin: Get Single PR Details**
exports.getSinglePRDetailsAdmin = async (req, res) => {
  const { single_pr_id } = req.params;
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    const [singlePR] = await dbConnection.query(
      `SELECT sp.*, c.name AS company_name, c.websiteUrl AS company_website, c.contactName AS contactName
       FROM single_pr_details sp
       JOIN companies c ON sp.company_id = c.id
       WHERE sp.id = ?`,
      [single_pr_id]
    );

    if (singlePR.length === 0) {
      return res.status(404).json({ message: "Single PR not found." });
    }

    res.status(200).json({
      message: "Single PR details retrieved successfully.",
      data: singlePR[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

exports.updatePRStatusBySuperAdmin = async (req, res) => {
  let dbConnection;
  try {
    const { status, pr_id } = req.body;
    const { single_pr_id } = req.params;

    // Ensure user is superAdmin
    const user_role = req.user?.role;
    if (user_role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    dbConnection = await connection.getConnection();

    // Check if the provided pr_id exists in single_pr_details table
    const [existingPR] = await dbConnection.query(
      "SELECT status, user_id FROM single_pr_details WHERE id = ? AND pr_id = ?",
      [single_pr_id, pr_id]
    );
    if (existingPR.length === 0) {
      return res.status(400).json({
        message:
          "Invalid PR reference. The provided pr_id does not match any existing single_pr_details.",
      });
    }

    const userId = existingPR[0].user_id;

    // Fetch user email from auth_user table
    const [user] = await dbConnection.query(
      "SELECT email, username FROM auth_user WHERE id = ?",
      [userId]
    );
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userEmail = user[0].email;
    const username = user[0].username;

    // Update PR status
    await dbConnection.query(
      "UPDATE single_pr_details SET status = ? WHERE id = ?",
      [status, single_pr_id]
    );

    // Send email notification
    const mailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: userEmail,
      subject: `Your PR Status has been updated to ${status} - IMCWire`,
      html: `
        <p>Dear ${username},</p>
        <p>Your PR status has been updated to <strong>${status}</strong>.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best Regards,</p>
        <p>IMCWire Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "PR status updated successfully and email sent.",
      single_pr_id: single_pr_id,
    });
  } catch (error) {
    console.error("Error updating PR status and sending email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};
