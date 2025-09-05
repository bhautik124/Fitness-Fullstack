const dotenv = require("dotenv");
const userModel = require("../models/user-model.js");
const Workout = require("../models/Workout.js");
const Contact = require("../models/contect-model.js");
const Blog = require("../models/blog-model.js");
const {createError} = require("../error.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config();
module.exports.registerUser = async function (req, res) {
  try {
    let { username, email, password } = req.body;

    let userExist = await userModel.findOne({ email });
    if (userExist) {
      return res.status(400).send("User already exists");
    }

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          let createUser = await userModel.create({
            username,
            email,
            password: hash,
          });

          let token = jwt.sign(
            { email: createUser.email, id: createUser._id },
            process.env.JWT_SECRET_KEY
          );
          res.cookie("token", token);
          res.status(201).send({ token, user: createUser });
        }
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.loginUser = async function (req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).send("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid email or password");

  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET_KEY
  );
  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ token, user });
};

module.exports.logoutUser = async function (req, res) {
  try {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).send("User logged out successfully");
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).send("Server error during logout");
  }
};

module.exports.getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await userModel.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0 // Ensure time is set to midnight
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0,
      0,
      0,
      0 // Ensure time is set to midnight of the next day
    );

    const todaysWorkouts = await Workout.find({
      user: userId, // Change 'userId' to 'user'
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

// module.exports.addWorkout = async (req, res, next) => {
//   try {
//     const userId = req.user?.id;
//     const { workoutString } = req.body;

//     console.log("Workout String:", workoutString);

//     if (!workoutString) {
//       return next(createError(400, "Workout string is missing"));
//     }

//     const eachworkout = workoutString.split(";").map((line) => line.trim());
//     console.log("Each Workout:", eachworkout);

//     const categories = eachworkout.filter((line) => line.startsWith("#"));
//     console.log("Categories:", categories);

//     if (categories.length === 0) {
//       return next(createError(400, "No categories found in workout string"));
//     }

//     const parsedWorkouts = [];
//     let currentCategory = "";
//     let count = 0;
//     const workoutNames = new Set();

//     for (const line of eachworkout) {
//       count++;
//       if (line.startsWith("#")) {
//         currentCategory = line.substring(1).trim();
//       } else {
//         const workoutDetails = parseWorkoutLine(line); // Define workoutDetails here
//         if (workoutDetails == null) {
//           return next(
//             createError(
//               400,
//               `Invalid workout string format for ${count}th workout`
//             )
//           );
//         }
//         workoutDetails.category = currentCategory;

//         // Database check for existing workout
//         const existingWorkout = await Workout.findOne({
//           workoutName: workoutDetails.workoutName,
//         });
//         if (existingWorkout) {
//           return next(
//             createError(
//               400,
//               `Workout with name ${workoutDetails.workoutName} already exists`
//             )
//           );
//         }

//         workoutDetails.sets = isNaN(workoutDetails.sets)
//           ? 1
//           : workoutDetails.sets;
//         workoutDetails.reps = isNaN(workoutDetails.reps)
//           ? 1
//           : workoutDetails.reps;
//         workoutDetails.duration = isNaN(workoutDetails.duration)
//           ? 0
//           : workoutDetails.duration;

//         if (workoutNames.has(workoutDetails.workoutName)) {
//           return next(
//             createError(
//               400,
//               `Duplicate workout name: ${workoutDetails.workoutName}`
//             )
//           );
//         }
//         workoutNames.add(workoutDetails.workoutName);

//         parsedWorkouts.push(workoutDetails);
//       }
//     }

//     for (const workout of parsedWorkouts) {
//       workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));
//       await Workout.create({ ...workout, user: userId });
//     }

//     return res.status(201).json({
//       message: "Workouts added successfully",
//       workouts: parsedWorkouts,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


module.exports.addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString } = req.body;

    console.log("Workout String:", workoutString);

    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }

    const eachworkout = workoutString.split(";").map((line) => line.trim());
    console.log("Each Workout:", eachworkout);

    const categories = eachworkout.filter((line) => line.startsWith("#"));
    console.log("Categories:", categories);

    if (categories.length === 0) {
      return next(createError(400, "No categories found in workout string"));
    }

    const parsedWorkouts = [];
    let currentCategory = "";
    let count = 0;
    const workoutNames = new Set();

    for (const line of eachworkout) {
      count++;
      if (line.startsWith("#")) {
        currentCategory = line.substring(1).trim();
      } else {
        const workoutDetails = parseWorkoutLine(line); // Parse the workout line
        if (workoutDetails == null) {
          return next(
            createError(
              400,
              `Invalid workout string format for ${count}th workout`
            )
          );
        }
        workoutDetails.category = currentCategory;

        // Database check for existing workout
        const existingWorkout = await Workout.findOne({
          workoutName: workoutDetails.workoutName,
        });
        if (existingWorkout) {
          return next(
            createError(
              400,
              `Workout with name ${workoutDetails.workoutName} already exists`
            )
          );
        }

        // Default values for missing fields
        workoutDetails.sets = isNaN(workoutDetails.sets)
          ? 1
          : workoutDetails.sets;
        workoutDetails.reps = isNaN(workoutDetails.reps)
          ? 1
          : workoutDetails.reps;
        workoutDetails.duration = isNaN(workoutDetails.duration)
          ? 0
          : workoutDetails.duration;

        if (workoutNames.has(workoutDetails.workoutName)) {
          return next(
            createError(
              400,
              `Duplicate workout name: ${workoutDetails.workoutName}`
            )
          );
        }
        workoutNames.add(workoutDetails.workoutName);

        parsedWorkouts.push(workoutDetails);
      }
    }

    for (const workout of parsedWorkouts) {
      workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));
      await Workout.create({ ...workout, user: userId });
    }

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: parsedWorkouts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.editWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.params.id;
    const { workoutName, sets, reps, duration, category } = req.body;

    const workout = await Workout.findOne({ _id: workoutId, user: userId });
    if (!workout) {
      return next(createError(404, "Workout not found"));
    }

    workout.workoutName = workoutName || workout.workoutName;
    workout.sets = sets || workout.sets;
    workout.reps = reps || workout.reps;
    workout.duration = duration || workout.duration;
    workout.category = category || workout.category;

    workout.caloriesBurned = calculateCaloriesBurnt(workout);

    await workout.save();

    res.status(200).json({ message: "Workout updated successfully", workout });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.params.id;

    const workout = await Workout.findOneAndDelete({ _id: workoutId, user: userId });
    if (!workout) {
      return next(createError(404, "Workout not found"));
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// const parseWorkoutLine = (line) => {
//   const details = {};
//   const parts = line.split(" ");

//   // Ensure to handle each case properly
//   if (parts.includes("Cycle") && parts.includes("in")) {
//     // Example: "Cycle 10km in 50 minutes"
//     details.workoutName = parts.slice(0, 2).join(" "); // "Cycle 10km"
//     details.duration = parseInt(parts[parts.length - 2], 10); // 50
//   } else if (parts.includes("Swim") && parts.includes("in")) {
//     // Example: "Swim 1000m in 30 minutes"
//     details.workoutName = parts.slice(0, 2).join(" "); // "Swim 1000m"
//     details.duration = parseInt(parts[parts.length - 2], 10); // 30
//   } else if (parts.includes("Run") && parts.includes("in")) {
//     details.workoutName = parts.slice(0, 2).join(" ");
//     details.duration = parseInt(parts[parts.length - 2], 10);
//   } else if (
//     parts.includes("Push-ups") ||
//     parts.includes("Pull-ups") ||
//     parts.includes("Squats") ||
//     parts.includes("Deadlifts") ||
//     parts.includes("Bench") ||
//     parts.includes("Lunges") ||
//     parts.includes("Curls")
//   ) {
//     details.workoutName = parts.slice(0, 2).join(" ");
//     details.sets = parseInt(parts[2], 10);
//     details.reps = parseInt(parts[4], 10);
//   } else if (parts.includes("minutes")) {
//     details.workoutName = parts.slice(3).join(" ");
//     details.duration = parseInt(parts[0], 10);
//   } else {
//     return null; // If the line doesn't match any format
//   }

//   return details;
// };


const parseWorkoutLine = (line) => {
  const details = {};

  // Strength Training Format: "Squats 5 sets of 12 reps"
  if (line.match(/\d+\s*sets\s*of\s*\d+\s*reps/)) {
    const parts = line.split(" ");
    const workoutName = parts.slice(0, -4).join(" "); // Extract workout name
    const sets = parseInt(parts[parts.length - 4], 10); // Extract sets
    const reps = parseInt(parts[parts.length - 2], 10); // Extract reps

    details.workoutName = workoutName;
    details.sets = sets;
    details.reps = reps;
  }
  // Cardio Format: "Run 5km in 30 minutes"
  else if (line.match(/\d+\s*km\s*in\s*\d+\s*minutes/)) {
    const parts = line.split(" ");
    const workoutName = parts.slice(0, 2).join(" "); // Extract workout name
    const duration = parseInt(parts[parts.length - 2], 10); // Extract duration

    details.workoutName = workoutName;
    details.duration = duration;
  }
  // General Workout Format: "30 minutes of Yoga"
  else if (line.match(/\d+\s*minutes\s*of\s*\w+/)) {
    const parts = line.split(" ");
    const workoutName = parts.slice(3).join(" "); // Extract workout name
    const duration = parseInt(parts[0], 10); // Extract duration

    details.workoutName = workoutName;
    details.duration = duration;
  }
  // Invalid Format
  else {
    return null;
  }

  return details;
};


const calculateCaloriesBurnt = (workoutDetails) => {
  // If the workout involves duration, use the existing calculation
  if (!isNaN(workoutDetails.duration) && workoutDetails.duration > 0) {
    const durationInMinutes = parseInt(workoutDetails.duration, 10);
    const weightInKg = workoutDetails.weight
      ? parseInt(workoutDetails.weight, 10)
      : 1; // Default value if weight is not present
    const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
    return durationInMinutes * caloriesBurntPerMinute * weightInKg;
  }

  // For strength-based exercises with sets and reps
  if (!isNaN(workoutDetails.sets) && !isNaN(workoutDetails.reps)) {
    const sets = parseInt(workoutDetails.sets, 10);
    const reps = parseInt(workoutDetails.reps, 10);
    const weightInKg = workoutDetails.weight
      ? parseInt(workoutDetails.weight, 10)
      : 1; // Default value if weight is not present

    // Example calculation for strength exercises
    const caloriesPerRep = 0.5; // Calories burned per rep, you can adjust this value
    return sets * reps * caloriesPerRep * weightInKg;
  }

  // Default to 0 if no valid calculation
  return 0;
};

module.exports.contect = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ message: "Contact message saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.blog = async (req, res) => {
  const { workoutName, duration, thought } = req.body;

  try {
    // Use Blog.create to create and save the new blog entry
    const savedBlog = await Blog.create({
      workoutName,
      duration,
      thought,
    });

    res.status(201).json(savedBlog); // Send the created blog entry as a response
  } catch (error) {
    console.error("Error creating blog entry:", error);
    res
      .status(500)
      .json({ message: "Error creating blog entry", error: error.message }); // Send error response
  }
};

module.exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch all blog entries
    res.status(200).json(blogs); // Send the retrieved blog entries as a response
  } catch (error) {
    console.error("Error fetching blog entries:", error);
    res
      .status(500)
      .json({ message: "Error fetching blog entries", error: error.message }); // Send error response
  }
};
