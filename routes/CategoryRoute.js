const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Category = require("../models/CategoryModel");
const verifyUser = require("../middlewares/GetUser");
const verifyRole = require("../middlewares/GetUserRole");
const User = require("../models/UserModel");
const Blog = require('../models/BlogModel')

// Create New Category - Admin
router.post(
  "/admin/create/category",
  verifyRole,
  [body("cat_name", "Category name is required").isLength({ min: 3 })],
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const user = await User.findById(req.user);
      if (!user) {
        return res
        .status(400)
        .send({ success: false, message: "No user found" });
      }
      const {cat_name} = req.body
      let category = await Category.findOne({ cat_name });
      if (category) {
        return res
          .status(400)
          .send({ success: false, message: "Category already exists" });
      }
      category = await Category.create({
        user: req.user,
        cat_name,
      });
      return res.status(201).send({ success: true, category });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);

// Get all categories - Logged In Users
router.get("/categories/all", async (req, res) => {
  try {
    let all_cat = await Category.find().select("-user");
    return res
      .status(200)
      .send({ success: true, all_cat, total: all_cat.length });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Delete category - Admin
router.delete("/admin/category/delete/:id", verifyRole, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(400).send({ success: false, message: "No user found" });
    }
    let del_cat = await Category.findById(req.params.id);
    if (!del_cat) {
      return res
        .status(400)
        .send({
          success: false,
          message:
            "No category found with ID: " +
            req.params.id.slice(0, 4) +
            "..." +
            req.params.id.slice(req.params.id.length - 4),
        });
    }
    del_cat = await Category.findByIdAndDelete(req.params.id)
    ret
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
