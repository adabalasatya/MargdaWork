"use client";
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaUserCheck,
  FaRegHandPointRight,
  FaDatabase,
} from "react-icons/fa";

const CRMSection = ({
  selectedRows,
  addToast,
  setShowCallSend,
  setShowSendWhatsapp,
  setShowEmailSend,
  setShowSmsSend,
  setShowReportCon,
  setShowGoogleDataCon,
}) => {
  return (
    <div className="bg-white z-20 border-2 border-gray-200 w-fit  m-2 shadow-md rounded-xl px-6 py-2 mt-3">
      <div className="flex items-center justify-left space-x-6 flex-wrap gap-y-4">
        <button
          onClick={() => {
            if (selectedRows.length !== 1) {
              addToast("Select one data", "error");
              return;
            }
            setShowCallSend(true);
          }}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaPhone className="mr-2 text-sm" /> Call
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowSendWhatsapp(true);
          }}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaWhatsapp className="mr-2 text-sm" /> WhatsApp
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowEmailSend(true);
          }}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaEnvelope className="mr-2 text-sm" /> Email
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowSmsSend(true);
          }}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaUserCheck className="mr-2 text-sm" /> SMS
        </button>

        {/* Keeping commented functionality for reference */}
        {/* <button
          onClick={() =>
            addToast("Meet functionality not implemented", "info")
          }
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaUsers className="mr-2 text-sm" /> Meet
        </button>
        <button
          onClick={() =>
            addToast("Visit functionality not implemented", "info")
          }
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaMapMarkedAlt className="mr-2 text-sm" /> Visit
        </button> */}

        <button
          onClick={() => setShowReportCon(true)}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaRegHandPointRight className="mr-2 text-sm" /> Work Report
        </button>
        <button
          onClick={() => setShowGoogleDataCon(true)}
          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-800 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaDatabase className="mr-2 text-sm" /> Google Data
        </button>
      </div>
    </div>
  );
};

export default CRMSection;
