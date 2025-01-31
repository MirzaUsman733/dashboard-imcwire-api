const multer = require("multer");
const { Client } = require("basic-ftp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const connection = require("../config/dbconfig");
const ftpConfig = require("../config/ftpConfig");
const streamifier = require("streamifier");
const nodemailer = require("nodemailer");
// ✅ Configure Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload File Directly to FTP
const uploadToFTP = async (fileBuffer, fileName, folderPath, retries = 3) => {
  const client = new Client();
  client.ftp.verbose = true; // Enable logging
  client.ftp.timeout = 60000; // Increase timeout to 60 seconds
  try {
    await client.access(ftpConfig);
    await client.ensureDir(folderPath);

    // ✅ Convert buffer to a readable stream
    const stream = streamifier.createReadStream(fileBuffer);

    // ✅ Retry Upload Mechanism
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`FTP Upload Attempt ${attempt}: ${folderPath}/${fileName}`);
        await client.uploadFrom(stream, `${folderPath}/${fileName}`);
        console.log(`File uploaded successfully: ${folderPath}/${fileName}`);
        client.close();
        return `${folderPath}/${fileName}`; // Return FTP file path
      } catch (uploadError) {
        console.error(`FTP Upload Attempt ${attempt} Failed:`, uploadError);
        if (attempt === retries)
          throw new Error("FTP Upload Failed after retries");
      }
    }
    return `${folderPath}/${fileName}`; // Return FTP file path
  } catch (error) {
    console.error("FTP Upload Error:", error);
    client.close();
    throw new Error("FTP Upload Failed");
  }
};
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "Orders@imcwire.com",
    pass: "Sales@$$1aShahG!!boy,s",
  },
});
// ✅ Delete Old File from FTP
const deleteFromFTP = async (filePath) => {
  if (!filePath) return;
  const client = new Client();
  try {
    await client.access(ftpConfig);
    await client.remove(filePath);
    client.close();
  } catch (error) {
    console.error("FTP Deletion Error:", error);
    client.close();
  }
};

