const mongoose = require("mongoose");

// Define the schema for the blog
const blogSchema = new mongoose.Schema({
  workoutName: {
    type: String,
    required: true, // This field is required
  },
  duration: {
    type: String, // Assuming duration is in minutes or seconds
    required: true, // This field is required
  },
  thought: {
    type: String,
    required: true, // This field is required
  },
});

// Create the model
const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
