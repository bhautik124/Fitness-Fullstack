import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCaloriesBurnt: 0,
    totalWorkouts: 0,
    avgCaloriesBurntPerWorkout: 0,
    totalWeeksCaloriesBurnt: {
      weeks: [],
      caloriesBurned: [],
    },
  });

  const [workoutString, setWorkoutString] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editedWorkout, setEditedWorkout] = useState({
    workoutName: "",
    sets: "",
    reps: "",
  });

  // New simple form state
  const [showSimpleForm, setShowSimpleForm] = useState(true);
  const [workoutForm, setWorkoutForm] = useState({
    category: "Strength",
    workoutName: "",
    sets: "",
    reps: "",
    duration: "",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "https://fitness-fullstack-gii5.onrender.com/api/user/dashboard",
          { withCredentials: true }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error(
          "Error fetching dashboard data:",
          error.response?.data || error.message
        );
      }
    };

    const fetchWorkouts = async () => {
      try {
        const response = await axios.get(
          "https://fitness-fullstack-gii5.onrender.com/api/user/workout",
          { withCredentials: true }
        );
        setWorkouts(response.data.todaysWorkouts);
      } catch (error) {
        console.error(
          "Error fetching workouts:",
          error.response?.data || error.message
        );
      }
    };

    fetchDashboardData();
    fetchWorkouts();
  }, []);

  const handleAddWorkout = async () => {
    try {
      let workoutStringToSend = "";

      if (showSimpleForm) {
        // Convert simple form to workout string format
        const { category, workoutName, sets, reps, duration } = workoutForm;

        if (!category || !workoutName) {
          toast.error("Please fill in workout name", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }

        // Build workout string based on category
        if (category === "Strength" && sets && reps) {
          workoutStringToSend = `#${category};${workoutName} ${sets} sets of ${reps} reps`;
        } else if (category === "Cardio" && duration) {
          workoutStringToSend = `#${category};${duration} minutes of ${workoutName}`;
        } else {
          toast.error("Please fill in all required fields", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }
      } else {
        workoutStringToSend = workoutString;
      }

      const response = await axios.post(
        "https://fitness-fullstack-gii5.onrender.com/api/user/workout",
        { workoutString: workoutStringToSend },
        { withCredentials: true }
      );

      setWorkouts((prevWorkouts) => {
        if (Array.isArray(prevWorkouts)) {
          return [...prevWorkouts, ...response.data.workouts];
        } else {
          return [...response.data.workouts];
        }
      });

      const dashboardResponse = await axios.get(
        "https://fitness-fullstack-gii5.onrender.com/api/user/dashboard",
        { withCredentials: true }
      );
      setDashboardData(dashboardResponse.data);

      toast.success("Workout added successfully", {
        position: "top-center",
        autoClose: 1000,
      });

      // Reset forms
      setWorkoutString("");
      setWorkoutForm({
        category: "Strength",
        workoutName: "",
        sets: "",
        reps: "",
        duration: "",
      });
    } catch (error) {
      console.error("Error adding workout:", error);
      
      if (error.response?.status === 403) {
        toast.error("Please login first to add workouts", {
          position: "top-center",
          autoClose: 3000,
        });
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error(
          error.response?.data?.message || error.response?.data || "Error adding workout",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
      }
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setEditedWorkout({
      workoutName: workout.workoutName,
      sets: workout.sets,
      reps: workout.reps,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `https://fitness-fullstack-gii5.onrender.com/api/user/workout/${editingWorkout._id}`,
        editedWorkout,
        { withCredentials: true }
      );

      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((workout) =>
          workout._id === editingWorkout._id ? response.data.workout : workout
        )
      );

      const dashboardResponse = await axios.get(
        "https://fitness-fullstack-gii5.onrender.com/api/user/dashboard",
        { withCredentials: true }
      );
      setDashboardData(dashboardResponse.data);

      setIsEditModalOpen(false);

      toast.success("Workout updated successfully", {
        position: "top-center",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error(
        "Error updating workout:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    try {
      await axios.delete(
        `https://fitness-fullstack-gii5.onrender.com/api/user/workout/${workoutId}`,
        { withCredentials: true }
      );

      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((workout) => workout._id !== workoutId)
      );

      toast.success("Workout deleted successfully", {
        position: "top-center",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error(
        "Error deleting workout:",
        error.response?.data || error.message
      );
    }
  };

  const weeklyCaloriesData = {
    labels: dashboardData.totalWeeksCaloriesBurnt.weeks,
    datasets: [
      {
        label: "Weekly Calories Burned",
        data: dashboardData.totalWeeksCaloriesBurnt.caloriesBurned,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          Dashboard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-blue-700 font-semibold text-sm md:text-base">
              Total Calories Burned
            </h3>
            <p className="text-xl md:text-2xl">
              {dashboardData.totalCaloriesBurnt} kcal
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Calories burned today
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-blue-700 font-semibold text-sm md:text-base">
              Total Workouts
            </h3>
            <p className="text-xl md:text-2xl">{dashboardData.totalWorkouts}</p>
            <p className="text-xs md:text-sm text-gray-500">
              Workouts completed today
            </p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-blue-700 font-semibold text-sm md:text-base">
              Average Calories Burned Per Workout
            </h3>
            <p className="text-xl md:text-2xl">
              {dashboardData.avgCaloriesBurntPerWorkout} kcal
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Average calories per workout
            </p>
          </div>
        </div>
        <ToastContainer />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-blue-700 font-semibold text-sm md:text-base">
              Weekly Calories Burned
            </h3>
            <div style={{ height: "250px", width: "100%" }}>
              <Bar
                data={weeklyCaloriesData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-700 font-semibold text-sm md:text-base">
                Add New Workout
              </h3>
              <button
                className="text-xs text-blue-500 underline"
                onClick={() => setShowSimpleForm(!showSimpleForm)}
              >
                {showSimpleForm ? "Advanced Mode" : "Simple Mode"}
              </button>
            </div>

            {showSimpleForm ? (
              // Simple Form
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Type *
                  </label>
                  <select
                    className="w-full p-2 border rounded text-sm md:text-base"
                    value={workoutForm.category}
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, category: e.target.value })
                    }
                  >
                    <option value="Strength">Strength Training</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Push-ups, Running, Yoga"
                    className="w-full p-2 border rounded text-sm md:text-base"
                    value={workoutForm.workoutName}
                    onChange={(e) =>
                      setWorkoutForm({ ...workoutForm, workoutName: e.target.value })
                    }
                  />
                </div>

                {workoutForm.category === "Strength" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sets *
                      </label>
                      <input
                        type="number"
                        placeholder="3"
                        className="w-full p-2 border rounded text-sm md:text-base"
                        value={workoutForm.sets}
                        onChange={(e) =>
                          setWorkoutForm({ ...workoutForm, sets: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reps *
                      </label>
                      <input
                        type="number"
                        placeholder="12"
                        className="w-full p-2 border rounded text-sm md:text-base"
                        value={workoutForm.reps}
                        onChange={(e) =>
                          setWorkoutForm({ ...workoutForm, reps: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      className="w-full p-2 border rounded text-sm md:text-base"
                      value={workoutForm.duration}
                      onChange={(e) =>
                        setWorkoutForm({ ...workoutForm, duration: e.target.value })
                      }
                    />
                  </div>
                )}

                <button
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm md:text-base font-medium transition-colors"
                  onClick={handleAddWorkout}
                >
                  Add Workout
                </button>
              </div>
            ) : (
              // Advanced Mode
              <div>
                <div className="relative mt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Format: #Category;Exercise sets/duration info
                  </label>
                  <textarea
                    className="w-full h-32 p-2 border rounded text-sm md:text-base"
                    placeholder="#Strength;Push-ups 3 sets of 15 reps"
                    value={workoutString}
                    onChange={(e) => setWorkoutString(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm md:text-base font-medium transition-colors"
                  onClick={handleAddWorkout}
                >
                  Add Workout
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-6 mb-4 md:mb-6">
          Today's Workouts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {workouts.map((workout, index) => (
            <div key={index} className="bg-white p-4 md:p-6 rounded shadow">
              <h3 className="text-blue-700 font-semibold text-sm md:text-base">
                {workout.workoutName}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                Duration: {workout.duration} minutes
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Sets: {workout.sets}, Reps: {workout.reps}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Calories Burned: {workout.caloriesBurned}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm"
                  onClick={() => handleEditWorkout(workout)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs md:text-sm"
                  onClick={() => handleDeleteWorkout(workout._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <h2 className="text-lg md:text-xl font-bold mb-4">Edit Workout</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editedWorkout.workoutName}
                onChange={(e) =>
                  setEditedWorkout({
                    ...editedWorkout,
                    workoutName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sets
              </label>
              <input
                type="number"
                value={editedWorkout.sets}
                onChange={(e) =>
                  setEditedWorkout({ ...editedWorkout, sets: e.target.value })
                }
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reps
              </label>
              <input
                type="number"
                value={editedWorkout.reps}
                onChange={(e) =>
                  setEditedWorkout({ ...editedWorkout, reps: e.target.value })
                }
                className="w-full p-2 border rounded text-sm md:text-base"
              />
            </div>
            <button
              className="mt-4 bg-blue-500 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base"
              onClick={handleSaveEdit}
            >
              Save Changes
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
