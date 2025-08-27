'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { FiEdit, FiLayers } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/app/component/customtoast/page";
import Swal from "sweetalert2";

const ManageTasks = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskName, setTaskName] = useState("");
  const [taskID, setTaskID] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page

  const { addToast } = useToast();

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/work/login");
      return;
    } else {
      setUserData(storedUserData);
      setUserID(storedUserData.userID);
      fetchTasks(storedUserData.userID);
    }
  }, [router]);

  const fetchTasks = async (userID) => {
    if (!userID) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data.Tasks || []);
      } else {
        setTasks([]);
        addToast(data.message || "Failed to fetch tasks", "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addToast("Failed to fetch tasks", "error");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }

    // Clear error when validation passes
    setError("");

    try {
      setIsLoading(true);

      if (editTask) {
        // Edit existing task
        const response = await fetch(
          "https://www.margda.in/miraj/work/task/edit-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: taskName.trim(), taskID: taskID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("Task updated successfully!", "success");
          await fetchTasks(userID);
        } else {
          addToast(data.message || "Failed to update Task", "error");
        }
      } else {
        // Add new task
        const response = await fetch(
          "https://www.margda.in/miraj/work/task/add-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: taskName.trim(), userID: userID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("Task added successfully!", "success");
          await fetchTasks(userID);
        } else {
          addToast(data.message || "Failed to add Task", "error");
        }
      }

      // Reset form and close modal
      resetModal();
    } catch (error) {
      console.error("Error:", error);
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditTask(item);
    setTaskName(item.task);
    setTaskID(item.taskID);
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (taskID) => {
   
     const result = await Swal.fire({
           title: "Are you sure to delete?",
           text: "Do you want to delete this task?",
           icon: "error",
           showCancelButton: true,
           confirmButtonText: "yes, delete it",
           cancelButtonText: "Cancel",
         });
       
         if (!result.isConfirmed) return; 

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/delete-task",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast("Task deleted successfully!", "success");
        await fetchTasks(userID);
      } else {
        addToast(data.message || "Failed to delete Task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      addToast("Failed to delete task", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const resetModal = () => {
    setTaskName("");
    setError("");
    setEditTask(null);
    setTaskID("");
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setTaskName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTasks.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTasks.length / recordsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Show loading if user data is not loaded yet
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-5 min-h-[100px] overflow-hidden">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header with Brand Name, Title, and Back Button */}
      <div className="relative flex justify-between items-center mb-6">
        {/* Center: Tasks Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center absolute left-1/2 transform -translate-x-1/2">
          Tasks
        </h1>

        {/* Right: Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-white border border-gray-300 shadow-md p-2 rounded-md bg-blue-600 hover:scale-105 transition-all duration-200 text-sm font-medium"
          aria-label="Go back to previous page"
        >
          <FaArrowLeft className="mr-2" size={16} />
          Back
        </button>
      </div>

      
<div className="flex justify-between items-center my-6">
  {/* Left: Search Bar */}
  <div className="flex items-center space-x-2">
    <div className="relative">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none transition-all duration-200 w-64"
      />
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  </div>

  {/* Center: Records Per Page */}
  <div className="flex items-center space-x-2">
    <span className="text-sm font-semibold text-gray-600">Show</span>
    <select
      value={recordsPerPage}
      onChange={handleRecordsPerPageChange}
      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
    </select>
    <span className="text-sm font-semibold  text-gray-600">Records</span>
  </div>

  {/* Right: Add New Task Button */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => {
      setEditTask(null);
      setTaskName("");
      setError("");
      setIsModalOpen(true);
    }}
    disabled={isLoading}
    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <FaPlus className="mr-2" /> Add New Task
  </motion.button>
</div>


      {/* Modal for Add/Edit Task */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                resetModal();
              }
            }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {editTask ? "Edit Task" : "Create New Task"}
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={handleInputChange}
                  placeholder="Enter task name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  autoFocus
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetModal}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : editTask ? (
                    <FaEdit className="mr-2" />
                  ) : (
                    <FaPlus className="mr-2" />
                  )}
                  {isLoading
                    ? "Processing..."
                    : editTask
                    ? "Update Task"
                    : "Add Task"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks Table */}
      <div className="overflow-x-auto bg-white border border-gray-300 rounded-xl shadow-lg md:max-h-[550px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                S.No
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Task Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                      Loading tasks...
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((item, index) => (
                  <motion.tr
                    key={item.taskID}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={rowVariants}
                    className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-900">
                      {indexOfFirstRecord + index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {item.task}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(item)}
                          disabled={isLoading}
                          className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit task"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.taskID)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete task"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm
                      ? `No tasks found matching "${searchTerm}"`
                      : "No tasks available"}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between ml-2 items-center mt-6">
        {/* Left: Showing Entries */}
        <div className="text-[12px] font-semibold text-gray-600">
          Showing {filteredTasks.length > 0 ? indexOfFirstRecord + 1 : 0} to{" "}
          {Math.min(indexOfLastRecord, filteredTasks.length)} of {filteredTasks.length} total entries
        </div>

        {/* Right: Pagination Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <FaArrowLeft className="inline mr-1" /> Previous
          </motion.button>
          <span className="px-4 py-2 border border-blue-600 rounded-lg text-[12px] font-medium bg-blue-600 text-white">
            {currentPage}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
             <FaArrowRight className="inline mr-1" /> Next
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;