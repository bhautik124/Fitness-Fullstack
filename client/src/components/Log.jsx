import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Log = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);

    try {
      const res = await axios.post(
        "https://fitness-fullstack-gii5.onrender.com/api/user/signin",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        document.cookie = `token=${res.data.token}`;

        toast.success("Login successful", {
          position: "top-center",
          autoClose: "1500",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error("Invalid Credentials");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block md:w-1/2">
        <img
          src="src/components/files/AuthImage.jpg"
          alt="Man running on treadmill"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 py-8 md:py-0 px-4">
        <ToastContainer />
        <div className="max-w-md w-full px-6 py-6 md:px-8 md:py-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
            Login to Account 👋
          </h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">
            Please enter your details to log in
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-2 text-sm md:text-base"
                htmlFor="email"
              >
                Email Address
              </label>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-2 text-sm md:text-base"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4 text-sm md:text-base">
            No account? Create a new one{" "}
            <Link to="/" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Log;
