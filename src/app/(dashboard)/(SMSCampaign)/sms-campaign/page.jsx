'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiPlus,
  FiX,
  FiSend,
  FiEdit,
} from "react-icons/fi";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";

const SmsCampaign = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    tempID: "",
    listID: "",
  });

  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [lists, setLists] = useState([]);
  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
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
      const userID = storedUserData.userID;
      setUserID(userID);
      fetchData(userID);
      fetchLists(userID);
      fetchTemplates(userID);
    }
  }, [router]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, dateRange.from, dateRange.to]);

  const fetchData = async (userID) => {
    if (!userID) return;
    
    try {
      setLoading(true);
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
        setCampaigns(data.data || []);
      } else {
        setCampaigns([]);
       
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      addToast("Failed to fetch campaigns", "error");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async (userID) => {
    if (!userID) return;
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/lists/get-lists",
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
        setLists(data.Lists || []);
      } else {
        setLists([]);
        addToast("Failed to fetch lists", "error");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      addToast("Failed to fetch lists", "error");
      setLists([]);
    }
  };

  const fetchTemplates = async (userID) => {
    if (!userID) return;
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/template/get-templates",
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
        const templates = data.Templates || [];
        const filter = templates.filter((template) => template.temptype === "S");
        setTemplates(filter);
      } else {
        setTemplates([]);
        addToast("Failed to fetch templates", "error");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      addToast("Failed to fetch templates", "error");
      setTemplates([]);
    }
  };

  // Date filter change handler
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // Clear dates button handler
  const handleClearDates = () => {
    setDateRange({ from: "", to: "" });
  };

  const handleView = (content, type) => {
    if (typeof window !== 'undefined') {
      window.alert(`Viewing ${type}:\n${content}`);
    }
  };

  const handleSend = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/sms-campaign/start-campaign",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ campaignID: id, userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        // Refresh campaigns after sending
        await fetchData(userID);
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error sending campaign:", error);
      addToast("Unknown Error, try again later", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
  setCampaignForm({
    id: campaign.campaignID,
    name: campaign.name,
    tempID: campaign.templateID || "",
    listID: campaign.listID || "",
  });
  setIsEditing(true);
  setIsModalOpen(true);
};


  const handleDelete = async (id) => {
    if (typeof window === 'undefined') return;
    
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        setLoading(true);
        // Add your delete API call here
        const response = await fetch(
          "https://www.margda.in/miraj/work/sms-campaign/delete-campaign",
          {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ campaignID: id }),
          }
        );
        
        if (response.ok) {
          addToast("Campaign deleted successfully", "success");
          await fetchData(userID);
        } else {
          addToast("Failed to delete campaign", "error");
        }
      } catch (error) {
        console.error("Error deleting campaign:", error);
        addToast("Error deleting campaign", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setIsModalOpen(false);
    router.back();
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setIsEditing(false);
      setCampaignForm({
        name: "",
        tempID: "",
        listID: "",
      });
    }
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();

  if (!campaignForm.name.trim() || !campaignForm.tempID || !campaignForm.listID) {
    addToast("Please fill in all required fields", "error");
    return;
  }

  if (isEditing) {
    // Update flow
    await updateCampaign();
    return;
  }

  // Create flow (unchanged)
  try {
    setLoading(true);
    const response = await fetch(
      "https://www.margda.in/miraj/work/sms-campaign/create-campaign",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: campaignForm.name.trim(),
          tempID: campaignForm.tempID,
          listID: campaignForm.listID,
          userID,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      addToast(data.message, "success");
      await fetchData(userID);
      setIsModalOpen(false);
      setCampaignForm({
        name: "",
        tempID: "",
        listID: "",
      });
    } else {
      addToast(data.message, "error");
    }
  } catch (error) {
    console.error("Error creating campaign:", error);
    addToast("Unknown Error, try again later", "error");
  } finally {
    setLoading(false);
  }
};


