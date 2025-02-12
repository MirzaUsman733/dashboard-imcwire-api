const connection = require("../config/dbconfig");
const { Client } = require("basic-ftp");
const ftpConfig = require("../config/ftpConfig");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const { transporter } = require("../config/transporter");

// Submit Single PR
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
    // ✅ 2. Validate PR Ownership, Payment, and Approval
    if (pr.user_id !== user_id)
      return res.status(403).json({ message: "Unauthorized PR access." });
    if (pr.payment_status === "unpaid")
      return res.status(400).json({ message: "PR not paid." });
    if (pr.payment_status === "refund")
      return res
        .status(400)
        .json({
          message: "PR payment was refunded. You cannot submit this PR.",
        });
    if (pr.pr_status === "Rejected")
      return res.status(403).json({
        message: "PR rejected. Please contact support to resolve the issue.",
      });
    if (pr.pr_status === "Pending")
      return res
        .status(403)
        .json({ message: "PR Order is not approved. Please contact support." });

    // Check if the PR is approved before continuing
    if (pr.pr_status !== "Approved")
      return res
        .status(403)
        .json({ message: "PR is not approved for submission." });

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
    const singlePrId = singlePrResult.insertId;

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

exports.submitSinglePRBySuperAdmin = async (req, res) => {
  let dbConnection;
  try {
    const isFormData = req.headers["content-type"]?.includes("multipart/form-data");
    let { pr_id, url, tags, companyName, address1, address2, contactName, phone, email, country, city, state, websiteUrl } = req.body;
    const pdfFile = isFormData ? req.file : null;
    // Ensure pr_id is provided
    if (!pr_id) {
      return res.status(400).json({ message: "PR id is required." });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();
    const [prData] = await dbConnection.query(
      "SELECT id, user_id, prType, plan_id, payment_status, pr_status FROM pr_data WHERE id = ?",
      [pr_id]
    );
    if (prData.length === 0) {
      return res.status(404).json({ message: "PR not found." });
    }
    const user_id = prData[0].user_id
    // Optionally insert company if company details are provided
    let company_id;
    if (companyName && email) {
      const [companyResult] = await dbConnection.query(
        `INSERT INTO companies 
         (user_id, companyName, address1, address2, contactName, phone, email, country, city, state, websiteUrl) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          companyName,
          address1,
          address2 || null,
          contactName || null,
          phone || null,
          email,
          country || null,
          city || null,
          state || null,
          websiteUrl || null,
        ]
      );
      company_id = companyResult.insertId;
    } else {
      // Optionally fetch an existing company if needed
      // For example:
      // const [companyData] = await dbConnection.query("SELECT id FROM companies WHERE user_id = ?", [user_id]);
      // company_id = companyData?.[0]?.id;
    }

    // Fetch PR Data

    const pr = prData[0];
    const plan_id = pr.plan_id;

    console.log(plan_id)
    // You might want to override user_id or ensure consistency:
    // const user_id = pr.user_id; // Only if you are sure about it

    // Validate PR statuses
    if (pr.payment_status === "unpaid")
      return res.status(400).json({ message: "PR not paid." });
    if (pr.payment_status === "refund")
      return res.status(400).json({ message: "PR payment was refunded. You cannot submit this PR." });
    if (pr.pr_status === "Rejected")
      return res.status(403).json({ message: "PR rejected. Please contact support to resolve the issue." });
    if (pr.pr_status === "Pending")
      return res.status(403).json({ message: "PR Order is not approved. Please contact support." });
    if (pr.pr_status !== "Approved")
      return res.status(403).json({ message: "PR is not approved for submission." });

    // If a new company was created, verify its ownership
    if (company_id) {
      const [companyData] = await dbConnection.query(
        "SELECT id FROM companies WHERE id = ? AND user_id = ?",
        [company_id, user_id]
      );
      if (companyData.length === 0) {
        return res.status(404).json({ message: "Company not found or unauthorized to this user." });
      }
    }

    const pr_type = pr.prType;
    // Validate required fields based on PR type
    if (pr_type === "Self-Written") {
      if (!pdfFile)
        return res.status(400).json({ message: "PDF required for Self-Written PRs." });
      if (url || (tags && tags.length > 0))
        return res.status(400).json({ message: "URL/Tags not allowed for Self-Written PRs." });
    } else if (pr_type === "IMCWire Written") {
      if (!url)
        return res.status(400).json({ message: "URL required for IMCWire-Written PRs." });
      if (!tags || tags.length === 0)
        return res.status(400).json({ message: "Tags required for IMCWire-Written PRs." });
      if (pdfFile)
        return res.status(400).json({ message: "PDF not allowed for IMCWire-Written PRs." });
    } else {
      return res.status(400).json({ message: "Invalid PR type." });
    }

    // Insert into single_pr_details
    const [singlePrResult] = await dbConnection.query(
      "INSERT INTO single_pr_details (pr_id, user_id, company_id, pr_type, status) VALUES (?, ?, ?, ?, ?)",
      [pr_id, user_id, company_id, pr_type, "Approved"]
    );
    const singlePrId = singlePrResult.insertId;
    // Update plan_records to increment used PRs
    await dbConnection.query(
      "UPDATE plan_records SET used_prs = used_prs + 1 WHERE user_id = ? AND plan_id = ? AND pr_id = ?",
      [user_id, plan_id, pr_id]
    );

    // Handle file or URL/tag processing based on pr_type
    if (pr_type === "Self-Written") {
      // --- PDF Upload Logic ---
      const uniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
      const pdfFirstChar = sanitizedPdfName[0].toLowerCase();
      const newFileName = `${uniqueId}_${sanitizedPdfName}`;
      const saveFileName = sanitizedPdfName;
      const ftpFilePath = `/public_html/files/uploads/pdf-Data/${pdfFirstChar}/${newFileName}`;

      const tempFilePath = path.join(os.tmpdir(), newFileName);
      fs.writeFileSync(tempFilePath, pdfFile.buffer);

      const client = new Client();
      await client.access(ftpConfig);
      await client.ensureDir(`/public_html/files/uploads/pdf-Data/${pdfFirstChar}`);
      await client.uploadFrom(tempFilePath, ftpFilePath);
      client.close();

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

      fs.unlinkSync(tempFilePath);
    } else if (pr_type === "IMCWire Written") {
      // --- URL and Tags Logic ---
      const [urlInsert] = await dbConnection.query(
        "INSERT INTO pr_url_tags (single_pr_id, url) VALUES (?, ?)",
        [singlePrId, url]
      );

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

    // Commit the transaction and send a success response
    await dbConnection.commit();
    res.status(201).json({
      message: "Single PR submitted successfully.",
      company_id,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    console.error("Error in submitting PR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// Update an already submitted single PR (by Super Admin)
// Now the endpoint expects single_pr_id as a URL parameter
exports.updateSinglePRBySuperAdmin = async (req, res) => {
  let dbConnection;
  try {
    // Get the single_pr_id from the URL (e.g., /api/single-pr/:single_pr_id)
    const { single_pr_id } = req.params;
    // Other fields come from the body:
    let {
      pr_id,        // the PR id from pr_data (still required)
      url,
      tags,
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
    // Determine if the request is multipart/form-data (for file upload)
    const isFormData = req.headers["content-type"]?.includes("multipart/form-data");
    const pdfFile = isFormData ? req.file : null;

    // Basic validations: both pr_id and single_pr_id must be provided.
    if (!pr_id) {
      return res.status(400).json({ message: "PR id is required." });
    }
    if (!single_pr_id) {
      return res.status(400).json({ message: "Single PR id is required in URL." });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // -------------------------------------------------
    // 1. Fetch the base PR data and perform validations.
    // -------------------------------------------------
    const [prData] = await dbConnection.query(
      "SELECT id, user_id, prType, plan_id, payment_status, pr_status FROM pr_data WHERE id = ?",
      [pr_id]
    );
    if (prData.length === 0) {
      return res.status(404).json({ message: "PR not found." });
    }
    const pr = prData[0];
    const user_id = pr.user_id;
    const plan_id = pr.plan_id;

    // Validate PR payment and status.
    if (pr.payment_status === "unpaid")
      return res.status(400).json({ message: "PR not paid." });
    if (pr.payment_status === "refund")
      return res.status(400).json({ message: "PR payment was refunded. You cannot update this PR." });
    if (pr.pr_status === "Rejected")
      return res.status(403).json({ message: "PR rejected. Please contact support to resolve the issue." });
    if (pr.pr_status === "Pending")
      return res.status(403).json({ message: "PR Order is not approved. Please contact support." });
    if (pr.pr_status !== "Approved")
      return res.status(403).json({ message: "PR is not approved for submission/update." });
    console.log(single_pr_id, pr_id)
    // -------------------------------------------------
    // 2. Fetch the existing submission from single_pr_details.
    // -------------------------------------------------
    const [singlePrData] = await dbConnection.query(
      "SELECT id, company_id, pr_type FROM single_pr_details WHERE id = ? AND pr_id = ?",
      [single_pr_id, pr_id]
    );
    console.log(singlePrData)
    if (singlePrData.length === 0) {
      return res.status(404).json({ message: "Single PR submission not found." });
    }
    const singlePr = singlePrData[0];
    const pr_type = singlePr.pr_type; // either "Self-Written" or "IMCWire Written"

    // -------------------------------------------------
    // 3. Update (or create) company details if provided.
    // -------------------------------------------------
    if (companyName && email) {
      let company_id = singlePr.company_id;
      if (company_id) {
        // Update the existing company record.
        await dbConnection.query(
          `UPDATE companies 
           SET companyName = ?, address1 = ?, address2 = ?, contactName = ?, phone = ?, email = ?, country = ?, city = ?, state = ?, websiteUrl = ? 
           WHERE id = ? AND user_id = ?`,
          [
            companyName,
            address1,
            address2 || null,
            contactName || null,
            phone || null,
            email,
            country || null,
            city || null,
            state || null,
            websiteUrl || null,
            company_id,
            user_id,
          ]
        );
      } else {
        // If no company exists yet, insert a new record.
        const [companyResult] = await dbConnection.query(
          `INSERT INTO companies 
           (user_id, companyName, address1, address2, contactName, phone, email, country, city, state, websiteUrl) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user_id,
            companyName,
            address1,
            address2 || null,
            contactName || null,
            phone || null,
            email,
            country || null,
            city || null,
            state || null,
            websiteUrl || null,
          ]
        );
        company_id = companyResult.insertId;
        // Link the new company record to the submission.
        await dbConnection.query(
          "UPDATE single_pr_details SET company_id = ? WHERE id = ?",
          [company_id, single_pr_id]
        );
      }
    }

    // -------------------------------------------------
    // 4. Validate and process fields according to the PR type.
    // -------------------------------------------------
    if (pr_type === "Self-Written") {
      // For Self-Written PRs, a PDF is required if none exists,
      // and URL/Tags must not be provided.
      if (pdfFile) {
        // A new PDF file will be processed below.
      } else {
        // If no new PDF file is provided, verify that a PDF already exists.
        const [pdfRecord] = await dbConnection.query(
          "SELECT id FROM pr_pdf_files WHERE single_pr_id = ?",
          [single_pr_id]
        );
        if (pdfRecord.length === 0) {
          return res.status(400).json({ message: "PDF required for Self-Written PRs." });
        }
      }
      if (url || (tags && tags.length > 0)) {
        return res.status(400).json({ message: "URL/Tags not allowed for Self-Written PRs." });
      }
    } else if (pr_type === "IMCWire Written") {
      // For IMCWire-Written PRs, a URL and tags are required, and PDF must not be provided.
      if (!url) {
        // Check if an existing URL record exists.
        const [urlRecord] = await dbConnection.query(
          "SELECT id FROM pr_url_tags WHERE single_pr_id = ?",
          [single_pr_id]
        );
        if (urlRecord.length === 0) {
          return res.status(400).json({ message: "URL required for IMCWire-Written PRs." });
        }
      }
      if (!tags || tags.length === 0) {
        // Check if tags are already associated.
        const [tagRecords] = await dbConnection.query(
          "SELECT st.tag_id FROM single_pr_tags st WHERE st.single_pr_id = ?",
          [single_pr_id]
        );
        if (tagRecords.length === 0) {
          return res.status(400).json({ message: "Tags required for IMCWire-Written PRs." });
        }
      }
      if (pdfFile) {
        return res.status(400).json({ message: "PDF not allowed for IMCWire-Written PRs." });
      }
    } else {
      return res.status(400).json({ message: "Invalid PR type." });
    }

    // -------------------------------------------------
    // 5. Process the update based on the PR type.
    // -------------------------------------------------
    if (pr_type === "Self-Written") {
      if (pdfFile) {
        // Process the new PDF file.
        const uniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
        const sanitizedPdfName = pdfFile.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
        const pdfFirstChar = sanitizedPdfName[0].toLowerCase();
        const newFileName = `${uniqueId}_${sanitizedPdfName}`;
        const saveFileName = sanitizedPdfName;
        const ftpFilePath = `/public_html/files/uploads/pdf-Data/${pdfFirstChar}/${newFileName}`;

        // Write the file temporarily.
        const tempFilePath = path.join(os.tmpdir(), newFileName);
        fs.writeFileSync(tempFilePath, pdfFile.buffer);

        // Upload via FTP.
        const client = new Client();
        await client.access(ftpConfig);
        await client.ensureDir(`/public_html/files/uploads/pdf-Data/${pdfFirstChar}`);
        await client.uploadFrom(tempFilePath, ftpFilePath);
        client.close();

        // Update (or insert) the record in pr_pdf_files.
        const [pdfRecord] = await dbConnection.query(
          "SELECT id FROM pr_pdf_files WHERE single_pr_id = ?",
          [single_pr_id]
        );
        if (pdfRecord.length > 0) {
          // Update the existing record.
          await dbConnection.query(
            "UPDATE pr_pdf_files SET unique_id = ?, pdf_file = ?, url = ? WHERE id = ?",
            [uniqueId, saveFileName, ftpFilePath.replace("/public_html/files", ""), pdfRecord[0].id]
          );
        } else {
          // Insert a new record.
          const [pdfInsert] = await dbConnection.query(
            "INSERT INTO pr_pdf_files (single_pr_id, unique_id, pdf_file, url) VALUES (?, ?, ?, ?)",
            [single_pr_id, uniqueId, saveFileName, ftpFilePath.replace("/public_html/files", "")]
          );
          // Link the new PDF record to the submission.
          await dbConnection.query(
            "UPDATE single_pr_details SET pdf_id = ? WHERE id = ?",
            [pdfInsert.insertId, single_pr_id]
          );
        }
        // Remove the temporary file.
        fs.unlinkSync(tempFilePath);
      }
    } else if (pr_type === "IMCWire Written") {
      // Update the URL if a new one is provided.
      if (url) {
        const [urlRecord] = await dbConnection.query(
          "SELECT id FROM pr_url_tags WHERE single_pr_id = ?",
          [single_pr_id]
        );
        if (urlRecord.length > 0) {
          await dbConnection.query(
            "UPDATE pr_url_tags SET url = ? WHERE id = ?",
            [url, urlRecord[0].id]
          );
        } else {
          const [urlInsert] = await dbConnection.query(
            "INSERT INTO pr_url_tags (single_pr_id, url) VALUES (?, ?)",
            [single_pr_id, url]
          );
          await dbConnection.query(
            "UPDATE single_pr_details SET url_tags_id = ? WHERE id = ?",
            [urlInsert.insertId, single_pr_id]
          );
        }
      }
      // Update tags if new tags are provided.
      if (tags && tags.length > 0) {
        // Remove existing tag associations.
        await dbConnection.query(
          "DELETE FROM single_pr_tags WHERE single_pr_id = ?",
          [single_pr_id]
        );
        // Process and insert each tag.
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
            [single_pr_id, tagId]
          );
        }
      }
    }

    // -------------------------------------------------
    // 6. (Optional) Update other related records.
    // For example, you might update plan_records if needed.
    // -------------------------------------------------

    // Commit the transaction and return a success message.
    await dbConnection.commit();
    res.status(200).json({
      message: "Single PR updated successfully.",
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    console.error("Error in updating PR:", error);
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
    if (pr.payment_status === "unpaid")
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
        await client.remove(oldFilePath).catch(() => { }); // Ignore error if file doesn't exist
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

// ✅ **Get All Single PRs Related to a Specific PR Data Entry with Detailed Information**
exports.getSinglePRs = async (req, res) => {
  const { pr_id } = req.params;
  const user_id = req.user.id;
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};
// ✅ **Get All Single PRs Related to the Authenticated User with Detailed Information**
exports.getUserSinglePRs = async (req, res) => {
  const user_id = req.user.id; // Extract user ID from authenticated request
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    // ✅ 1. Retrieve all Single PRs that belong to the authenticated user
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
      WHERE sp.user_id = ?`,
      [user_id]
    );

    if (singlePRs.length === 0) {
      return res
        .status(404)
        .json({ message: "No single PRs found for this user." });
    }

    // ✅ 2. Fetch tags for each Single PR (if applicable)
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};
// ✅ **Get Single PR Count Based on Status for the Authenticated User**
exports.getUserPRStatusCounts = async (req, res) => {
  const user_id = req.user.id; // Extract user ID from authenticated request
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    // ✅ Count PRs based on their status for the authenticated user
    const [statusCounts] = await dbConnection.query(
      `SELECT 
        status, COUNT(*) AS count
      FROM single_pr_details
      WHERE user_id = ?
      GROUP BY status`,
      [user_id]
    );

    // ✅ Format response
    const statusSummary = {
      NotStarted: 0,
      Pending: 0,
      Approved: 0,
      InProgress: 0,
      Published: 0,
    };

    // ✅ Normalize and Populate counts dynamically
    statusCounts.forEach((row) => {
      let normalizedStatus = row.status;

      if (normalizedStatus === "Not Started") {
        normalizedStatus = "NotStarted";
      } else if (normalizedStatus === "In Progress") {
        normalizedStatus = "InProgress";
      }

      if (statusSummary.hasOwnProperty(normalizedStatus)) {
        statusSummary[normalizedStatus] += row.count;
      }
    });
    res.status(200).json({
      message: "PR status counts retrieved successfully.",
      data: statusSummary,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

exports.getAllPRStatusCounts = async (req, res) => {
  let dbConnection;

  try {
    dbConnection = await connection.getConnection();

    // ✅ Count PRs based on their status for the authenticated user
    const [statusCounts] = await dbConnection.query(
      `SELECT 
        status, COUNT(*) AS count
      FROM single_pr_details
      GROUP BY status`
    );

    // ✅ Format response
    const statusSummary = {
      NotStarted: 0,
      Pending: 0,
      Approved: 0,
      InProgress: 0,
      Published: 0,
    };

    // ✅ Normalize and Populate counts dynamically
    statusCounts.forEach((row) => {
      let normalizedStatus = row.status;

      if (normalizedStatus === "Not Started") {
        normalizedStatus = "NotStarted";
      } else if (normalizedStatus === "In Progress") {
        normalizedStatus = "InProgress";
      }

      if (statusSummary.hasOwnProperty(normalizedStatus)) {
        statusSummary[normalizedStatus] += row.count;
      }
    });

    res.status(200).json({
      message: "PR status counts retrieved successfully.",
      data: statusSummary,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

// ✅ **Get Single PR Details Including Related Data**
exports.getSinglePRDetails = async (req, res) => {
  const { single_pr_id } = req.params;
  let dbConnection;

  if (!single_pr_id) {
    return res.status(400).json({ message: "Missing required Single PR ID." });
  }

  try {
    dbConnection = await connection.getConnection();

    // ✅ 1. Verify PR Ownership
    const [singlePR] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_id, sp.url_tags_id, sp.status,
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
    // Get database connection
    dbConnection = await connection.getConnection();

    // Execute query
    const [singlePRs] = await dbConnection.query(
      `SELECT sp.id, sp.pr_id, sp.user_id, sp.company_id, sp.pr_type, sp.pdf_id, sp.url_tags_id, sp.status, 
              c.companyName AS company_name 
       FROM single_pr_details sp
       LEFT JOIN companies c ON sp.company_id = c.id`
    );

    // Send response
    res.status(200).json({
      message: "All Single PRs retrieved successfully.",
      data: singlePRs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Release database connection safely
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
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_id, sp.url_tags_id, sp.status, c.companyName AS company_name 
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
      `SELECT sp.id, sp.pr_id, sp.company_id, sp.pr_type, sp.pdf_id, sp.url_tags_id, sp.status, c.companyName AS company_name 
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

    const [existingPR] = await dbConnection.query(
      `SELECT spd.status, spd.user_id, pd.plan_id 
       FROM single_pr_details spd
       JOIN pr_data pd ON spd.pr_id = pd.id
       WHERE spd.id = ? AND spd.pr_id = ?`,
      [single_pr_id, pr_id]
    );
    if (existingPR.length === 0) {
      return res.status(400).json({
        message:
          "Invalid PR reference. The provided pr_id does not match any existing single_pr_details.",
      });
    }

    const userId = existingPR[0].user_id;
    const previousStatus = existingPR[0].status;
    const planId = existingPR[0].plan_id;

    // Fetch user email from auth_user table
    const [user] = await dbConnection.query(
      "SELECT email, username FROM auth_user WHERE auth_user_id = ?",
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
    // Check if the status changed to 'rejected' and previous status was not 'rejected'
    if (
      status.toLowerCase() === "rejected" &&
      previousStatus.toLowerCase() !== "rejected"
    ) {
      await dbConnection.query(
        "UPDATE plan_records SET used_prs = used_prs - 1 WHERE user_id = ? AND plan_id = ? AND pr_id = ?",
        [userId, planId, pr_id]
      );
    }
    // Define notification message based on status
    let notificationMessage;
    switch (status.toLowerCase()) {
      case "pending":
        notificationMessage = `Your Single PR #${single_pr_id} is now pending, waiting for admin approval.`;
        break;
      case "approved":
        notificationMessage = `Your Single PR #${single_pr_id} has been approved. We are now starting work on it.`;
        break;
      case "published":
        notificationMessage = `Congratulations! Your Single PR #${single_pr_id} has been published.`;
        break;
      case "rejected":
        notificationMessage = `Your Single PR #${single_pr_id} has been rejected. Please contact support for more details.`;
      default:
        notificationMessage = `Your PR #${single_pr_id} status has been updated to ${status}.`;
    }

    // ✅ Add notification for status update
    await dbConnection.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [userId, "PR Status Updated", notificationMessage]
    );
    // Send email notification
    const mailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: userEmail,
      subject: `Your PR# ${single_pr_id} Status has been updated to ${status} - IMCWire`,
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
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};