// ✅ Create Report and Upload Files in One API (Ensuring Ownership & One Report per `single_pr_id`)
exports.createFullReport = async (req, res) => {
  let dbConnection;

  try {
    const { pr_id, single_pr_id, title, user_id } = req.body;
    const pdfFile = req.files["pdf"] ? req.files["pdf"][0] : null;
    const excelFile = req.files["excel"] ? req.files["excel"][0] : null;

    if (!pr_id || !single_pr_id || !title || (!pdfFile && !excelFile)) {
      return res.status(400).json({
        message:
          "Missing required fields (PR ID, Single PR ID, Title, and at least one file).",
      });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ Check if a report already exists for this `single_pr_id`
    const [existingReport] = await dbConnection.query(
      "SELECT id FROM reports WHERE single_pr_id = ?",
      [single_pr_id]
    );

    if (existingReport.length > 0) {
      return res
        .status(400)
        .json({ message: "A report has already been created for this PR." });
    }

    // ✅ Validate PR & Single PR Submission Ownership
    const [prData] = await dbConnection.query(
      "SELECT id FROM pr_data WHERE id = ? AND user_id = ?",
      [pr_id, user_id]
    );
    const [singlePrData] = await dbConnection.query(
      "SELECT id, status FROM single_pr_details WHERE id = ? AND user_id = ?",
      [single_pr_id, user_id]
    );

    if (prData.length === 0 || singlePrData.length === 0) {
      return res.status(403).json({
        message: "You do not have permission to create a report for this PR.",
      });
    }
    // ✅ Check if the `single_pr_details` is Approved
    if (singlePrData[0].status !== "Approved") {
      return res
        .status(400)
        .json({ message: "You can only create a report for an Approved PR." });
    }
    // ✅ Fetch User Details (Name & Email)
    const [userData] = await dbConnection.query(
      "SELECT username, email FROM auth_user WHERE auth_user_id = ?",
      [user_id]
    );
    if (userData.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(userData);
    const username = userData[0].username;
    const userEmail = userData[0].email;
    console.log(userEmail);
    // ✅ Insert Report
    const [reportResult] = await dbConnection.query(
      "INSERT INTO reports (title, pr_id, single_pr_id, user_id) VALUES (?, ?, ?, ?)",
      [title, pr_id, single_pr_id, user_id]
    );
    const reportId = reportResult.insertId;

    const ftpFolderPath = `/public_html/files/uploads/reports`;
    // ✅ Declare the paths outside the conditions
    let pdfFtpPath = "";
    let excelFtpPath = "";
    if (pdfFile) {
      // ✅ Handle PDF Upload Directly to FTP
      const pdfUniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const pdfFileName = `${pdfUniqueId}_${sanitizedPdfName}`;
      pdfFtpPath = await uploadToFTP(
        pdfFile.buffer,
        pdfFileName,
        ftpFolderPath
      );

      // ✅ Save PDF in `pr_pdf_files` and Get `pr_pdf_id`
      const [pdfInsertResult] = await dbConnection.query(
        "INSERT INTO pr_pdf_files (single_pr_id, unique_id, pdf_file, url) VALUES (?, ?, ?, ?)",
        [
          single_pr_id,
          pdfUniqueId,
          pdfFileName,
          pdfFtpPath.replace("/public_html/files", ""),
        ]
      );
      const prPdfId = pdfInsertResult.insertId;

      // ✅ Save PDF Reference in `report_pr_pdfs`
      await dbConnection.query(
        "INSERT INTO report_pr_pdfs (report_id, pr_pdf_id, pdf_name, pdf_url) VALUES (?, ?, ?, ?)",
        [
          reportId,
          prPdfId,
          pdfFileName,
          pdfFtpPath.replace("/public_html/files", ""),
        ]
      );
    }

    if (excelFile) {
      // ✅ Handle Excel Upload Directly to FTP
      const excelUniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedExcelName = excelFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const excelFileName = `${excelUniqueId}_${sanitizedExcelName}`;
      excelFtpPath = await uploadToFTP(
        excelFile.buffer,
        excelFileName,
        ftpFolderPath
      );

      // ✅ Save Excel Record in MySQL
      await dbConnection.query(
        "INSERT INTO report_excel_files (report_id, excel_name, excel_url) VALUES (?, ?, ?)",
        [
          reportId,
          excelFileName,
          excelFtpPath.replace("/public_html/files", ""),
        ]
      );
    }
    // ✅ Update `single_pr_details` status to "Report Created"
    await dbConnection.query(
      "UPDATE single_pr_details SET status = 'Published' WHERE id = ?",
      [single_pr_id]
    );
    const reportMailOptions = {
      from: "IMCWire <Orders@imcwire.com>",
      to: userEmail,
      subject: "Your Report Has Been Successfully Uploaded - IMCWire",
      html: `
       <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Report Upload Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #004085;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            font-size: 20px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
        }
        .button {
            display: inline-block;
            background: #004085;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        Report Successfully Uploaded
    </div>
    <div class="content">
        <p>Dear <strong>${username}</strong>,</p>
        <p>Your report titled <strong>${title}</strong> has been successfully uploaded and published under PR Number.</p>
        <p>You can check the details of your report in your dashboard.</p>
        <p>Additionally, you can download the published report in the following formats:</p>
        <p>
             <a href="${pdfFtpPath.replace(
               "/public_html/files",
               ""
             )}" style="display: inline-block; background: #004085; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download PDF</a> 
             <a href="${excelFtpPath.replace(
               "/public_html/files",
               ""
             )}" style="display: inline-block; background: #004085; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download PDF</a> 
        </p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best Regards,</p>
        <p><strong>IMCWire Team</strong></p>
    </div>
    <div class="footer">
        &copy; 2025 IMCWire. All rights reserved.
    </div>
</div>

</body>
</html>

      `,
    };
    await transporter.sendMail(reportMailOptions);
    await dbConnection.commit();

    res.status(201).json({
      message: "Report and files uploaded successfully.",
      report_id: reportId,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// ✅ Update Report and Files
exports.updateFullReport = async (req, res) => {
  let dbConnection;
  try {
    const { report_id, title, user_id } = req.body;
    const pdfFile = req.files["pdf"] ? req.files["pdf"][0] : null;
    const excelFile = req.files["excel"] ? req.files["excel"][0] : null;

    if (!report_id) {
      return res.status(400).json({
        message: "Report ID is required.",
      });
    }

    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    // ✅ Validate Report Ownership
    const [existingReport] = await dbConnection.query(
      "SELECT * FROM reports WHERE id = ? AND user_id = ?",
      [report_id, user_id]
    );

    if (existingReport.length === 0) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this report." });
    }

    // ✅ Update Report Title if Provided
    if (title) {
      await dbConnection.query("UPDATE reports SET title = ? WHERE id = ?", [
        title,
        report_id,
      ]);
    }

    const ftpFolderPath = `/public_html/files/uploads/reports`;

    if (pdfFile) {
      // ✅ Fetch Old PDF Details
      const [oldPdf] = await dbConnection.query(
        "SELECT id, pdf_url FROM report_pr_pdfs WHERE report_id = ?",
        [report_id]
      );

      // ✅ Delete Old PDF from FTP if Exists
      if (oldPdf.length > 0) {
        await deleteFromFTP(`/public_html/files${oldPdf[0].pdf_url}`);
        await dbConnection.query(
          "DELETE FROM report_pr_pdfs WHERE report_id = ?",
          [report_id]
        );
      }

      // ✅ Handle New PDF Upload Directly to FTP
      const pdfUniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedPdfName = pdfFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const pdfFileName = `${pdfUniqueId}_${sanitizedPdfName}`;
      const pdfFtpPath = await uploadToFTP(
        pdfFile.buffer,
        pdfFileName,
        ftpFolderPath
      );

      // ✅ Save New PDF in `pr_pdf_files`
      const [pdfInsertResult] = await dbConnection.query(
        "INSERT INTO pr_pdf_files (single_pr_id, unique_id, pdf_file, url) VALUES (?, ?, ?, ?)",
        [
          existingReport[0].single_pr_id,
          pdfUniqueId,
          sanitizedPdfName,
          pdfFtpPath.replace("/public_html/files", ""),
        ]
      );
      const prPdfId = pdfInsertResult.insertId;

      // ✅ Link New PDF to Report
      await dbConnection.query(
        "INSERT INTO report_pr_pdfs (report_id, pr_pdf_id, pdf_name, pdf_url) VALUES (?, ?, ?, ?)",
        [
          report_id,
          prPdfId,
          sanitizedPdfName,
          pdfFtpPath.replace("/public_html/files", ""),
        ]
      );
    }

    if (excelFile) {
      // ✅ Fetch Old Excel Details
      const [oldExcel] = await dbConnection.query(
        "SELECT id, excel_url FROM report_excel_files WHERE report_id = ?",
        [report_id]
      );

      // ✅ Delete Old Excel from FTP if Exists
      if (oldExcel.length > 0) {
        await deleteFromFTP(`/public_html/files${oldExcel[0].excel_url}`);
        await dbConnection.query(
          "DELETE FROM report_excel_files WHERE report_id = ?",
          [report_id]
        );
      }

      // ✅ Handle New Excel Upload Directly to FTP
      const excelUniqueId = uuidv4().replace(/-/g, "").substring(0, 20);
      const sanitizedExcelName = excelFile.originalname.replace(
        /[^a-zA-Z0-9.-]/g,
        "-"
      );
      const excelFileName = `${excelUniqueId}_${sanitizedExcelName}`;
      const excelFtpPath = await uploadToFTP(
        excelFile.buffer,
        excelFileName,
        ftpFolderPath
      );

      // ✅ Save New Excel Record in MySQL
      await dbConnection.query(
        "INSERT INTO report_excel_files (report_id, excel_name, excel_url) VALUES (?, ?, ?)",
        [
          report_id,
          sanitizedExcelName,
          excelFtpPath.replace("/public_html/files", ""),
        ]
      );
    }

    await dbConnection.commit();

    res.status(200).json({
      message: "Report updated successfully.",
      report_id,
    });
  } catch (error) {
    if (dbConnection) await dbConnection.rollback();
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// ✅ Multer Middleware for File Uploads
exports.uploadMiddleware = upload.fields([
  { name: "pdf", maxCount: 1 },
  { name: "excel", maxCount: 1 },
]);

// ✅ Get User Specific Report
exports.getUserReport = async (req, res) => {
  let dbConnection;
  try {
    const user_id = req.user?.id; // Extract user_id from authMiddleware or wherever it's available
    const { report_id } = req.params;
    console.log(report_id);
    console.log(user_id);
    dbConnection = await connection.getConnection();

    // ✅ Fetch Report Details
    const [reportData] = await dbConnection.query(
      "SELECT * FROM reports WHERE id = ? AND user_id = ?",
      [report_id, user_id]
    );

    if (reportData.length === 0) {
      return res.status(404).json({
        message: "Report not found or you don't have access to this report.",
      });
    }

    // Example: Fetch PDF files linked to this report
    const [pdfFiles] = await dbConnection.query(
      "SELECT pdf_name, pdf_url FROM report_pr_pdfs WHERE report_id = ?",
      [report_id]
    );

    // Example: Fetch Excel files linked to this report
    const [excelFiles] = await dbConnection.query(
      "SELECT excel_name, excel_url FROM report_excel_files WHERE report_id = ?",
      [report_id]
    );

    // Construct response object with report details and files
    const report = {
      id: reportData[0].id,
      title: reportData[0].title,
      pdf_files: pdfFiles,
      excel_files: excelFiles,
      // Add other report details as needed
    };

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching user report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};

// ✅ Get All Reports for a Specific User
exports.getAllUserReports = async (req, res) => {
  let dbConnection;
  try {
    const user_id = req.user?.id; // Extract user_id from authMiddleware or wherever it's available
    dbConnection = await connection.getConnection();

    // ✅ Fetch All Reports for the User
    const [reports] = await dbConnection.query(
      "SELECT * FROM reports WHERE user_id = ?",
      [user_id]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        message: "No reports found for this user.",
      });
    }

    // ✅ Fetch PDF and Excel Files for Each Report (if needed)
    const reportsWithFiles = await Promise.all(
      reports.map(async (report) => {
        const [pdfFiles] = await dbConnection.query(
          "SELECT pdf_name, pdf_url FROM report_pr_pdfs WHERE report_id = ?",
          [report.id]
        );

        const [excelFiles] = await dbConnection.query(
          "SELECT excel_name, excel_url FROM report_excel_files WHERE report_id = ?",
          [report.id]
        );

        return {
          id: report.id,
          title: report.title,
          pdf_files: pdfFiles,
          excel_files: excelFiles,
          // Add other report details as needed
        };
      })
    );

    res.status(200).json(reportsWithFiles);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    if (dbConnection) dbConnection.release();
  }
};
