import React, { useState } from "react";
import axios from "axios";

const Contect = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    try {
      const response = await axios.post(
        "https://fitness-fullstack-gii5.onrender.com/api/user/contect",
        formData
      );

      alert("Message sent successfully!");
      console.log("Response:", response.data);

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setError("Failed to send message. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4 px-4">
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-blue-700">
          Contact Us
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm md:text-base"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm md:text-base"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-gray-700 text-sm md:text-base"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
              placeholder="Write your message"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contect;
