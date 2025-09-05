const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("connection error: " + error);
  }
};

module.exports = connectDb;
