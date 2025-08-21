"use client"; 

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const CallCon = ({ setShowCallCon, selectedLeads, setSelectedLeads, fetchData }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [callType, setCallType] = useState("S");
  const [callServices, setCallServices] = useState([
    { value: "S", name: "SIM" },
    { value: "A", name: "API" },
  ]);

  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return;
  
      const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
      if (!storedUserData || !storedUserData.pic) {
        router.push("/work/login");
        return;
      } else {
        setUserData(storedUserData);
        setUserID(storedUserData.userID);
      }
    }, [router]);

  useEffect(() => {
    check();
  }, [selectedLeads]);

  const check = () => {
    if (selectedLeads?.length > 0) {
      for (let i = 0; i < selectedLeads.length; i++) {
        const lead = selectedLeads[i];
        if (!lead.isView) {
          // Enable both options but default to API for non-view leads
          setCallServices([
            { value: "S", name: "SIM" },
            { value: "A", name: "API" },
          ]);
          setCallType("A");
          break;
        }
      }
    }
  };

  const handleCall = async () => {
    if (selectedLeads.length > 1) {
      addToast("Please select only one lead for calling.", "warning");
      return;
    }

    const lead = selectedLeads[0];
    const mobile = lead.mobile;

    if (!followUpDateTime) {
      toast.warn("Please Enter Follow up date and time");
      return;
    }
    if (!remarks) {
      toast.warn("Please Enter Remarks");
      return;
    }

    setIsLoading(true);
    try {
      if (callType === "S") {
        // Use the new API endpoint for SIM calls
        const response = await fetch(
          "https://www.margda.in/miraj/work/data/call/make-call",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userID: userID ,
              dataID: lead.dataID,
              remarks: remarks,
              fdate: followUpDateTime,
            }),
          }
        );
        
        const data = await response.json();
        if (response.ok) {
          addToast(data.message || "Call initiated successfully.", "success");
          setSelectedLeads([]);
          if (fetchData) fetchData();
          setShowCallCon(false);
        } else {
          if (response.status == 402) {
            addToast(data.message, "error", 10000);
            return router.push("/shop");
          }
          addToast(data.message || "Failed to initiate call.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      addToast("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Initiate Call</h2>
          <button
            onClick={() => setShowCallCon(false)}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Call Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={callType}
              onChange={(e) => setCallType(e.target.value)}
            >
              {callServices.map((service, index) => (
                <option
                  key={index}
                  value={service.value}
                  disabled={service.disabled}
                >
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <label htmlFor="remarks" className="font-bold mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:outline-none focus:ring-blue-500"
              rows="2"
              placeholder="Remarks"
            />
          </div>

          {/* Follow Up date and time */}
          <div className="flex flex-col mt-4">
            <label htmlFor="followup-date-time" className="font-bold mb-2">
              Follow up date
            </label>
            <input
              name="followup-date-time"
              id="followup-date-time"
              value={followUpDateTime}
              onChange={(e) => setFollowUpDateTime(e.target.value)}
              type="datetime-local"
              className="px-3 py-1 border border-gray-400 rounded font-light focus:ring-blue-500 text-base focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-5">
            <button
              onClick={() => setShowCallCon(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCall}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calling..." : "Call"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallCon;