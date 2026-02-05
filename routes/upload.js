const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "homesplus_properties",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

router.post("/", upload.array("media", 10), (req, res) => {
  const files = req.files.map(file => ({
    url: file.path,
    type: file.mimetype,
  }));

  res.json({ files });
});

module.exports = router;
