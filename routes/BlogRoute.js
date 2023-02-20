const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Blog = require("../models/BlogModel");
const User = require("../models/UserModel");
const upload = require("../storage/CreateStorage");
const verifyUser = require("../middlewares/GetUser");
const verifyRole = require("../middlewares/GetUserRole");
const fs = require("fs");

// Create Blog - Login Required
router.post(
  "/user/blog/create",
  verifyUser,
  [
    body("title", "Title is required").isLength({ min: 3 }),
    body("category", "Category is required").isLength({ min: 3 }),
    body("description", "Description is required").isLength({ min: 10 }),
  ],
  upload.single("feature-img"),
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
      const { title, category, description } = req.body;
      const blog = await Blog.create({
        user: req.user,
        title,
        category,
        description,
        blog_feature_img: {
          data: fs.readFileSync("uploads/" + req.file.filename),
          contentType: "image/png",
        },
        author: user.name,
        author_profile: user.profile,
      });
      return res.status(201).send({ success: true, blog });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);

// Get all Blogs
router.get("/blogs/all", async (req, res) => {
  try {
    const blogs = await Blog.find();
    return res.status(200).send({ success: true, blogs, total: blogs.length });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Get Specific Blog - ID Wise
router.get("/blog/:id", async (req, res) => {
  try {
    const blogs = await Blog.findById(req.params.id);
    if (!blogs) {
      return res
        .status(400)
        .send({
          success: false,
          message:
            "No blog found with ID: " +
            req.params.id.slice(0, 4) +
            "..." +
            req.params.id.slice(req.params.id.length - 4),
        });
    }
    return res.status(200).send({ success: true, blogs, total: blogs.length });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Get all Blogs - Categories Wise
router.get("/blogs/category/:cat_name", async (req, res) => {
  try {
    const blog = await Blog.find();
    let a = [];
    const filter_cat = (category) => {
      const b =
        blog &&
        blog.filter((curElem) => {
          return curElem.category === category;
        });
      a.push(b);
    };
    if (!req.params.cat_name) {
      return res
        .status(400)
        .send({ success: false, message: "No Category Found" });
    }
    filter_cat(req.params.cat_name);
    const sp = { ...a };
    return res.status(200).send({
      success: true,
      blogs: sp[0],
      category: req.params.cat_name,
      total: sp[0].length,
    });
  } catch (error) {}
});

// Get all Blogs - Author Wise
router.get("/blogs/author/:author_name", async (req, res) => {
  try {
    const blog = await Blog.find();
    let a = [];
    const filter_cat = (author) => {
      const b =
        blog &&
        blog.filter((curElem) => {
          return curElem.author === author;
        });
      a.push(b);
    };
    if (!req.params.author_name) {
      return res
        .status(400)
        .send({ success: false, message: "No Author Found" });
    }
    filter_cat(req.params.author_name);
    const sp = { ...a };
    return res.status(200).send({
      success: true,
      blogs: sp[0],
      author: req.params.author_name,
      total: sp[0].length,
    });
  } catch (error) {}
});

module.exports = router;
