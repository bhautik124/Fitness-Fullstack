import { useNavigate, NavLink } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

const Nav = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/logout",
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/login");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">Fittrack</h1>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row absolute md:static top-16 left-0 right-0 bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0 items-center space-y-4 md:space-y-0 md:space-x-6`}
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-blue-800 font-semibold"
                : "text-gray-600 hover:text-blue-800"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/workout"
            className={({ isActive }) =>
              isActive
                ? "text-blue-800 font-semibold"
                : "text-gray-600 hover:text-blue-800"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Workouts
          </NavLink>
          <NavLink
            to="/blogs"
            className={({ isActive }) =>
              isActive
                ? "text-blue-800 font-semibold"
                : "text-gray-600 hover:text-blue-800"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Blogs
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-blue-800 font-semibold"
                : "text-gray-600 hover:text-blue-800"
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </NavLink>
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
