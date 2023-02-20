const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SEC = process.env.JWT_SEC;

const verifyUser = async (req, res, next) => {
  try {
    let { authToken } = req.cookies;
    if (!authToken) {
      return res
        .status(400)
        .send({
          success: false,
          message: "Please login to access this resource",
        });
    }
    const decode_jwt = await jwt.verify(authToken, JWT_SEC);
    req.user = decode_jwt.user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = verifyUser;
