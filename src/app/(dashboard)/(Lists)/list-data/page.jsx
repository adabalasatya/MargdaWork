'use client';
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Users, Settings } from "lucide-react";
import { FaArrowLeft, FaEdit, FaSearch, FaTrash, FaDownload, FaPlus } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddListDataForm from "@/app/(dashboard)/(Lists)/AddListForm/page";

const ListData = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [addDataFormOpen, setAddDataFormOpen] = useState(false);
  const [editDataFormOpen, setEditDataFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [listData, setListData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAutorespondersModal, setShowAutorespondersModal] = useState(false);
  const [showSubscribeFormModal, setShowSubscribeFormModal] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showCsvData, setShowCsvData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pieData, setPieData] = useState([
    { name: "Active", value: 0, color: "#10b981" },
    { name: "Unconfirmed", value: 0, color: "#9ca3af" },
    { name: "Unsubscribed", value: 0, color: "#ef4444" },
    { name: "Bounced", value: 0, color: "#4b5563" },
    { name: "Marked as spam", value: 0, color: "#374151" },
  ]);
  const [filters, setFilters] = useState([
    { name: "All", count: 0, color: "bg-blue-500" },
    { name: "Active", count: 0, color: "bg-green-500" },
    { name: "Unsubscribed", count: 0, color: "bg-red-500" },
  ]);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.pic) {
      router.push("/login");
    } else {
      setUserID(userData.userID);
    }
  }, [router]);

  const chartDataStatic = [
    { date: "Jun 24", subscribers: 120 },
    { date: "Jul 24", subscribers: 145 },
    { date: "Aug 24", subscribers: 180 },
    { date: "Sep 24", subscribers: 210 },
    { date: "Oct 24", subscribers: 240 },
    { date: "Nov 24", subscribers: 275 },
    { date: "Dec 24", subscribers: 290 },
    { date: "Jan 25", subscribers: 295 },
    { date: "Feb 25", subscribers: 300 },
    { date: "Mar 25", subscribers: 305 },
    { date: "Apr 25", subscribers: 305 },
    { date: "May 25", subscribers: 305 },
  ];

  useEffect(() => {
    const state = JSON.parse(searchParams.get("item") || "{}");
    if (state && state.listID) {
      setListData(state);
      const listID = parseInt(state.listID);
      if (!isNaN(listID)) {
        fetchSubscribers(listID);
      } else {
        console.error("Invalid listID:", state.listID);
        addToast("Invalid list ID. Redirecting to lists page.", "error");
      }
    } else {
      console.error("No valid listData found");
      addToast("No valid list data found. Redirecting to lists page.", "error");
    }
  }, [searchParams, router]);

  const fetchSubscribers = async (listID) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/get-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const subscriberData = data.Data;
        if (subscriberData.length > 0) {
          setSubscribers(subscriberData);
          updateCharts(subscriberData);
        } else {
          console.warn("No subscribers found for listID:", listID);
          setSubscribers([]);
          addToast("No subscribers found for this list.", "info");
        }
      } else {
        setSubscribers([]);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      addToast("Error fetching subscribers: " + error.message, "error");
      setSubscribers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharts = (subscribers) => {
    const statusCounts = subscribers.reduce(
      (acc, sub) => {
        const status = sub.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { All: subscribers.length }
    );
    const all = subscribers.length;
    const subscribed = subscribers.filter((item) => item.status).length;
    const unsubscribed = subscribers.filter((item) => !item.status).length;
    const newPieData = [
      { name: "Active", value: statusCounts["Active"] || 0, color: "#10b981" },
      { name: "Unconfirmed", value: statusCounts["Unconfirmed"] || 0, color: "#9ca3af" },
      { name: "Unsubscribed", value: statusCounts["Unsubscribed"] || 0, color: "#ef4444" },
      { name: "Bounced", value: statusCounts["Bounced"] || 0, color: "#4b5563" },
      { name: "Marked as spam", value: statusCounts["Marked as spam"] || 0, color: "#374151" },
      { name: "Unknown", value: statusCounts["Unknown"] || 0, color: "#6b7280" },
    ].filter((item) => item.value > 0);

    const newFilters = [
      { name: "All", count: all || 0, color: "bg-blue-500" },
      { name: "Active", count: subscribed || 0, color: "bg-green-500" },
      { name: "Unsubscribed", count: unsubscribed || 0, color: "bg-red-500" },
    ];

    setPieData(newPieData.length > 0 ? newPieData : pieData);
    setFilters(newFilters);
  };

  const handleBack = () => {
    router.back();
  };

  const handleUnsubscribe = async (id) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/subscribers/unsubscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subsID: id }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        addToast(data.message, "success");
      }
    } catch (error) {
      console.log(error);
      addToast(error.message || "Unknown Error, try again later", "error");
    }
  };

  const handleEditSubscriber = (subscriber) => {
    setEditingSubscriber(subscriber);
    setEditDataFormOpen(true);
  };

  const handleUpdateSubscriber = async (updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/edit-data",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataID: updatedData.dataID,
            name: updatedData.name,
            email: updatedData.email,
            mobile: updatedData.mobile,
            whatsapp: updatedData.whatsapp,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        setEditDataFormOpen(false);
        setEditingSubscriber(null);
        addToast("Subscriber updated successfully", "success");
      } else {
        addToast(data.message || "Failed to update subscriber", "error");
      }
    } catch (error) {
      console.error("Error updating subscriber:", error);
      addToast("Error updating subscriber: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (dataIDs) => {
    setLoading(true);
    try {

      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/delete-data",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataIDs: dataIDs }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        await fetchSubscribers(listData.listID);
        setSelectedRows([]);
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        addToast("Subscriber deleted successfully", "success");
      } else {
        addToast(data.message || "Failed to delete subscriber", "error");
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      addToast("Error deleting subscriber: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };


  const handleVerify = () => {
    addToast("Verify functionality not implemented yet.", "info");
  };

  const handleSubscribe = () => {
    addToast("Subscribe functionality not implemented yet.", "info");
  };

  const handleBulkUnsubscribe = () => {
    addToast("Bulk Unsubscribe functionality not implemented yet.", "info");
  };

  const downloadSample = () => {
    const data =
      "datatype,name,mobile,whatsapp,email\nI,John Doe,911234567890,911234567890,john@example.com\nB,Jahn Doe,911234567890,911234567890,jahn@example.com\nI,John Doe,911234567890,911234567890,johndeep@example.com";
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesFilter =
      activeFilter === "All"
        ? true
        : activeFilter === "Active"
        ? subscriber.status
        : activeFilter === "Unsubscribed"
        ? !subscriber.status
        : true;
    const matchesSearch =
      searchTerm === "" ||
      (subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    return matchesFilter && matchesSearch;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSubscribers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSubscribers.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setCurrentPage(1);
    if (value) {
      if (value < 1) {
        setRecordsPerPage(1);
      } else if (value > 500) {
        setRecordsPerPage(500);
      } else {
        setRecordsPerPage(value);
      }
    } else {
      setRecordsPerPage(10);
    }
  };

  const getPaginationRange = () => {
    const totalPageNumbers = 5;
    const halfRange = Math.floor(totalPageNumbers / 2);

    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + totalPageNumbers - 1, totalPages);

    if (endPage - startPage + 1 < totalPageNumbers) {
      startPage = Math.max(endPage - totalPageNumbers + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const hasData = pieData.some((item) => item.value > 0);

  const handleSelectRow = (row) => {
    if (selectedRows.includes(row)) {
      const filter = selectedRows.filter((item) => item !== row);
      setSelectedRows(filter);
    } else {
      setSelectedRows((prev) => [...prev, row]);
    }
  };

  const handleSelectAll = (isChecked) => {
    setSelectedRows(isChecked ? [...currentRecords] : []);
  };

  const expectedHeaders = ["datatype", "name", "mobile", "whatsapp", "email"];

  function formatName(input) {
    return input
      .split(" ")
      .map((word) => {
        if (word.length === 1) {
          return word.toUpperCase() + ".";
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, meta } = results;
          const fileHeaders = meta.fields;
          const lowerCaseExpectedHeaders = expectedHeaders.map((header) =>
            header.toLowerCase()
          );
          if (
            JSON.stringify(fileHeaders) !==
            JSON.stringify(lowerCaseExpectedHeaders)
          ) {
            alert(`Invalid columns. Expected: ${expectedHeaders.join(", ")}`);
            setCsvData([]);
            setHeaders([]);
            return;
          }
          data.map((item) => {
            item.name = formatName(item.name);
            return item;
          });

          setHeaders(fileHeaders);
          setCsvData(data);
          setShowCsvData(true);
        },
      });
    }
  };

  const handleAddLeadFromCsv = async () => {
    setShowCsvData(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("listID", listData.listID);
      formData.append("userID", userID);
      const response = await fetch(
        "https://www.margda.in/miraj/work/list-data/upload-csv",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLoading(false);
        addToast(data.message, "success");
        fetchSubscribers(listData.listID);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
      setShowCsvData(false);
      setLoading(false);
      addToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
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

  const EditSubscriberForm = ({ subscriber, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: subscriber.name || "",
      email: subscriber.email || "",
      mobile: subscriber.mobile || "",
      whatsapp: subscriber.whatsapp || "",
      dataID: subscriber.dataID,
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <motion.div
        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Subscriber</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const DeleteConfirmModal = ({ onConfirm, onCancel, isBulk, count }) => (
    <motion.div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Confirm Deletion
        </h2>
        <p className="mb-6 text-gray-600">
          {isBulk
            ? `Are you sure you want to delete ${count} selected subscribers?`
            : "Are you sure you want to delete this subscriber?"}
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen mt-4">
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
      {loading && <Loader />}

      <div className="border-b border-gray-200 px-6 py-3">
        <div className="relative flex justify-center items-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Subscriber Lists
          </h1>
          <button
            onClick={handleBack}
            className="absolute left-0 flex items-center text-white border border-gray-300 shadow-md p-2 rounded-md bg-blue-600 hover:scale-105 transition-all duration-200 text-sm font-medium"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft className="mr-2" size={16} />
            Back
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-2 mt-3">
          <div className="flex items-center justify-between space-x-4">
            {/* Left Side - Search */}
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 max-w-md">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none flex-1 text-gray-700"
              />
            </div>

            {/* Center - Show Records */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Show:</span>
              <input
                type="number"
                min="1"
                max="500"
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border border-gray-300 rounded-lg px-3 py-1 w-20 text-center"
              />
              <span className="text-sm font-medium text-gray-600">records</span>
            </div>

            {/* Right Side - Buttons */}
            <div className="flex items-center space-x-4">
              {/* Add List Data */}
              <button
                onClick={() => setAddDataFormOpen(true)}
                className="flex items-center px-4 py-2 text-sm  bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                <FaPlus className="text-sm mr-2" />
                Add List Data
              </button>

              {/* Upload CSV */}
              <label className="flex items-center px-4 py-2 text-sm  bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
                <FaPlus className="sm mr-2" />
                Upload CSV
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample CSV */}
              <button
                onClick={downloadSample}
                className="flex items-center px-4 py-2 text-sm  bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
              >
                <FaDownload className="mr-2 text-sm" />
                Sample CSV
              </button>
            </div>
          </div>
        </div>

        {/* New Buttons Section (Verify, Subscribe, Unsubscribe) */}
        <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-2 mt-3">
  <div className="flex items-center justify-between">
    {/* Left Side - Action Buttons */}
    <div className="flex items-center space-x-4">
      <button
        onClick={handleVerify}
        className="flex items-center px-4 py-2 text-sm  bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        Verify
      </button>
      <button
        onClick={handleSubscribe}
        className="flex items-center px-4 py-2  text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        Subscribe
      </button>
      <button
        onClick={handleBulkUnsubscribe}
        className="flex items-center px-4 py-2 text-sm  bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        Unsubscribe
      </button>
    </div>

    {/* Right Side - Delete Button */}
    <button
  onClick={() => {
    // Extract dataIDs from selected rows
    const selectedDataIDs = selectedRows.map(row => row.dataID);
    setDeleteTarget(selectedDataIDs);
    setShowDeleteConfirm(true);
  }}
  className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
>
  <FaTrash className="w-4 h-4 mr-2" />
  Delete Selected ({selectedRows.length})
</button>
  </div>
</div>

      </div>

     <div className="border-b border-gray-200 px-6 py-3 bg-white rounded-t-xl shadow-sm">
  <div className="flex items-center justify-between">
    {/* Left - List Info */}
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-600">List:</span>
      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg shadow">
        {listData ? listData.name : "Loading..."}
      </span>
    </div>

    {/* Right - Action Buttons */}
    <div className="flex items-center space-x-3">
      {/* Custom Fields */}
      <Link href="#">
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-xl shadow-md hover:scale-105 transition-transform duration-200">
          <Settings className="w-4 h-4 mr-2" />
          Custom Fields
          <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
            0
          </span>
        </button>
      </Link>

      {/* Hidden File Upload */}
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Autoresponders */}
      <button
        onClick={() => setShowAutorespondersModal(true)}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        Autoresponders
        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
          0
        </span>
      </button>

      {/* Segments */}
      <Link href="#">
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm rounded-xl shadow-md hover:scale-105 transition-transform duration-200">
          Segments
          <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
            0
          </span>
        </button>
      </Link>

      {/* Subscribe Form */}
      <button
        onClick={() => setShowSubscribeFormModal(true)}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        Subscribe Form
        <span className="ml-2 px-2 py-0.5 bg-white/20 text-xs rounded-full">
          0
        </span>
      </button>

      {/* List Settings */}
      <Link href="#">
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-xl shadow-md hover:scale-105 transition-transform duration-200">
          <Settings className="w-4 h-4 mr-2" />
          List Settings
        </button>
      </Link>
    </div>
  </div>
</div>


      <div className="px-6 py-6">
        {/* Filter Tabs */}
       <div className="flex items-center justify-between space-x-4 mb-4 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
  {/* Left - Select All */}
  <div className="flex items-center">
    <label className="flex items-center text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        onChange={(e) => handleSelectAll(e.target.checked)}
        checked={selectedRows.length >= currentRecords.length && currentRecords.length > 0}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <span className="ml-2 font-medium">
        Select All ({selectedRows.length} selected)
      </span>
    </label>
  </div>

  {/* Right - Filters */}
  <div className="flex items-center space-x-3">
    {filters.map((filter) => (
      <button
        key={filter.name}
        onClick={() => setActiveFilter(filter.name)}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition-transform duration-200 hover:scale-105 ${
          activeFilter === filter.name
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span
          className={`w-3 h-3 rounded-full mr-2 ${filter.color}`}
        ></span>
        {filter.name}
        <span
          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            activeFilter === filter.name
              ? "bg-white/20 text-white"
              : "bg-white text-gray-600 border border-gray-300"
          }`}
        >
          {filter.count}
        </span>
      </button>
    ))}
  </div>
</div>


        {/* Subscribers Table */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S/No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Whatsapp
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">Status</div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribe
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sent
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Never Opened
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="12"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Loading subscribers...
                      </td>
                    </tr>
                  ) : currentRecords.length > 0 ? (
                    currentRecords.map((subscriber, index) => (
                      <motion.tr
                        key={subscriber.id || `subscriber-${index}`}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={rowVariants}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(subscriber)}
                            onChange={() => handleSelectRow(subscriber)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                          {indexOfFirstRecord + index + 1}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subscriber.name || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.email || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.mobile || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.whatsapp || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.last_activity || "N/A"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleUnsubscribe(subscriber.subsID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Users className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.totalSent || 0}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.notOpen || 0}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.failed || 0}
                        </td>
                        <td className="px-3 py-4 flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditSubscriber(subscriber)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setDeleteTarget([subscriber.dataID]);
                              setShowDeleteConfirm(true);
                            }}
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
                        colSpan="12"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No data found for this list.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-2">
          <div className="text-sm font-bold text-gray-500">
            Showing {indexOfFirstRecord + 1} to{" "}
            {Math.min(indexOfLastRecord, filteredSubscribers.length)} Records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              {"<<"} Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              Next {">>"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Subscriber Modal */}
      <AnimatePresence>
        {editDataFormOpen && editingSubscriber && (
          <EditSubscriberForm
            subscriber={editingSubscriber}
            onSubmit={handleUpdateSubscriber}
            onCancel={() => {
              setEditDataFormOpen(false);
              setEditingSubscriber(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
     <AnimatePresence>
  {showDeleteConfirm && (
    <DeleteConfirmModal
      isBulk={Array.isArray(deleteTarget) && deleteTarget.length > 1}
      count={Array.isArray(deleteTarget) ? deleteTarget.length : 1}
      onConfirm={() => handleDeleteSubscriber(deleteTarget)}
      onCancel={() => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }}
    />
  )}
</AnimatePresence>

      {/* Autoresponders Modal */}
      <AnimatePresence>
        {showAutorespondersModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAutorespondersModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-screen scrollbar-hide"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Add a Cron Job
                </h2>
              </div>
              <p className="mb-6 text-gray-600">
                To activate autoresponders, add a cron job with the following
                command.
              </p>
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Time Interval
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <code className="text-sm font-mono text-gray-800">
                  */1 * * * *
                </code>
              </div>
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Command
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <code className="text-sm font-mono text-gray-800">
                  php
                  /home/u671535905/domains/margda.org/public_html/email/autoresponders.php{" "}
                  {">"}/dev/null 2{">"}&1
                </code>
              </div>
              <p className="mb-6 text-gray-600">
                This command needs to be run every minute to check the database
                for any autoresponder emails to send.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                (Note: Adding cron jobs varies by host. Most offer a UI to add a
                cron job easily. Check your hosting control panel or consult
                your host if unsure.)
              </p>
              <p className="text-gray-600">
                Once added, wait one minute. If your cron job is functioning
                correctly, you'll see the autoresponder options instead of this
                modal window when you click on the "Autoresponders" button.
              </p>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAutorespondersModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscribe Form Modal */}
      <AnimatePresence>
        {showSubscribeFormModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSubscribeFormModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-screen scrollbar-hide"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Subscribe Form
                </h2>
              </div>
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Ready-to-use Subscribe Form
              </h3>
              <p className="mb-4 text-gray-600">
                The following is a 'ready-to-use' subscription form URL you can
                immediately use to collect sign-ups to this list:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6 overflow-x-auto">
                <code className="text-sm font-mono text-gray-800 break-all">
                  https://email.margda.org/subscription?f=oqJ892S0r@m1A4Md8MehrFMj0zQAaIDhJVbwcrRjy691qxrsyyWNTrB4HcAqZOSZZg
                </code>
              </div>
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Subscribe Form HTML Code
              </h3>
              <p className="mb-4 text-gray-600">
                The following is an embeddable subscribe form HTML code for this
                list.
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <pre className="text-sm font-mono text-gray-800 overflow-x-auto">
                  {`<form action="https://email.margda.org/subscribe" method="POST" accept-charset="utf-8">
    <label for="name">Name</label><br/>
    <input type="text" name="name" id="name"/>
    <br/>
    <label for="email">Email</label><br/>
    <input type="email" name="email" id="email"/>
    <br/>
    <input type="hidden" name="list" value="oqJ892S0r@m1A4Md8MehrFMj0zQAaIDhJVbwcrRjy691qxrsyyWNTrB4HcAqZOSZZg"/>
    <input type="submit" name="submit" id="submit"/>
</form>`}
                </pre>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                You can set up reCAPTCHA in the brand settings. To subscribe
                users programmatically, use the API →{" "}
                <a
                  href="https://sendy.co/api"
                  className="text-blue-600 hover:underline"
                >
                  https://sendy.co/api
                </a>
                .
              </p>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">
                  Enable GDPR Fields
                </h3>
                <p className="mb-4 text-gray-600">
                  The General Data Protection Regulation (GDPR) is a regulation
                  in EU law on data protection and privacy for all individuals
                  within the European Union. The GDPR regulation affects anyone
                  in the world who collects and processes the personal data of
                  EU users. If you collect and process data of EU users,
                  consider enabling GDPR fields.
                </p>
                <p className="text-gray-600">
                  GDPR fields are supported in both the 'Ready-to-use subscribe
                  form' and the embeddable 'Subscribe form HTML code' as seen on
                  the left. When GDPR fields are enabled, an unticked consent
                  checkbox will appear below the subscription form with
                  'Marketing permission' and 'What to expect' texts to explain
                  what they are signing up for and what you're going to do with
                  the information they submit. Users are required to check the
                  checkbox in order to subscribe.
                </p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSubscribeFormModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {csvData.length > 0 && showCsvData && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="border border-gray-500 relative bg-white shadow-lg rounded-lg overflow-x-auto overflow-y-auto max-h-[700px] w-3/4 p-6">
            <div style={{ textAlign: "end" }}>
              <button
                onClick={() => setShowCsvData(false)}
                className="bg-green-500 text-white px-4 py-2 mr-3 rounded-lg hover:bg-green-600 mb-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLeadFromCsv}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mb-2"
              >
                Add all data
              </button>
            </div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-center">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="py-3 px-4 text-justify uppercase font-semibold text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t hover:bg-gray-100 cursor-pointer border"
                  >
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-[9px] px-4 text-justify text-xl font-sans font-normal min-w-50"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addDataFormOpen && (
        <AddListDataForm
          listID={listData.listID}
          setClose={setAddDataFormOpen}
          fetchData={fetchSubscribers}
        />
      )}
    </div>
  );
};

export default ListData;