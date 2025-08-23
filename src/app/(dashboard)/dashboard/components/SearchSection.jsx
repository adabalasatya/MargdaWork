"use client"
import { FaSearch, FaUpload, FaDownload } from "react-icons/fa";

const SearchSection = ({
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  recordsPerPage,
  setRecordsPerPage,
  handleFileUpload,
  downloadSample,
}) => {
  const handleRecordsPerPageChange = (e) => {
    const value = e.target.value;
    setCurrentPage(1);
    setRecordsPerPage(value ? Math.max(1, Math.min(500, value)) : 1);
  };

  return (
    <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-4 mt-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 max-w-md">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent outline-none flex-1 text-gray-700"
            />
          </div>
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
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
            <FaUpload className="mr-2 text-lg" />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={downloadSample}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaDownload className="mr-2 text-lg" />
            Sample CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
