const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDashboard,
  getWorkoutsByDate,
  addWorkout,
  contect,
  blog,
  getBlogs,
  editWorkout,
  deleteWorkout,
} = require("../controllers/user-controller");

const verifyToken = require("../middleware/verifyToken.js");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.post("/logout", logoutUser);

router.get("/dashboard", verifyToken, getUserDashboard);
router.get("/workout", verifyToken, getWorkoutsByDate);
router.post("/workout", verifyToken, addWorkout);
router.put("/workout/:id" , verifyToken, editWorkout);
router.delete("/workout/:id" , verifyToken, deleteWorkout);

router.post("/contect", contect);

router.post('/blog' , blog)
router.get('/blog' , getBlogs)

module.exports = router;
