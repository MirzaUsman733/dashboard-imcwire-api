// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { uploadPdf, updatePdf, deletePdf } = require("../controllers/fileController");

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const tempDir = path.join(__dirname, "../temp");
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
//     cb(null, tempDir);
//   },
//   filename: function (req, file, cb) {
//     const sanitizedFilename = file.originalname.replace(/ /g, "-");
//     cb(null, sanitizedFilename);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF files are allowed!"), false);
//   }
// };

// const upload = multer({ storage, fileFilter });

// // ✅ Routes
// router.post("/upload", upload.single("pdf"), uploadPdf);
// router.put("/update", upload.single("pdf"), updatePdf);
// router.delete("/delete", deletePdf);

// module.exports = router;
