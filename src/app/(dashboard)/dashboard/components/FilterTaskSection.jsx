"use client"
import { FaTag, FaTasks, FaFilter } from "react-icons/fa";

const FilterTaskSection = ({
  leadTypes,
  selectedLeadType,
  handleLeadTypeChange,
  dataDetails,
  tasks,
  selectedTask,
  handleTaskChange,
  filteredData,
}) => {
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

  return (
    <div className="flex justify-end mt-4 gap-2">
      {/* Keeping filter and shortlist buttons commented for reference */}
      {/* <button
        onClick={toggleFilter}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        <FaFilter className="mr-2 text-lg" />
        {isFilterOpen ? "Hide Filters" : "Show Filters"}
      </button>

      <button
        onClick={handleShortlist}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
      >
        <FaCheck className="mr-2 text-lg" />
        Shortlist ({selectedRows.length})
      </button> */}

      {leadTypes.length > 0 && (
        <div className="flex items-center space-x-2">
          <FaTag className="text-purple-600 w-5 h-5" />
          <select
            name="leadTypes"
            id="leadTypes"
            onChange={handleLeadTypeChange}
            value={selectedLeadType}
            className="flex items-center px-4 py-2 bg-purple-500 outline-none text-white rounded-md shadow-md transition-transform duration-200 hover:bg-purple-600 cursor-pointer"
          >
            <option value="" className="bg-white text-black">
              All Lead Types ({dataDetails.length} records)
            </option>
            {leadTypes.map((type) => {
              const typeRecordCount = dataDetails.filter(
                (item) =>
                  item.typeID == type.typeID ||
                  parseInt(item.typeID) === parseInt(type.typeID)
              ).length;

              return (
                <option
                  className="bg-white text-black"
                  value={type.typeID}
                  key={type.typeID}
                >
                  {type.type} {getLeadTypeIcon(type.typeID)} (
                  {typeRecordCount} records)
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <FaTasks className="text-blue-600 w-5 h-5" />
        <select
          name="tasks"
          id="tasks"
          onChange={handleTaskChange}
          value={selectedTask}
          className="flex items-center px-4 py-2 bg-blue-500 outline-none text-white rounded-md shadow-md transition-transform duration-200 hover:bg-blue-600 cursor-pointer"
        >
          <option value="" className="bg-white text-black">
            All Tasks ({dataDetails.length} records)
          </option>
          {tasks.map((task) => {
            const taskRecordCount = dataDetails.filter(
              (item) =>
                item.taskID === task.taskID ||
                item.taskID === parseInt(task.taskID)
            ).length;

            return (
              <option
                className="bg-white text-black"
                value={task.taskID}
                key={task.taskID}
              >
                {task.task} ({taskRecordCount} records)
              </option>
            );
          })}
        </select>
      </div>

      {(selectedTask || selectedLeadType) && (
        <div className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md">
          <FaFilter className="mr-2 w-4 h-4" />
          <span className="text-sm font-medium">
            Filtered: {filteredData.length} records
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterTaskSection;
