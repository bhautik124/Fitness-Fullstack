import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Writeblog = () => {
  const [formData, setFormData] = useState({
    workoutName: "",
    duration: "",
    thought: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    try {
      const response = await axios.post(
        "https://fitness-fullstack-gii5.onrender.com/api/user/blog",
        formData
      );

      alert("Blog entry posted successfully!");
      console.log("Response:", response.data);

      setFormData({
        workoutName: "",
        duration: "",
        thought: "",
      });
      navigate("/blogs");
    } catch (error) {
      setError("Failed to post blog entry. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl md:text-2xl flex items-center justify-center font-bold mb-4 md:mb-6 text-blue-700">
          Write Today's Thought
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label
              htmlFor="workoutName"
              className="block text-gray-700 text-sm md:text-base"
            >
              Workout Name
            </label>
            <input
              type="text"
              id="workoutName"
              name="workoutName"
              value={formData.workoutName}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Enter workout name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-gray-700 text-sm md:text-base"
            >
              Duration
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Enter duration"
              required
            />
          </div>
          <div>
            <label
              htmlFor="thought"
              className="block text-gray-700 text-sm md:text-base"
            >
              Thought
            </label>
            <textarea
              id="thought"
              name="thought"
              value={formData.thought}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Write your thought"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-10">
            <button
              type="submit"
              className="w-full sm:w-auto px-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm md:text-base"
            >
              Post Your Thought
            </button>
            <Link to="/blogs" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full px-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm md:text-base"
              >
                Back to the Blogs
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Writeblog;
