const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const JWT_SEC = process.env.JWT_SEC;
const bcrypt = require("bcryptjs");
const fs = require("fs");
const password_generator = require("generate-password");
const verifyUser = require("../middlewares/GetUser");
const sendEmail = require("../utils/sendEmail");
const verifyRole = require("../middlewares/GetUserRole");
const upload = require('../storage/CreateStorage')

// Create User
router.post(
  "/user/create",
  [body("email", "Email is required").isEmail()],
  upload.single("userProfile"),
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { email } = req.body;
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .send({ success: false, message: "User already exists" });
      }
      const e = email.split("@");
      const random_password = password_generator.generate({
        length: 10,
        numbers: true,
      });
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(random_password, salt);
      user = await User.create({
        name: e[0].replace(".", "-"),
        email,
        password: hashPass,
        profile: {
          data: fs.readFileSync("uploads/" + req.file.filename),
          contentType: "image/png",
        },
      });
      const subject = `User has been created`;
      await sendEmail({
        email,
        subject,
        pass: random_password,
      });
      return res
        .status(201)
        .send({ success: true, message: "Please check your email." });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: true, message: "Internal server error" });
    }
  }
);

// Create Admin
router.post(
  "/admin/create",
  [body("email", "Email is required").isEmail()],
  upload.single("userProfile"),
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { email, role } = req.body;
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .send({ success: false, message: "User already exists" });
      }
      const e = email.split("@");
      const random_password = password_generator.generate({
        length: 10,
        numbers: true,
      });
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(random_password, salt);
      user = await User.create({
        name: e[0].replace(".", "-"),
        email,
        password: hashPass,
        profile: {
          data: fs.readFileSync("uploads/" + req.file.filename),
          contentType: "image/png",
        },
        role,
      });
      const subject = `Admin account has been created`;
      await sendEmail({
        email,
        subject,
        pass: random_password,
      });
      return res
        .status(201)
        .send({ success: true, message: "Please check your email." });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: true, message: "Internal server error" });
    }
  }
);

// Login User
router.post(
  "/user/login",
  [
    body("email", "Email is required").isEmail(),
    body("password", "Password is required").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(body);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .send({ success: false, message: "No user found" });
      }
      const compare_password = await bcrypt.compare(password, user.password);
      if (!compare_password) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid credientials" });
      }
      const payload = {
        user: user.id,
      };
      const authToken = await jwt.sign(payload, JWT_SEC);
      res.cookie("authToken", authToken, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
      });
      return res.status(200).send({ success: true, authToken });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  }
);

// Reset Password - Without login
router.put("/reset/pass", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.find({ email });
    if (user.length === 0) {
      return res.status(400).send({
        success: false,
        message: "No user found related to " + email,
      });
    }
    if (email !== user[0].email) {
      return res.status(400).send({
        success: false,
        message: "No user found related to " + email,
      });
    }
    let new_pass = {};
    const salt = await bcrypt.genSalt(10);
    const hash_pass = await bcrypt.hash(password, salt);
    if (new_pass) {
      new_pass.password = hash_pass;
    }
    user = await User.findByIdAndUpdate(
      user[0].id,
      { $set: new_pass },
      { $new: true }
    );
    const subject = "Your password has been updated";
    await sendEmail({
      email,
      subject,
      pass: password,
    });
    return res
      .status(201)
      .send({ success: true, message: "Your password has been updated" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Get logged in User Details
router.get("/user/details", verifyUser, async (req, res) => {
  try {
    let user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    return res.status(200).send({ success: true, user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
});

// Update Logged In User Details
router.put("/user/update", verifyUser, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    if (!user) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    const updated = {};
    const { name, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const updated_pass = await bcrypt.hash(password, salt);
    if (updated) {
      updated.name = name;
    }
    if (updated) {
      updated.password = updated_pass;
    }
    user = await User.findByIdAndUpdate(
      req.user,
      { $set: updated },
      { new: true }
    );
    return res.status(201).send({
      success: true,
      message: "Records has been updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: true, message: "Internal server error" });
  }
});

// Get all users details - Admin
router.get("/admin/users/details", verifyRole, async (req, res) => {
  try {
    let users = await User.findById(req.user);
    if (!users) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    users = await User.find().select('-password');
    return res.status(200).send({ success: true, users, total: users.length });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: true, message: "Internal server error" });
  }
});

// Delete User
router.delete("/user/delete", verifyUser, async (req, res) => {
  try {
    let user = await User.findById(req.user);
    if (!user) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    user = await User.findByIdAndDelete(req.user);
    return res.status(400).send({
      success: false,
      message:
        "Account has been deleted with ID: " +
        req.user.slice(0, 4) +
        "..." +
        req.user.slice(req.user.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: true, message: "Internal server error" });
  }
});

// Delete specific user - Admin
router.delete("/admin/user/delete/:id", verifyRole, async (req, res) => {
  try {
    let users = await User.findById(req.user);
    if (!users) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    users = await User.findByIdAndDelete(req.params.id);
    if (!users) {
      return res.status(400).send({
        success: false,
        message:
          "No user found with ID: " +
          req.user.slice(0, 4) +
          "..." +
          req.user.slice(req.user.length - 4),
      });
    }
    return res.status(200).send({
      success: true,
      message:
        "User has been deleted with ID: " +
        req.params.id.slice(0, 4) +
        "..." +
        req.params.id.slice(req.params.id.length - 4),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: true, message: "Internal server error" });
  }
});

// Logout User
router.get('/user/logout', verifyUser,async(req,res) => {
  try {
    const user = await User.findById(req.user)
    if(!user){
      return res.status(400).send({success: false, message: 'No User found'})
    }
    res.clearCookie('authToken')
    return res.status(200).send({success: true, message: 'Logged out successfully'})
  } catch (error) {
    console.log(error);
    return res.status(500).send({success: false, message: 'Internal server error'})
  }
})

module.exports = router;
