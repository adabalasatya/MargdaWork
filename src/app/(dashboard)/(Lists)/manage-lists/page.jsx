'use client';

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft } from "react-icons/fa";
import { FiEdit, FiLayers } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/app/component/customtoast/page";

const ManageLists = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editList, setEditList] = useState(null);
  const [listName, setListName] = useState("");
  const [listID, setListID] = useState("");
  const [error, setError] = useState("");
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");

  const { addToast } = useToast();

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.pic) {
      return router.push("/work/login");
    } else {
      setUserID(userData.userID);
      fetchLists(userData.userID);
    }
  }, []);

  const fetchLists = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/get-lists",
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
        setLists(data.Lists || []); // Ensure lists is an array even if empty
      } else {
        setLists([]);
        addToast(data.message || "Failed to fetch lists", "error");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      addToast("Failed to fetch lists", "error");
    }
  };

  const handleSubmit = async () => {
    if (!listName) {
      setError("List name is required");
      return;
    }

    try {
      if (editList) {
        // Edit existing list
        const response = await fetch(
          "https://www.margda.in/miraj/work/lists/edit-list",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: listName, listID: listID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("List updated successfully!", "success");
          await fetchLists(userID); // Refresh the list
        } else {
          addToast(data.message || "Failed to update list", "error");
        }
      } else {
        // Add new list
        const response = await fetch(
          "https://www.margda.in/miraj/work/lists/add-list",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: listName, userID: userID }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast("List added successfully!", "success");
          await fetchLists(userID); // Refresh the list
        } else {
          addToast(data.message || "Failed to add list", "error");
        }
      }

      // Reset form and close modal
      setListName("");
      setError("");
      setEditList(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      addToast("An error occurred. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/delete-list",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listID: id }),
        }
      );
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        addToast("List deleted successfully!", "success");
        setLists(lists.filter((item) => item.listID !== id)); // Update UI immediately
      } else {
        addToast(data.message || "Failed to delete list", "error");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      addToast("Failed to delete list", "error");
    }
  };

  const handleEdit = (item) => {
    setEditList(item);
    setListName(item.name);
    setListID(item.listID);
    setIsModalOpen(true);
  };

  const handleBack = () => {
    router.back();
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

  return (
    <div className="p-6 min-h-screen">
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
        {/* Center: Subscriber Lists Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center absolute left-1/2 transform -translate-x-1/2">
          Lists
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
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search lists..."
              className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditList(null);
              setListName("");
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-colors duration-200"
          >
            <FaPlus className="mr-2" /> Add New List
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {editList ? "Edit List" : "Create New List"}
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setEditList(null);
                    setListName("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  {editList ? (
                    <FaEdit className="mr-2" />
                  ) : (
                    <FaPlus className="mr-2" />
                  )}
                  {editList ? "Update List" : "Add List"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto bg-white border border-gray-300 rounded-xl shadow-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                List
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                GDPR
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Segs
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ARs
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Unsubscribed
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Bounced
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Edit
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {lists.length > 0 ? (
                lists.map((item, index) => (
                  <motion.tr
                    key={item.listID}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={rowVariants}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-600">{item.listID}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/list-data?item=${encodeURIComponent(JSON.stringify(item))}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.gdpr || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.segs || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.ars || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.unsubscribed || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.bounced || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <FaEdit />
                      </motion.button>
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(item.listID)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrash />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No Lists Available
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageLists;
