'use client';

import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiArrowLeft,
  FiEdit,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddToTask from "@/app/(dashboard)/(SMSCampaign)/addtotasksms/page";

const SmsReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [sms, setSms] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [smsPerPage, setSmsPerPage] = useState(10); // Changed to state
  const [userID, setUserID] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToTaskCon, setShowAddToTaskCon] = useState(false);
  const { addToast } = useToast();

  // Safe sessionStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    if (!userData || !userData.pic) {
      return router.push("/update-profile");
    } else {
      const userID = userData.userID;
      setUserID(userID);
      fetchData(userID);
      fetchCampaigns(userID);
    }
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchQuery, smsPerPage, fromDate, toDate, selectedCampaignID]);

  const fetchData = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/get-report",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSms(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCampaigns = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/get-campaigns",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Clear date filters function
  const clearDateFilters = () => {
    setFromDate("");
    setToDate("");
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentTablePage(1); // Reset to first page on search
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setSmsPerPage(Number(e.target.value));
    setCurrentTablePage(1);
  };

  // Filter sms based on search and date range
  const filteredSms = sms.filter((sms) => {
    const matchesSearch =
      sms.receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sms.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sms.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate =
      (!fromDate || sms.edate >= fromDate) && (!toDate || sms.edate <= toDate);
    const matchCampaignID = selectedCampaignID
      ? sms.campaignID == selectedCampaignID
      : true;
    return matchesSearch && matchesDate && matchCampaignID;
  });

  // Pagination logic
  const indexOfLastSms = currentTablePage * smsPerPage;
  const indexOfFirstSms = indexOfLastSms - smsPerPage;
  const currentSms = filteredSms.slice(indexOfFirstSms, indexOfLastSms);
  const totalPages = Math.ceil(filteredSms.length / smsPerPage);

  const paginate = (pageNumber) => setCurrentTablePage(pageNumber);

  return (
    <div className="flex-1 p-6 min-h-[100px] overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      {loading && <Loader />}

      {/* Header */}
      <div className="relative flex justify-between items-center p-4 mb-8">
        {/* Center: SMS Report Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <FiMail className="mr-2" /> SMS Report
        </h1>
      </div>

      {/* Enhanced Table Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        {/* Left side controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show</label>
            <select
              value={smsPerPage}
              onChange={handleItemsPerPageChange}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-gray-700">records</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Clear Button - Only show when dates are selected */}
          {(fromDate || toDate) && (
            <button
              onClick={clearDateFilters}
              className="flex items-center text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full p-1 ml-1 transition-colors"
              title="Clear date filters"
            >
              <FiX className="mr-1" size={16} />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
            <input
              type="text"
              placeholder="Search sms..."
              value={searchQuery}
              onChange={handleSearch}
              className="border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm w-64"
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-sm"
            value={selectedCampaignID}
            onChange={(e) => setSelectedCampaignID(e.target.value)}
          >
            <option value="">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.campaignID} value={campaign.campaignID}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-y-auto md:max-h-[520px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-[12px] text-gray-500">
                <th className="p-4 font-medium uppercase tracking-wider">
                  Task
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Sender
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Receiver
                </th>

                <th className="p-4 font-medium uppercase tracking-wider">
                  Message
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Time-Data
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Campaign
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentSms.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {filteredSms.length === 0 && sms.length > 0
                      ? "No sms found matching your search criteria."
                      : "No sms found."}
                  </td>
                </tr>
              ) : (
                currentSms.map((sms) => (
                  <tr
                    key={sms.smsID}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4 text-[12px]">
                      {sms.dataID &&
                        (sms.taskName ? (
                          <div className="font-semibold">{sms.taskName}</div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowAddToTaskCon(true);
                              setSelectedItem(sms);
                            }}
                            className="text-[12px] bg-blue-500 px-1 py-1 rounded text-white hover:bg-blue-700"
                          >
                            Add to Task
                          </button>
                        ))}
                    </td>
                    <td className="p-4 text-[12px]">{sms.sender}</td>
                    <td className="p-4 text-[12px]">{sms.receiver}</td>

                    <td className="p-4 text-[12px]">{sms.message || "N/A"}</td>
                    <td className="p-4 text-[12px]">
                      {sms.edate ? new Date(sms.edate).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-4 text-[12px]">
                      {sms.campaignName || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {filteredSms.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-3 sm:space-y-0">
          <div className="text-[12px] ml-2 font-semibold text-gray-600">
            Showing {filteredSms.length === 0 ? 0 : indexOfFirstSms + 1} to{" "}
            {Math.min(indexOfLastSms, filteredSms.length)} of{" "}
            {filteredSms.length} total entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                paginate(currentTablePage > 1 ? currentTablePage - 1 : 1)
              }
              disabled={currentTablePage === 1}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium flex items-center transition-colors duration-200${
                currentTablePage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiChevronLeft className="mr-1" />
              Previous
            </button>
            <span className="px-4 py-2 border border-blue-600 rounded-lg text-[12px] font-medium bg-blue-600 text-white">
              {currentTablePage}
            </span>
            <button
              onClick={() =>
                paginate(
                  currentTablePage < totalPages
                    ? currentTablePage + 1
                    : totalPages
                )
              }
              disabled={currentTablePage === totalPages || totalPages === 0}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-[12px] font-medium flex items-center transition-colors duration-200 ${
                currentTablePage === totalPages || totalPages === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}
      {showAddToTaskCon && (
        <AddToTask
          setClose={setShowAddToTaskCon}
          userID={userID}
          item={selectedItem}
          fetchData={fetchData}
        />
      )}
    </div>
  );
};

export default SmsReport;
