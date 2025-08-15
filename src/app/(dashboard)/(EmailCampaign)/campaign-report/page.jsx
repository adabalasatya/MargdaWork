"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";
import AddToTask from "@/app/(dashboard)/(EmailCampaign)/addtotaskemail/page";

const EmailReport = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedCampaignID, setSelectedCampaignID] = useState("");
  const [emailsPerPage, setEmailsPerPage] = useState(10);
  const [userID, setUserID] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToTaskCon, setShowAddToTaskCon] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Ensure we're on the client side before accessing sessionStorage
    if (typeof window !== "undefined") {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      if (!userData || !userData.pic) {
        return router.push("/work/login");
      } else {
        const userID = userData.userID;
        setUserID(userID);
        fetchData(userID);
        fetchCampaigns(userID);
      }
    }
  }, [router]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentTablePage(1);
  }, [searchQuery, emailsPerPage, fromDate, toDate, selectedCampaignID]);

  const fetchData = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/get-report",
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
        console.log(data);
        setEmails(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCampaigns = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/email-campaign/get-campaigns",
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

  // Simulate email extraction
  const downloadReports = async () => {
    setLoading(true);
    try {
      // Simulate a successful response
      setTimeout(() => {
        toast.success("Emails extracted successfully!");
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to extract emails");
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentTablePage(1); // Reset to first page on search
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setEmailsPerPage(Number(e.target.value));
    setCurrentTablePage(1);
  };

  // Filter emails based on search and date range
  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.replyto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate =
      (!fromDate || email.edate >= fromDate) &&
      (!toDate || email.edate <= toDate);
    const matchCampaignID = selectedCampaignID
      ? email.campaignID == selectedCampaignID
      : true;
    return matchesSearch && matchesDate && matchCampaignID;
  });

  // Pagination logic
  const indexOfLastEmail = currentTablePage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = filteredEmails.slice(
    indexOfFirstEmail,
    indexOfLastEmail
  );
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

  const paginate = (pageNumber) => setCurrentTablePage(pageNumber);

  return (
    <div className="flex-1 p-6 overflow-auto">
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
        {/* Center: Email Report Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <FiMail className="mr-2" /> Email Report
        </h1>
      </div>

      {/* Enhanced Table Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        {/* Left side controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show</label>
            <select
              value={emailsPerPage}
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
              placeholder="Search emails..."
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
                {campaign.campaign_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4 font-medium uppercase tracking-wider">
                  Task
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Sent Email
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Received Email
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Subject
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
                <th className="p-4 font-medium uppercase tracking-wider">
                  Open Count
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Sent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEmails.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {filteredEmails.length === 0 && emails.length > 0
                      ? "No emails found matching your search criteria."
                      : "No emails found."}
                  </td>
                </tr>
              ) : (
                currentEmails.map((email) => (
                  <tr
                    key={email.emailsID}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4 text-[15px]">
                      {email.dataID &&
                        (email.taskName ? (
                          <div className="font-semibold">{email.taskName}</div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowAddToTaskCon(true);
                              setSelectedItem(email);
                            }}
                            className="w-max bg-blue-500 px-1 py-1 rounded text-white hover:bg-blue-700"
                          >
                            Add to Task
                          </button>
                        ))}
                    </td>
                    <td className="p-4 text-[15px]">{email.sender}</td>
                    <td className="p-4 text-[15px]">{email.receiver}</td>
                    <td className="p-4 text-[14px]">
                      {email.subject || "N/A"}
                    </td>
                    <td className="p-4 text-[14px]">{email.matter || "N/A"}</td>
                    <td className="p-4 text-[14px]">
                      {email.edate
                        ? new Date(email.edate).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="p-4 text-[14px]">
                      {email.campaignName || "N/A"}
                    </td>
                    <td className="p-4 text-[14px]">
                      {email.open_count || "N/A"}
                    </td>
                    <td className="p-4 text-[14px]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          email.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {email.success ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {filteredEmails.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 space-y-3 sm:space-y-0">
          <div className="text-md font-semibold text-gray-600">
            Showing {filteredEmails.length === 0 ? 0 : indexOfFirstEmail + 1} to{" "}
            {Math.min(indexOfLastEmail, filteredEmails.length)} of{" "}
            {filteredEmails.length} total records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                paginate(currentTablePage > 1 ? currentTablePage - 1 : 1)
              }
              disabled={currentTablePage === 1}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
                currentTablePage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiChevronLeft className="mr-1" />
              Previous
            </button>
            <span className="px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium bg-blue-600 text-white">
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
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center transition-colors duration-200 ${
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
          fetchData={() => fetchData(userID)}
        />
      )}
    </div>
  );
};

export default EmailReport;
