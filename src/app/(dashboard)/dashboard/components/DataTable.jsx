'use client';

import { useState, useRef, useEffect } from "react";
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
  FaGlobe,
  FaStreetView,
  FaPinterest,
  FaPlayCircle,
  FaPlaceOfWorship,
} from "react-icons/fa";
import moment from "moment";
import EditDataForm from "../ActionComponent/EditDataForm";
import Swal from "sweetalert2";
import { createPortal } from "react-dom";

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
  tasks,
  fetchData,
}) => {
  const [isEditDataFormOpen, setIsEditDataFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showTaskChangeModal, setShowTaskChangeModal] = useState(false);
  const [selectedItemForTaskChange, setSelectedItemForTaskChange] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const actionButtonRefs = useRef({});

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
     const result = await Swal.fire({
           title: "Are you sure to delete?",
           text: "Do you want to delete this contact?",
           icon: "error",
           showCancelButton: true,
           confirmButtonText: "yes, delete it",
           cancelButtonText: "Cancel",
         });
       
         if (!result.isConfirmed) return; 

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/delete-data",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataIDs: [item.dataID],
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

  const confirmTaskChange = async () => {
    if (!selectedTaskId) {
      addToast("Please select a task", "error");
      return;
    }

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/change-task",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskID: selectedTaskId,
            dataID: selectedItemForTaskChange.dataID,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDataDetails((prev) =>
          prev.map((preItem) =>
            preItem.dataID === selectedItemForTaskChange.dataID
              ? {
                  ...preItem,
                  taskID: selectedTaskId,
                  taskName: tasks.find((task) => task.taskID == selectedTaskId)?.task || "Unknown",
                }
              : preItem
          )
        );
        addToast(`Task changed successfully for ${selectedItemForTaskChange.name}`, "success");
      } else {
        addToast(data.message || "Failed to change task", "error");
      }
    } catch (error) {
      console.error("Error changing task:", error);
      addToast("Failed to change task", "error");
    }

    setShowTaskChangeModal(false);
    setSelectedItemForTaskChange(null);
    setSelectedTaskId("");
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

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsEditDataFormOpen(true);
    setOpenDropdownId(null);
  };

  const handleChangeTask = (item) => {
    setSelectedItemForTaskChange(item);
    setShowTaskChangeModal(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (dataID, event) => {
    if (openDropdownId === dataID) {
      setOpenDropdownId(null);
    } else {
      // Get the position of the clicked button
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX
      });
      setOpenDropdownId(dataID);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md p-4 m-2 mt-3">
      <div className="max-h-[320px] min-h-[300px] overflow-auto">
        <table className="w-full text-sm text-left border-spacing-x-4">
          <thead>
            <tr className="text-gray-700 top-0 z-10">
              <th className="px-4 py-3 border border-gray-200">
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
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUserCog className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Action
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-purple-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Contact
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-green-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Location
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaFile className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Details
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-green-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Status
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaFile className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Logs
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRecords.length > 0 ? (
              currentRecords.map((item, i) => (
                <tr
                  key={i}
                  className={`transition-colors duration-200 ${
                    selectedRows.includes(item) ? "bg-blue-50" : ""
                  } ${getLeadTypeColor(item.leadID)}`}
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
                    <div className="relative flex items-center space-x-2 dropdown-container">
                      <button
                        title="Actions"
                        className="p-2 bg-gray-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(item.dataID, e);
                        }}
                        ref={el => actionButtonRefs.current[item.dataID] = el}
                      >
                        <FaEllipsisH className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-blue-500 text-sm" />
                        <span className=" text-sm text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-purple-500 text-sm" />
                        <span className="text-gray-800 text-sm">{item.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-green-500 text-sm" />
                        <span className="text-gray-800 text-sm">{item.mobile || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaWhatsapp className="text-green-600 text-sm" />
                        <span className="text-gray-800 text-sm">{item.whatsapp || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaShareAlt className="text-blue-500 text-sm" />
                        <span className="text-gray-800 text-sm">{item.share ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-blue-600 text-sm" />
                        <span className="text-gray-800 text-sm">
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
                          <FaTag className="text-purple-600 text-sm" />
                          <span className="text-gray-800 text-sm">
                            Lead Type:{" "}
                            {leadTypes.find((type) => type.typeID == item.typeID)
                              ?.type || "Unknown"}{" "}
                            {getLeadTypeIcon(item.leadID)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <FaGlobe className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-800 ">Country:</span>
                        <span className="text-sm text-gray-800">{item.country_code || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaStreetView className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-800">State:</span>
                        <span className="text-sm text-gray-800">{item.state || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaBuilding className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-800">District:</span>
                        <span className="text-sm text-gray-800">{item.district || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPinterest className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-800">Pincode:</span>
                        <span className="text-sm text-gray-800">{item.pincode || "N/A"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPlaceOfWorship className="text-green-500 text-sm" />
                        <span className="text-sm text-gray-800">Place:</span>
                        <span className="text-sm text-gray-800">{item.address || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <FaTasks className="text-blue-600 text-sm" />
                        <span className="text-sm text-gray-800">
                          Task: {item.taskName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaUserTie className="text-blue-600 text-sm" />
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
                <td colSpan="7" className="px-4 py-3 font-semibold text-gray-600 h-64">
                  <div className="flex items-center justify-center h-full">
                    No records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dropdown Portal */}
      {openDropdownId && createPortal(
        <div 
          className="fixed z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleView(currentRecords.find(item => item.dataID === openDropdownId));
            }}
          >
            <FaEye className="mr-2" /> View
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(currentRecords.find(item => item.dataID === openDropdownId));
            }}
          >
            <FaEdit className="mr-2" /> Edit
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleChangeTask(currentRecords.find(item => item.dataID === openDropdownId));
            }}
          >
            <FaExchangeAlt className="mr-2" /> C-Task
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleLeadType(currentRecords.find(item => item.dataID === openDropdownId));
            }}
          >
            <FaTag className="mr-2" /> Lead Type
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(currentRecords.find(item => item.dataID === openDropdownId));
            }}
          >
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>,
        document.body
      )}

      {/* Task Change Modal */}
      {showTaskChangeModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Change Task for {selectedItemForTaskChange?.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Task
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Task</option>
                {tasks?.map((task) => (
                  <option key={task.taskID} value={task.taskID}>
                    {task.task}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelTaskChange}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTaskChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Change Task
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Data Form */}
      {isEditDataFormOpen && (
        <EditDataForm
          setIsEditDataFormOpen={setIsEditDataFormOpen}
          fetchData={fetchData}
          userID={userID}
          editingData={editingItem}
        />
      )}
    </div>
  );
};

export default DataTable;