const updateCampaign = async () => {

  try {
    setLoading(true);
    // Adjust the URL and body keys if your backend expects different names
    const response = await fetch(
      "https://www.margda.in/miraj/work/sms-campaign/edit-campaign",
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          campaignID: campaignForm.id,
          name: campaignForm.name.trim(),
          templateID: campaignForm.tempID,
          listID: campaignForm.listID
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      addToast(data.message || "Campaign updated successfully", "success");
      await fetchData(userID);
      setIsModalOpen(false);
      setCampaignForm({
        name: "",
        tempID: "",
        listID: "",
      });
      setIsEditing(false);
      return true;
    } else {
      addToast(data.message || "Failed to update campaign", "error");
      return false;
    }
  } catch (error) {
    console.error("Error updating campaign:", error);
    addToast("Unknown Error, try again later", "error");
    return false;
  } finally {
    setLoading(false);
  }
};


  // Enhanced filtering logic with search and date filters
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!campaign) return false;
    
    let match = true;

    // Search filter
    if (searchQuery && campaign.name) {
      if (!campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        match = false;
      }
    }

    // Date filter
    if (match && dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const campaignDate = new Date(campaign.edate);
      if (campaignDate < fromDate) match = false;
    }
    if (match && dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      const campaignDate = new Date(campaign.edate);
      if (campaignDate > toDate) match = false;
    }

    return match;
  });

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startEntry = filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(
    currentPage * itemsPerPage,
    filteredCampaigns.length
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
    <div className="p-4 md:p-6 max-w-full mx-auto min-h-screen overflow-x-hidden">
      {loading && <Loader />}
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex items-center">
          <button
            onClick={handleBack}
            className="flex items-center text-white border border-gray-300 shadow-md p-2 rounded-md bg-blue-600 hover:scale-105 transition-all duration-200 text-sm font-medium"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft className="mr-2" size={16} />
            Back
          </button>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">
          SMS Campaign
        </h2>
        <div className="w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1 md:flex-none">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={toggleModal}
            disabled={loading}
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="mr-2" size={16} />
            Add Campaign
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Show</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">records</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">From</label>
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
            className="p-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">To</label>
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
            className="p-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(dateRange.from || dateRange.to) && (
            <button
              type="button"
              onClick={handleClearDates}
              title="Clear date filters"
              className="flex items-center text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-100 rounded-full p-1 ml-1 transition-colors"
            >
              <FiX size={16} />
              <span className="sr-only">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal for Campaign Form */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleModal();
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                {isEditing ? "Edit Campaign" : "Create New Campaign"}
              </h3>
              <button
                onClick={toggleModal}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <select
                    value={campaignForm.tempID}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        tempID: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                      <option key={template.tempID} value={template.tempID}>
                        {template.template}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const template = templates.find(
                        (t) => t.tempID === campaignForm.tempID
                      );
                      handleView(
                        template?.matter || "No template selected",
                        "Template"
                      );
                    }}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
                    disabled={!campaignForm.tempID}
                    title="View Template"
                  >
                    <FiEye size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <select
                    value={campaignForm.listID}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        listID: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select List</option>
                    {lists.map((list) => (
                      <option key={list.listID} value={list.listID}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const list = lists.find(
                        (l) => l.listID === campaignForm.listID
                      );
                      handleView(list?.name || "No list selected", "List");
                    }}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
                    disabled={!campaignForm.listID}
                    title="View List"
                  >
                    <FiEye size={16} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={toggleModal}
                  disabled={loading}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Update Campaign" : "Create Campaign"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Campaigns Table */}
      <div className="bg-white p-4 md:p-6 rounded-lg border-2 border-gray-200 shadow-md w-full overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">SMS Campaigns</h3>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  List
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Success
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading campaigns...
                    </div>
                  </td>
                </tr>
              ) : paginatedCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {filteredCampaigns.length === 0 && campaigns.length > 0 
                      ? "No campaigns found matching your search criteria." 
                      : "No campaigns found."}
                  </td>
                </tr>
              ) : (
                paginatedCampaigns.map((campaign) => {
                  return (
                    <tr
                      key={campaign.campaignID}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        {new Date(campaign.edate).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {campaign.templateName || "N/A"}
                          {campaign.matter && (
                            <button
                              onClick={() =>
                                handleView(campaign.matter, "Template")
                              }
                              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              title="View Template"
                            >
                              <FiEye size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {campaign.listName || "N/A"}
                          {campaign.listName && (
                            <button
                              onClick={() =>
                                handleView(campaign.listName, "List")
                              }
                              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              title="View List"
                            >
                              <FiEye size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {campaign.success || "N/A"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleSend(campaign.campaignID)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend Campaign"
                          >
                            <FiSend size={16} />
                          </button>

                          {/* Edit Campaign */}
                        <button
                          onClick={() => handleEdit(campaign)}
                          className="text-green-600 hover:text-green-800 transition-colors duration-200"
                          title="Edit Campaign"
                        >
                          <FiEdit size={16} />
                        </button>

                        {/* Delete Campaign */}
                        <button
                          onClick={() => handleDelete(campaign.campaignID)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Campaign"
                        >
                          <FiTrash2 size={16} />
                        </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {filteredCampaigns.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 space-y-3 sm:space-y-0">
            <span className="text-sm font-semibold ml-2 text-gray-700">
              Showing {startEntry} to {endEntry} of {filteredCampaigns.length} total entries
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium bg-blue-600 text-white">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default SmsCampaign;
