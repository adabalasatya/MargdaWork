'use client';

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Papa from "papaparse";
import {
  Plus,
  Trash2,
  Users,
  Download,
  Search,
  Settings,
  Info,
} from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
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
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/login");
      return;
    } else {
      setUserData(storedUserData);
      setUserID(storedUserData.userID);
    }
  }, [router]);

  // Static chart data for LineChart (fallback)
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

  // Fixed useEffect with proper error handling and no infinite loops
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userData) return; // Wait for userData to be loaded

    setIsInitializing(true);

    try {
      // Get list data from URL parameters or sessionStorage
      const listIDParam = searchParams.get('listID');
      const listNameParam = searchParams.get('listName');
      
      // Try to get from sessionStorage if not in URL
      let storedListData = null;
      try {
        const stored = sessionStorage.getItem('currentListData');
        if (stored) {
          storedListData = JSON.parse(stored);
        }
      } catch (parseError) {
        console.warn("Failed to parse stored list data:", parseError);
        // Clear corrupted data
        sessionStorage.removeItem('currentListData');
      }
      
      let currentListData = null;
      
      if (listIDParam && listNameParam) {
        currentListData = {
          listID: listIDParam,
          name: listNameParam
        };
        // Store in sessionStorage for future use
        try {
          sessionStorage.setItem('currentListData', JSON.stringify(currentListData));
        } catch (storageError) {
          console.warn("Failed to store list data:", storageError);
        }
      } else if (storedListData && storedListData.listID) {
        currentListData = storedListData;
      }

      if (currentListData && currentListData.listID) {
        setListData(currentListData);
        const listID = parseInt(currentListData.listID);
        if (!isNaN(listID) && listID > 0) {
          fetchSubscribers(listID);
        } else {
          console.warn("Invalid listID:", currentListData.listID);
          if (addToast) {
            addToast("Invalid list ID. Please select a valid list.", "error");
          }
          // Don't redirect immediately, give user a chance to see the error
          setTimeout(() => {
            router.push("/manage-lists");
          }, 2000);
        }
        setIsInitializing(false);
      } else {
        console.warn("No valid listData found - missing URL parameters and sessionStorage data");
        if (addToast) {
          addToast("Please select a list to view its data.", "info");
        }
        // Delay redirect to allow user to see the message
        setTimeout(() => {
          router.push("/manage-lists");
        }, 1500);
        // Show fallback after 3 seconds
        setTimeout(() => {
          setShowFallback(true);
          setIsInitializing(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error in listData useEffect:", error);
      if (addToast) {
        addToast("An error occurred while loading list data.", "error");
      }
      setTimeout(() => {
        router.push("/manage-lists");
      }, 2000);
      setIsInitializing(false);
    }
  }, [searchParams, router, userData]); // Removed addToast from dependencies to prevent infinite loops

  // Fetch subscribers from API
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
        const subscriberData = data.Data || [];
        if (subscriberData.length > 0) {
          setSubscribers(subscriberData);
          updateCharts(subscriberData);
        } else {
          console.warn("No subscribers found for listID:", listID);
          setSubscribers([]);
          if (addToast) {
            addToast("No subscribers found for this list.", "info");
          }
        }
      } else {
        setSubscribers([]);
        if (addToast) {
          addToast(data.message || "Failed to fetch subscribers", "error");
        }
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      if (addToast) {
        addToast("Error fetching subscribers: " + error.message, "error");
      }
      setSubscribers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update pieData and filters
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
      {
        name: "Unconfirmed",
        value: statusCounts["Unconfirmed"] || 0,
        color: "#9ca3af",
      },
      {
        name: "Unsubscribed",
        value: statusCounts["Unsubscribed"] || 0,
        color: "#ef4444",
      },
      {
        name: "Bounced",
        value: statusCounts["Bounced"] || 0,
        color: "#4b5563",
      },
      {
        name: "Marked as spam",
        value: statusCounts["Marked as spam"] || 0,
        color: "#374151",
      },
      {
        name: "Unknown",
        value: statusCounts["Unknown"] || 0,
        color: "#6b7280",
      },
    ].filter((item) => item.value > 0);

    const newFilters = [
      { name: "All", count: all || 0, color: "bg-blue-500" },
      {
        name: "Active",
        count: subscribed || 0,
        color: "bg-green-500",
      },
      {
        name: "Unsubscribed",
        count: unsubscribed || 0,
        color: "bg-red-500",
      },
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
        if (addToast) {
          addToast(data.message, "success");
        }
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      if (addToast) {
        addToast(error.message || "Unknown Error, try again later", "error");
      }
    }
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

  // Filter subscribers
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
      setSelectedRows((pre) => [...pre, row]);
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
          const formattedData = data.map((item) => ({
            ...item,
            name: formatName(item.name),
          }));

          setHeaders(fileHeaders);
          setCsvData(formattedData);
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
        if (addToast) {
          addToast(data.message, "success");
        }
        fetchSubscribers(listData.listID);
      } else {
        if (addToast) {
          addToast(data.message, "error");
        }
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      setShowCsvData(false);
      setLoading(false);
      if (addToast) {
        addToast(error.message || "Upload failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
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

  // Show loading during initialization or if user data is not loaded yet
  if (!userData || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading list data...</div>
        </div>
      </div>
    );
  }

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

      {/* Fallback Modal for when no list data is found */}
      {showFallback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <h3 className="text-lg font-semibold mb-4">Unable to Load List Data</h3>
            <p className="text-gray-600 mb-4">
              No valid list data was found. Please return to the lists page and select a list.
            </p>
            <button
              onClick={() => router.push("/work/manage-lists")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Lists
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 px-6 py-4">
        <div className="relative flex justify-center items-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Subscriber Lists
          </h1>
          <button
            onClick={handleBack}
            className="absolute right-0 flex items-center text-white border border-gray-300 shadow-md p-2 rounded-md bg-blue-600 hover:scale-105 transition-all duration-200 text-sm font-medium"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft className="mr-2" size={16} />
            Back
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAddDataFormOpen(true)}
              className="flex items-center px-4 py-2 bg-white text-sm border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add List Data
            </button>
            <button
              onClick={() => document.getElementById("csv-upload")?.click()}
              className="flex items-center px-4 py-2 bg-white text-sm border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload CSV
            </button>
            <button
              onClick={downloadSample}
              className="flex items-center px-4 py-2 bg-white text-sm border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform"
            >
              Sample CSV
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">List:</span>
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
              {listData ? listData.name : "Loading..."}
            </span>
            <span className="text-sm text-gray-500 mx-2">|</span>
            <button
              onClick={handleBack}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Back to lists
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="#">
              <button className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform">
                <Settings className="w-4 h-4 mr-2" />
                Custom fields
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                  0
                </span>
              </button>
            </Link>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => setShowAutorespondersModal(true)}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform"
            >
              Autoresponders
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                0
              </span>
            </button>
            <Link href="#">
              <button className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform">
                Segments
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                  0
                </span>
              </button>
            </Link>
            <button
              onClick={() => setShowSubscribeFormModal(true)}
              className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform"
            >
              Subscribe form
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                0
              </span>
            </button>
            <Link href="#">
              <button className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:scale-105 transition-transform">
                <Settings className="w-4 h-4 mr-2" />
                List settings
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-6 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Show</span>
            <input
              type="number"
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="border border-gray-300 p-2 rounded w-16 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-bold">Records</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-4 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex items-center px-3 py-2 text-sm rounded border transition-colors ${
                activeFilter === filter.name
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full mr-2 ${filter.color}`}
              ></span>
              {filter.name}
              <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-xs rounded">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Subscribers Table */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[500px] max-w-[1200px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedRows.length >= currentRecords.length && currentRecords.length > 0}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-2">
                        {selectedRows.length} Selected
                      </div>
                    </label>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Whatsapp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">Last activity</div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unsubscribe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Never Opened
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Failed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="10"
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
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(subscriber)}
                            onChange={() => handleSelectRow(subscriber)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subscriber.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.email || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.mobile || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.whatsapp || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.last_activity || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleUnsubscribe(subscriber.subsID)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Unsubscribe"
                          >
                            <Users className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.totalSent || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.notOpen || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriber.failed || 0}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
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
        <div className="bg-white flex items-center justify-between mt-6 rounded-lg border border-blue-200 shadow-md p-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstRecord + 1} to{" "}
            {Math.min(indexOfLastRecord, filteredSubscribers.length)} of {filteredSubscribers.length} Records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded transition-colors ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {getPaginationRange().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 bg-gray-200 text-gray-700 rounded transition-colors ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

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
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto scrollbar-hide"
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
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-screen overflow-y-auto scrollbar-hide"
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
                  target="_blank"
                  rel="noopener noreferrer"
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

      {/* CSV Data Preview Modal */}
      {csvData.length > 0 && showCsvData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="border border-gray-500 relative bg-white shadow-lg rounded-lg overflow-x-auto overflow-y-auto max-h-[700px] w-3/4 p-6">
            <div className="text-right mb-4">
              <button
                onClick={() => setShowCsvData(false)}
                className="bg-gray-500 text-white px-4 py-2 mr-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLeadFromCsv}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add all data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white text-center">
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="py-3 px-4 text-left uppercase font-semibold text-sm"
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
                          className="py-2 px-4 text-left text-sm font-normal min-w-32"
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
        </div>
      )}

      {/* Add Data Form Modal */}
      {addDataFormOpen && (
        <AddListDataForm
          listID={listData?.listID}
          setClose={setAddDataFormOpen}
          fetchData={() => fetchSubscribers(listData?.listID)}
        />
      )}
    </div>
  );
};

export default ListData;
