const express = require("express");
const multer = require("multer");
const { uploadMultipleFiles } = require("../services/storage.service");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Upload multiple files using FormData field name "files"
router.post(
  "/files",
  authMiddleware.authAny,
  upload.array("files"),
  async (req, res) => {
    try {
      const files = req.files;
      if (!files || !files.length) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const urls = await uploadMultipleFiles(files);
      return res.status(201).json({ message: "Files uploaded successfully", urls });
    } catch (err) {
      console.error("Upload route error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }
  }
);

module.exports = router;
