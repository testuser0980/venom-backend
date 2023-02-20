const express = require("express");
const router = express.Router();

// Get Cache
router.get("check-tokens", (req, res) => {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res
      .status(400)
      .send({ success: false, message: "No authentication tokens found." });
  }
  return res.status(200).send({ success: true, authToken });
});

module.exports = router;
