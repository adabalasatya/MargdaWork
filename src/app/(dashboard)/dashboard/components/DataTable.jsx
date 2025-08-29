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
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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

  const cancelTaskChange = () => {
    setShowTaskChangeModal(false);
    setSelectedItemForTaskChange(null);
    setSelectedTaskId("");
  };

  const calculateDropdownPosition = (buttonElement) => {
    if (!buttonElement) return { top: 0, left: 0 };
    
    const buttonRect = buttonElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Approximate dropdown height
    
    let top = buttonRect.bottom + window.scrollY;
    let left = buttonRect.left + window.scrollX;
    
    // Check if dropdown would go below viewport
    if (buttonRect.bottom + dropdownHeight > viewportHeight) {
      top = buttonRect.top + window.scrollY - dropdownHeight;
    }
    
    // Ensure dropdown doesn't go off screen horizontally
    const dropdownWidth = 192; // w-48 = 12rem = 192px
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 10;
    }
    
    return { top, left };
  };

  const toggleDropdown = (dataID, buttonElement) => {
    if (openDropdownId === dataID) {
      setOpenDropdownId(null);
    } else {
      const position = calculateDropdownPosition(buttonElement);
      setDropdownPosition(position);
      setOpenDropdownId(dataID);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      {/* SOLUTION 1: Using relative positioning with better overflow handling */}
      <div className="overflow-auto max-h-[450px] rounded-md relative">
        <table className="w-full text-sm text-left border-spacing-x-4">
          <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 z-20">
            <tr className="text-white">
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length >= currentRecords.length &&
                      currentRecords.length > 0
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="form-checkbox h-5 w-5  rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold ">
                    Selected ({selectedRows.length})
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUserCog className="w-5 h-5" />
                  <span className="text-sm font-semibold ">
                    Action
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUser className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Contact
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUsers className=" w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Location
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaFile className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Details
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaCheck className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    Status
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaFile className="w-5 h-5" />
                  <span className="text-sm">
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
                    <div className="relative flex items-center space-x-2">
                      <button
                        ref={(el) => {
                          if (openDropdownId === item.dataID) {
                            buttonRef.current = el;
                          }
                        }}
                        title="Actions"
                        className="p-2 bg-gray-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(item.dataID, e.currentTarget);
                        }}
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
                <td colSpan="7" className="px-4 py-3 font-semibold text-gray-600">
                  <div className="flex items-center justify-center h-full">
                    No records found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Dropdown,table container */}
      {openDropdownId && (
        <div 
          className="fixed z-[9999] w-48 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const item = currentRecords.find(record => record.dataID === openDropdownId);
              if (item) handleView(item);
            }}
          >
            <FaEye className="mr-2 text-blue-500" /> View
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const item = currentRecords.find(record => record.dataID === openDropdownId);
              if (item) handleEditClick(item);
            }}
          >
            <FaEdit className="mr-2 text-green-500" /> Edit
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const item = currentRecords.find(record => record.dataID === openDropdownId);
              if (item) handleChangeTask(item);
            }}
          >
            <FaExchangeAlt className="mr-2 text-blue-500" /> C-Task
          </button>
          <button
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const item = currentRecords.find(record => record.dataID === openDropdownId);
              if (item) handleLeadType(item);
            }}
          >
            <FaTag className="mr-2 text-purple-500" /> Lead Type
          </button>
          <div className="border-t border-gray-100">
            <button
              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const item = currentRecords.find(record => record.dataID === openDropdownId);
                if (item) handleDelete(item);
              }}
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        </div>
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