import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("https://fitness-fullstack-gii5.onrender.com/api/user/blog");
      setBlogs(response.data);
    } catch (error) {
      setError("Failed to fetch blog entries.");
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-4 md:mb-8">
          Today's Thoughts
        </h1>

        <Link to="/write">
          <button className="bg-blue-500 fixed right-4 bottom-4 md:top-24 md:bottom-auto z-10 text-white px-4 py-2 rounded shadow-md">
            Write
          </button>
        </Link>

        {error && <div className="text-red-500 text-center">{error}</div>}
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="bg-white p-4 md:p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-2">
              Today's Thought
            </h2>
            <p className="text-gray-700 text-lg md:text-xl mb-2">
              {blog.workoutName}
            </p>
            <p className="text-gray-500 mb-3 md:mb-4">
              Duration: {blog.duration} minutes
            </p>
            <p className="text-gray-600">{blog.thought}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
