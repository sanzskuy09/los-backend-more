const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Middleware multer → simpan file ke memori (nanti kita pindahkan manual)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-pefindo/:application_id/:nik", upload.single("file"), (req, res) => {
  try {
    const { application_id, nik } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const baseDir = "/opt/be/uploads/HasilPefindo";
    const targetDir = path.join(baseDir, application_id, nik);

    // Buat folder jika belum ada
    fs.mkdirSync(targetDir, { recursive: true });

    const filePath = path.join(targetDir, "PEFINDO.pdf");

    // Simpan file ke disk
    fs.writeFileSync(filePath, file.buffer);

    res.status(200).json({
      message: "Upload berhasil",
      path: filePath,
    });
  } catch (err) {
    console.error("Upload gagal:", err);
    res.status(500).json({ message: "Gagal upload", error: err.message });
  }
});

module.exports = router;