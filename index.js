const express = require("express");
const app = express();
const ConnectToDB = require("./DBConnect");
ConnectToDB();
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cors());
app.use(cookieParser());
dotenv.config("./.env");
// var bodyParser = require("body-parser");

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

const port = process.env.PORT || 6000;

app.get("/get-tokens", (req, res) => {
  const { authToken } = req.cookies;
  if (!authToken) {
    return res
      .status(400)
      .send({ success: false, message: "No authentication tokens found." });
  }
  return res.status(200).send({ success: true, authToken });
});

app.use(
  "/api/v1",
  require("./routes/UserRoute"),
  require("./routes/CategoryRoute"),
  require("./routes/BlogRoute")
);

app.listen(port, () => {
  console.log("App is running on PORT:" + port);
});
