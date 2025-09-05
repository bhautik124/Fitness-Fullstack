import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Reg = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data:", { username, email, password });

    try {
      const res = await axios.post(
        "http://localhost:8080/api/user/signup",
        { username, email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        document.cookie = `token=${res.data.token}`;

        toast.success("Register successful", {
          position: "top-center",
          autoClose: "1500",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("Error: ", err.response ? err.response.data : err.message);
      setError(err.response?.data || "An error occurred. Please try again.");
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
            Create New Account 👋
          </h2>
          <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base">
            Please enter details to create a new account
          </p>

          {error && (
            <p className="text-red-500 mb-4 text-center text-sm md:text-base">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 font-medium mb-2 text-sm md:text-base"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
              />
            </div>

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
              Sign Up
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4 text-sm md:text-base">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reg;
