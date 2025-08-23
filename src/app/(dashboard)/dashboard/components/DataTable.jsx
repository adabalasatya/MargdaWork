'use client';
import { useState } from "react";
import {
  FaUserCog,
  FaUser,
  FaUsers,
  FaFile,
  FaCheck,
  FaEllipsisH,
  FaEye,
  FaEdit,
  FaExchangeAlt,
  FaShareAlt,
  FaUserPlus,
  FaLock,
  FaFileInvoice,
  FaReceipt,
  FaBrain,
  FaComments,
  FaUserTie,
  FaQuestionCircle,
  FaFileUpload,
  FaTrophy,
  FaChartBar,
  FaHeart,
  FaCogs,
  FaBriefcase,
  FaTag,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaBuilding,
  FaTasks,
  FaTimes,
} from "react-icons/fa";
import moment from "moment";

const DataTable = ({
  currentRecords,
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  openDropdownId,
  setOpenDropdownId,
  leadTypes,
  logs,
  fetchLogs,
  addToast,
  userID,
  setDataDetails,
  setEditingData,
  setShowLeadTypeForm,
  sampleDataTypes,
}) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingDataLocal] = useState({});

  const getLeadTypeColor = (typeID) => {
    switch (parseInt(typeID)) {
      case 1:
        return "bg-red-300";
      case 2:
        return "bg-orange-300";
      case 3:
        return "bg-blue-300";
      case 4:
        return "bg-green-300";
      case 5:
        return "bg-purple-300";
      case 6:
        return "bg-yellow-300";
      case 7:
        return "bg-pink-300";
      case 8:
        return "bg-slate-500";
      default:
        return "bg-gray-100";
    }
  };

  const getLeadTypeIcon = (typeID) => {
    switch (parseInt(typeID)) {
      case 1:
        return "🔴";
      case 2:
        return "🟠";
      case 3:
        return "🔵";
      case 4:
        return "🟢";
      case 5:
        return "🟣";
      case 6:
        return "🟡";
      case 7:
        return "🟪";
      case 8:
        return "⚫️";
      default:
        return "⚪️";
    }
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/delete-data",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userID,
            dataID: item.dataID,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDataDetails((prev) =>
          prev.filter((preItem) => preItem.dataID !== item.dataID)
        );
        addToast(`Deleted ${item.name}`, "success");
      } else {
        addToast(data.message || "Failed to delete record", "error");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      addToast("Failed to delete record", "error");
    }
    setOpenDropdownId(null);
  };

  const handleView = (item) => {
    setDataDetails((prev) =>
      prev.map((dataItem) =>
        dataItem.dataID === item.dataID
          ? { ...dataItem, show: true, isView: true }
          : dataItem
      )
    );
    addToast(`Viewing details for ${item.name}`, "info");
    setOpenDropdownId(null);
    fetchLogs(item.dataID);
  };

  const handleLeadType = (item) => {
    setEditingData(item);
    setShowLeadTypeForm(true);
    setOpenDropdownId(null);
  };

  const handleChangeTask = (item) => {
    addToast(
      `Change Task for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleChangeLead = (item) => {
    addToast(
      `Change Lead for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleShareData = (item) => {
    addToast(
      `Share Data for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleShareLog = (item) => {
    addToast(
      `Share Log for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleMakeUser = (item) => {
    addToast(
      `Make User for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handlePasscode = (item) => {
    addToast(
      `Generate Passcode for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleInvoice = (item) => {
    addToast(
      `Generate Invoice for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleReceipt = (item) => {
    addToast(
      `Generate Receipt for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleSkillsTest = (item) => {
    addToast(
      `Skills Test for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleCommunicationEvaluation = (item) => {
    addToast(
      `Communication Evaluation for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleHRInteraction = (item) => {
    addToast(
      `HR Interaction for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleInterviewQuestions = (item) => {
    addToast(
      `Interview Questions for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleDocumentUpload = (item) => {
    addToast(
      `Document Upload for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleStudentContest = (item) => {
    addToast(
      `Student Contest for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleAptitudeAssessment = (item) => {
    addToast(
      `Aptitude Assessment for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleAttitudeAssessment = (item) => {
    addToast(
      `Attitude Assessment for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleAbilityAnalyser = (item) => {
    addToast(
      `Ability Analyser for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleCareerDashboard = (item) => {
    addToast(
      `Career Dashboard for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const toggleDropdown = (dataID) => {
    setOpenDropdownId(openDropdownId === dataID ? null : dataID);
  };

  const handleEditClick = (item) => {
    const dataID = item.dataID;
    if (editingRowId === dataID) {
      setEditingRowId(null);
      setEditingDataLocal({});
    } else {
      setEditingRowId(dataID);
      setEditingDataLocal({
        name: item.name || "",
        phone: item.mobile || "", // Initialize with mobile
        whatsapp: item.whatsapp || "",
        email: item.email || "",
        share: item.share || false,
      });
    }
    setOpenDropdownId(null);
  };

  const handleFieldChange = (field, value) => {
    if (field === "phone" || field === "whatsapp") {
      // Allow only digits and limit to 10 digits
      if (/^\d{0,10}$/.test(value)) {
        setEditingDataLocal((prev) => {
          const newData = { ...prev, [field]: value };
          console.log("Updated editingData:", newData); // Debug log
          return newData;
        });
      }
    } else {
      setEditingDataLocal((prev) => {
        const newData = { ...prev, [field]: value };
        console.log("Updated editingData:", newData); // Debug log
        return newData;
      });
    }
  };

  const handleSaveEdit = async (item) => {
    try {
      const updateData = {
        
        dataID: item.dataID,
        name: editingData.name || item.name,
        mobile: editingData.phone || item.mobile || "", // Use mobile to match server
        whatsapp: editingData.whatsapp || item.whatsapp || "",
        email: editingData.email || item.email || "",
        share: editingData.share || item.share || false,
      };
      console.log("Sending updateData:", updateData); // Debug log

      const response = await fetch(
        "https://www.margda.in/miraj/work/data/edit-data",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      console.log("Server response:", data); // Debug log

      if (response.ok) {
        setDataDetails((prev) =>
          prev.map((prevItem) =>
            prevItem.dataID === item.dataID
              ? {
                  ...prevItem,
                  name: updateData.name,
                  mobile: updateData.mobile, // Update mobile
                  whatsapp: updateData.whatsapp,
                  email: updateData.email,
                  share: updateData.share,
                }
              : prevItem
          )
        );
        addToast(`Successfully updated ${updateData.name}`, "success");
        setEditingRowId(null);
        setEditingDataLocal({});
      } else {
        addToast(data.message || `Failed to update record: ${data.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Error updating record:", error);
      addToast("Failed to update record", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingDataLocal({});
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md p-6 mt-4">
      <table className="w-full text-sm text-left border-spacing-x-4">
        <thead>
          <tr className="text-gray-700 top-0 bg-gray-50 z-10">
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length >= currentRecords.length &&
                    currentRecords.length > 0
                  }
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Selected ({selectedRows.length})
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaUserCog className="text-blue-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Action
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaUser className="text-purple-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Contact
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-green-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Location
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaFile className="text-blue-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Details
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaCheck className="text-green-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Status
                </span>
              </div>
            </th>
            <th className="px-4 py-3 border border-gray-200 bg-gray-100">
              <div className="flex items-center space-x-2">
                <FaFile className="text-blue-600 w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  Logs
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentRecords.length > 0 ? (
            currentRecords.map((item, i) => (
              <tr
                key={i}
                className={`hover:bg-gray-100 transition-colors duration-200 ${
                  selectedRows.includes(item) ? "bg-blue-50" : ""
                } ${getLeadTypeColor(item.typeID)}`}
                onClick={() => toggleRowSelection(item)}
              >
                <td className="px-4 py-3 border-r border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item)}
                    onChange={() => toggleRowSelection(item)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="relative flex items-center space-x-2">
                    <button
                      title="Actions"
                      className="p-2 bg-gray-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.dataID);
                      }}
                    >
                      <FaEllipsisH className="w-5 h-5" />
                    </button>
                    {editingRowId === item.dataID && (
                      <div className="flex space-x-1">
                        <button
                          title="Save"
                          className="p-2 bg-green-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(item);
                          }}
                        >
                          <FaCheck className="w-4 h-4" />
                        </button>
                        <button
                          title="Cancel"
                          className="p-2 bg-red-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {openDropdownId === item.dataID && (
                      <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full left-0">
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(item);
                          }}
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(item);
                          }}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeTask(item);
                          }}
                        >
                          <FaExchangeAlt className="mr-2" /> C-Task
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeLead(item);
                          }}
                        >
                          <FaExchangeAlt className="mr-2" /> C-Lead
                        </button>
                        {/* <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareData(item);
                          }}
                        >
                          <FaShareAlt className="mr-2" /> S-Data
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareLog(item);
                          }}
                        >
                          <FaShareAlt className="mr-2" /> S-Log
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeUser(item);
                          }}
                        >
                          <FaUserPlus className="mr-2" /> Make User
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePasscode(item);
                          }}
                        >
                          <FaLock className="mr-2" /> Passcode
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoice(item);
                          }}
                        >
                          <FaFileInvoice className="mr-2" /> Invoice
                        </button>
                        {item.paid && (
                          <button
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceipt(item);
                            }}
                          >
                            <FaReceipt className="mr-2" /> Receipt
                          </button>
                        )}
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkillsTest(item);
                          }}
                        >
                          <FaBrain className="mr-2" /> Skills Test
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunicationEvaluation(item);
                          }}
                        >
                          <FaComments className="mr-2" /> Communication
                          Evaluation
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHRInteraction(item);
                          }}
                        >
                          <FaUserTie className="mr-2" /> HR Interaction
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInterviewQuestions(item);
                          }}
                        >
                          <FaQuestionCircle className="mr-2" /> Interview
                          Questions
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentUpload(item);
                          }}
                        >
                          <FaFileUpload className="mr-2" /> Document Upload
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentContest(item);
                          }}
                        >
                          <FaTrophy className="mr-2" /> Student Contest
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAptitudeAssessment(item);
                          }}
                        >
                          <FaChartBar className="mr-2" /> Aptitude Assessment
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttitudeAssessment(item);
                          }}
                        >
                          <FaHeart className="mr-2" /> Attitude Assessment
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAbilityAnalyser(item);
                          }}
                        >
                          <FaCogs className="mr-2" /> Ability Analyser
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCareerDashboard(item);
                          }}
                        >
                          <FaBriefcase className="mr-2" /> Career Dashboard
                        </button> */}
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeadType(item);
                          }}
                        >
                          <FaTag className="mr-2" /> Lead Type
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <FaTrash className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-500 w-5 h-5" />
                      {editingRowId === item.dataID ? (
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          className="px-2 py-1 border rounded text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter name"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{item.name}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-purple-500 w-5 h-5" />
                      {editingRowId === item.dataID ? (
                        <input
                          type="email"
                          value={editingData.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          className="px-2 py-1 border rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email"
                        />
                      ) : (
                        <span className="text-gray-800">{item.email || "N/A"}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-green-500 w-5 h-5" />
                      {editingRowId === item.dataID ? (
                        <input
                          type="tel"
                          value={editingData.phone}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          className="px-2 py-1 border rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone"
                        />
                      ) : (
                        <span className="text-gray-800">{item.mobile || "N/A"}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaWhatsapp className="text-green-600 w-5 h-5" />
                      {editingRowId === item.dataID ? (
                        <input
                          type="tel"
                          value={editingData.whatsapp}
                          onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
                          className="px-2 py-1 border rounded text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter WhatsApp"
                        />
                      ) : (
                        <span className="text-gray-800">{item.whatsapp || "N/A"}</span>
                      )}
                    </div>
                    {editingRowId === item.dataID && (
                      <div className="flex items-center space-x-2">
                        <FaShareAlt className="text-blue-500 w-5 h-5" />
                        <label className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={editingData.share}
                            onChange={(e) => handleFieldChange("share", e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-800">Share</span>
                        </label>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-600 w-5 h-5" />
                      <span className="text-gray-800">
                        {Array.isArray(item.datatype)
                          ? item.datatype
                              .map((type) =>
                                type === "P"
                                  ? "Individual"
                                  : type === "B"
                                  ? "Business"
                                  : type === "L"
                                  ? "Learner"
                                  : type
                              )
                              .join(", ")
                          : item.datatype === "P"
                          ? "Individual"
                          : item.datatype === "B"
                          ? "Business"
                          : item.datatype === "L"
                          ? "Learner"
                          : item.datatype || "N/A"}
                      </span>
                    </div>
                    {item.typeID && (
                      <div className="flex items-center space-x-2">
                        <FaTag className="text-purple-600 w-5 h-5" />
                        <span className="text-gray-800">
                          Lead Type:{" "}
                          {leadTypes.find((type) => type.typeID == item.typeID)
                            ?.type || "Unknown"}{" "}
                          {getLeadTypeIcon(item.typeID)}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <span className="text-sm text-gray-800">Country:</span>
                      <span className="text-sm text-gray-800">{item.country_code || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <span className="text-sm text-gray-800">State:</span>
                      <span className="text-sm text-gray-800">{item.state || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <span className="text-sm text-gray-800">District:</span>
                      <span className="text-sm text-gray-800">{item.district || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <span className="text-sm text-gray-800">Pincode:</span>
                      <span className="text-sm text-gray-800">{item.pincode || "N/A"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <span className="text-sm text-gray-800">Place:</span>
                      <span className="text-sm text-gray-800">{item.address || "N/A"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <FaTasks className="text-blue-600 w-5 h-5" />
                      <span className="text-sm text-gray-800">
                        Task: {item.taskName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaUserTie className="text-blue-600 w-5 h-5" />
                      <span className="text-sm text-gray-800">
                        Owner: {item.euserName || "N/A"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <span className="text-sm text-gray-800">{item.status || "N/A"}</span>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  {logs[item.dataID] && logs[item.dataID].length > 0 ? (
                    <div className="flex flex-col space-y-1">
                      {logs[item.dataID].map((log, index) => (
                        <div
                          key={index}
                          className={`text-sm text-gray-800 p-1 rounded ${getLeadTypeColor(
                            log.typeID
                          )}`}
                        >
                          {log.action}: {log.typeName} (
                          {moment(log.timestamp).format("YYYY-MM-DD HH:mm")})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-800">No logs available</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-3 text-center text-gray-600">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;