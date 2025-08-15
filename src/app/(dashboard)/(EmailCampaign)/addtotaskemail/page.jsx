"use client"; 

import React, { useEffect, useState } from "react";
import { useToast } from "@/app/component/customtoast/page";

const AddToTask = ({ setClose, item, userID, fetchData }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    fetchTasks(userID);
  }, [userID]); // Added userID as dependency for better practice

  const fetchTasks = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data.Tasks || []); // Ensure tasks is an array even if empty
      } else {
        setTasks([]);
        addToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTask) {
      addToast("Please select a task", "error");
      return;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/add-to-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskID: selectedTask,
            dataID: item.dataID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchData(userID);
        addToast(data.message, "success");
        setClose(false);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      addToast(error.message || "Unknown Error, try again later", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="flex flex-col bg-white px-16 py-9 w-1/2 max-w-md rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add to Task</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select
            name="task"
            id="task"
            className="border px-3 py-2 rounded bg-gray-100 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            required
          >
            <option value="">Select Task</option>
            {tasks.map((task) => (
              <option key={task.taskID} value={task.taskID}>
                {task.task}
              </option>
            ))}
          </select>

          {tasks.length === 0 && (
            <div className="text-gray-500 text-center mb-4">
              No Tasks Available
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 px-4 py-2 text-white rounded transition-colors duration-200"
              onClick={() => setClose(false)}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!selectedTask || tasks.length === 0}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 text-white rounded transition-colors duration-200"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToTask;
