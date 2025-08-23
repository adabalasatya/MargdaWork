"use client"
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaUserCheck,
  FaRegHandPointRight,
} from "react-icons/fa";

const CRMSection = ({
  selectedRows,
  addToast,
  setShowCallSend,
  setShowSendWhatsapp,
  setShowEmailSend,
  setShowSmsSend,
}) => {
  return (
    <div className="bg-white z-20 border-2 border-gray-200 w-fit shadow-md rounded-xl px-6 py-4 mt-4">
      <div className="flex items-center justify-left space-x-6 flex-wrap gap-y-4">
        <button
          onClick={() => {
            if (selectedRows.length !== 1) {
              addToast("Select one data", "error");
              return;
            }
            setShowCallSend(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaPhone className="mr-2 text-lg" /> Call
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowSendWhatsapp(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaWhatsapp className="mr-2 text-lg" /> WhatsApp
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowEmailSend(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaEnvelope className="mr-2 text-lg" /> Email
        </button>
        <button
          onClick={() => {
            if (selectedRows.length === 0) {
              addToast("Select at least one data", "error");
              return;
            }
            setShowSmsSend(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaUserCheck className="mr-2 text-lg" /> SMS
        </button>

        {/* Keeping commented functionality for reference */}
        {/* <button
          onClick={() =>
            addToast("Meet functionality not implemented", "info")
          }
          className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaUsers className="mr-2 text-lg" /> Meet
        </button>
        <button
          onClick={() =>
            addToast("Visit functionality not implemented", "info")
          }
          className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaMapMarkedAlt className="mr-2 text-lg" /> Visit
        </button> */}

        <button
          onClick={() =>
            addToast("Work Report functionality not implemented", "info")
          }
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaRegHandPointRight className="mr-2 text-lg" /> Work Report
        </button>
      </div>
    </div>
  );
};

export default CRMSection;
