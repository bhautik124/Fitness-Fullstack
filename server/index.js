const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const cookieParser = require("cookie-parser");
const path = require("path");
const connect = require("./utils/db.js");
const userRouter = require("./routes/user-route.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    credentials: true,
  })
);

app.use("/api/user/", userRouter);

const PORT = process.env.PORT || 5000;
connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});
