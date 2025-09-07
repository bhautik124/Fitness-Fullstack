import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Workouts = () => {
  const [date, setDate] = useState(new Date());
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      const formattedDate = date.toLocaleDateString("en-CA");
      setLoading(true);
      try {
        const response = await fetch(
          `https://fitness-fullstack-gii5.onrender.com/api/user/workout?date=${formattedDate}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        console.error("Error fetching workout:", error);
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          Today's Workout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-blue-700 font-semibold mb-3 md:mb-4 text-sm md:text-base">
              Select Date
            </h3>
            <Calendar
              onChange={handleDateChange}
              value={date}
              className="text-sm md:text-base"
            />
          </div>

          <div className="bg-white p-4 md:p-6 rounded shadow">
            <h3 className="text-gray-700 font-semibold mb-3 md:mb-4 text-sm md:text-base">
              Today's Workout
            </h3>
            {loading ? (
              <p>Loading...</p>
            ) : workout &&
              workout.todaysWorkouts &&
              workout.todaysWorkouts.length > 0 ? (
              workout.todaysWorkouts.map((w, index) => (
                <div
                  key={index}
                  className="border p-3 md:p-4 mb-3 md:mb-4 rounded bg-gray-50 shadow"
                >
                  <p className="font-bold text-base md:text-lg mb-1 md:mb-2">
                    {w.workoutName}
                  </p>
                  <p className="text-xs md:text-sm">Category: {w.category}</p>
                  <p className="text-xs md:text-sm">Sets: {w.sets}</p>
                  <p className="text-xs md:text-sm">Reps: {w.reps}</p>
                  <p className="text-xs md:text-sm">
                    Duration: {w.duration} minutes
                  </p>
                  <p className="text-xs md:text-sm">
                    Calories Burned: {w.caloriesBurned}
                  </p>
                </div>
              ))
            ) : (
              <p>No workout found for this date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
