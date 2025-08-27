"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft, FaObjectGroup, FaMinus, FaArrowRight, FaArrowLeft as FaArrowLeftPagination } from "react-icons/fa";
import { FiEdit, FiLayers } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "@/app/component/customtoast/page";
import Swal from "sweetalert2";

const ManageLists = () => {
  const router = useRouter();
  const { addToast } = useToast();

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editList, setEditList] = useState(null);
  const [listName, setListName] = useState("");
  const [listID, setListID] = useState("");
  const [error, setError] = useState("");
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");
  const [selectedLists, setSelectedLists] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [operationType, setOperationType] = useState(""); // "merge", "remove"
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.pic) {
      return router.push("/update-profile");
    } else {
      setUserID(userData.userID);
      fetchLists(userData.userID);
    }
  }, [router]);

  useEffect(() => {
    // Update selectAll state based on selectedLists
    if (lists.length > 0 && selectedLists.length === lists.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedLists, lists]);

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = lists.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(lists.length / recordsPerPage);

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
        setLists(data.Lists || []);
      } else {
        setLists([]);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
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
          await fetchLists(userID);
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
          await fetchLists(userID);
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
     const result = await Swal.fire({
           title: "Are you sure to delete?",
           text: "Do you want to delete this list?",
           icon: "error",
           showCancelButton: true,
           confirmButtonText: "yes, delete it",
           cancelButtonText: "Cancel",
         });
       
         if (!result.isConfirmed) return; 
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
      if (response.ok) {
        addToast("List deleted successfully!", "success");
        setLists(lists.filter((item) => item.listID !== id));
        setSelectedLists(selectedLists.filter((item) => item.listID !== id));
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

  const toggleListSelection = (list) => {
    if (selectedLists.some((selected) => selected.listID === list.listID)) {
      setSelectedLists(
        selectedLists.filter((selected) => selected.listID !== list.listID)
      );
    } else {
      setSelectedLists([...selectedLists, list]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLists([]);
    } else {
      setSelectedLists([...lists]);
    }
    setSelectAll(!selectAll);
  };

  const handleMerge = () => {
    if (selectedLists.length < 2) {
      addToast("Please select at least two lists to merge", "error");
      return;
    }
    setOperationType("merge");
    setNewListName("");
    setIsMergeModalOpen(true);
  };

  const handleRemove = () => {
    if (selectedLists.length < 2) {
      addToast("Please select at least two lists to remove duplicates", "error");
      return;
    }
    setOperationType("remove");
    setNewListName("");
    setIsRemoveModalOpen(true);
  };

  // Merge selected lists
  const performMerge = async () => {
    try {
      if (selectedLists.length < 2) {
        addToast("Please select at least two lists to merge", "error");
        return;
      }
      if (!newListName.trim()) {
        addToast("Please provide a new list name", "error");
        return;
      }

      const listIDs = selectedLists.map((list) => list.listID);

      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/merge-lists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID: userID,
            listIDs: listIDs,
            newListName: newListName,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast("Lists merged successfully!", "success");
        await fetchLists(userID);
        setSelectedLists([]);
        setIsMergeModalOpen(false);
      } else {
        addToast(data.message || "Failed to merge lists", "error");
      }
    } catch (error) {
      console.error("Error merging lists:", error);
      addToast("Failed to merge lists", "error");
    }
  };

  // Remove duplicates between two lists
  const performRemoveDuplicates = async () => {
    try {
      if (selectedLists.length !== 2) {
        addToast("Please select exactly two lists to remove duplicates", "error");
        return;
      }

      const [list1, list2] = selectedLists;

      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/remove-duplicates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list1ID: list1.listID,
            list2ID: list2.listID,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        addToast("Duplicates removed successfully!", "success");
        await fetchLists(userID);
        setSelectedLists([]);
        setIsRemoveModalOpen(false);
      } else {
        addToast(data.message || "Failed to remove duplicates", "error");
      }
    } catch (error) {
      console.error("Error removing duplicates:", error);
      addToast("Failed to remove duplicates", "error");
    }
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setRecordsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing records per page
  };

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

  const operationModalVariants = {
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
    <div className="p-4 min-h-[100px] overflow-hidden">
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
        </div>

         {/* Center: Records per page dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-sm  font-semibold text-gray-600">Show</span>
          <select
            value={recordsPerPage}
            onChange={handleRecordsPerPageChange}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <span className="text-sm font-semibold text-gray-600">Records</span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditList(null);
              setListName("");
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow transition-colors duration-200"
          >
            <FaPlus className="mr-2" /> Add New List
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMerge}
            className={`flex items-center px-4 py-2 rounded-lg shadow transition-colors duration-200 ${
              selectedLists.length < 2
                ? "bg-green-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            <FaObjectGroup className="mr-2" /> Merge
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemove}
            className={`flex items-center px-4 py-2 rounded-lg shadow transition-colors duration-200 ${
              selectedLists.length < 2
                ? "bg-red-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <FaMinus className="mr-2" /> Remove Duplicates
          </motion.button>
        </div>
      </div>

      {/* Add/Edit List Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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

      {/* Merge Modal */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
              variants={operationModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Merge Lists
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter new list name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Selected lists: {selectedLists.length}
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMergeModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={performMerge}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FaObjectGroup className="mr-2" />
                  Merge Lists
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove Duplicates Modal */}
      <AnimatePresence>
        {isRemoveModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
              variants={operationModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Remove Duplicates
              </h2>
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  This will compare the two selected lists and remove duplicate
                  entries from the second list.
                </p>
                <p className="text-sm text-gray-500">
                  Selected lists: {selectedLists.length}
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsRemoveModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={performRemoveDuplicates}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                >
                  <FaMinus className="mr-2" />
                  Remove Duplicates
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-300 rounded-xl shadow-lg md:max-h-[520px] overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {currentRecords.length > 0 ? (
                currentRecords.map((item, index) => (
                  <motion.tr
                    key={item.listID}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={rowVariants}
                    className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLists.some(
                          (selected) => selected.listID === item.listID
                        )}
                        onChange={() => toggleListSelection(item)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/list-data?item=${encodeURIComponent(
                          JSON.stringify(item)
                        )}`}
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
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(item)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit List"
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(item.listID)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete List"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        {/* Left: Showing entries */}
        <div className="text-sm font-semibold ml-2 text-gray-600">
          Showing {indexOfFirstRecord + 1} to{" "}
          {Math.min(indexOfLastRecord, lists.length)} of {lists.length} toatl entries
        </div>


        {/* Right: Pagination buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
              currentPage === 1
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <FaArrowLeftPagination className="inline mr-1" /> Previous
          </motion.button>
          <span className="px-4 py-2 border border-blue-600 rounded-lg text-[12px] font-medium bg-blue-600 text-white">
            {currentPage}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
              currentPage === totalPages
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next <FaArrowRight className="inline ml-1" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ManageLists;