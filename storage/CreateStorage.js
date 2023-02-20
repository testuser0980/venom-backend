const express = require("express");
const multer = require("multer");

// Create Storage
const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: Storage });

module.exports = upload;
