"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const SendSmsCon = ({ setClose, selectedLeads, setSelectedLeads, fetchData }) => {
  const router = useRouter();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [templateID, setTemplateID] = useState("");

  const [userID, setUserID] = useState("");
  const [userData, setUserData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || "null");
    if (!storedUserData || !storedUserData.pic) {
      router.push("/login");
      return;
    }
    setUserData(storedUserData);
    setUserID(storedUserData.userID);
    
    // Fetch templates after setting userID
    if (storedUserData.userID) {
      fetchTemplates(storedUserData.userID);
    }
  }, [router]);

  const fetchTemplates = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/template/get-templates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // Updated to match the API response structure from TemplatesList
        const templates = data.Templates || [];
        setTemplates(templates);
        
        // Auto-select the first template if available
        if (templates.length > 0) {
          setTemplateID(templates[0].tempID || templates[0].templateID || templates[0].id || "");
        }
      } else {
        toast.error(data.message || "Failed to fetch templates", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Error loading templates. Please try again.", { autoClose: 3000 });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSendSms = async () => {
    // Validate selection
    if (!selectedLeads?.length) {
      addToast("Please select at least one lead to send SMS.", "warning");
      return;
    }

    // Validate required fields
    if (!templateID) {
      toast.warn("Please select a template");
      return;
    }
    if (!remarks) {
      toast.warn("Please enter remarks");
      return;
    }
    if (!followUpDateTime) {
      toast.warn("Please enter follow-up date and time");
      return;
    }

    const dataIDs = selectedLeads.map((lead) => lead.dataID).filter(Boolean);
    if (!dataIDs.length) {
      addToast("Selected leads are missing data IDs.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://www.margda.in/miraj/work/data/sms/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateID: Number(templateID),     
          remarks: remarks,                   
          fdate: followUpDateTime,           
          userID: userID,                    
          dataIDs: dataIDs,                  
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(data.message || `SMS sent to ${dataIDs.length} recipient(s).`, "success");
        setSelectedLeads([]);
        if (fetchData) fetchData();
        setClose(false);
      } else {
        if (response.status === 402) {
          addToast(data.message || "Payment required. Redirecting to shop.", "error", 10000);
          return router.push("/dashboard");
        }
        addToast(data.message || "Failed to send SMS.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("An error occurred while sending SMS. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a unique key for each template option
  const getTemplateKey = (template, index) => {
    return template.tempID || template.templateID || template.id || `template-${index}`;
  };

  // Get the template value for the option
  const getTemplateValue = (template) => {
    return template.tempID || template.templateID || template.id || "";
  };

  // Get the template name for display
  const getTemplateName = (template) => {
    return template.template || template.name || template.templateName || `Template ${getTemplateValue(template)}`;
  };

  // Filter templates to only show SMS templates
  const smsTemplates = templates.filter(template => 
    template.temptype === "S" || template.type === "SMS"
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Send SMS</h2>
          <button
            onClick={() => setClose(false)}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            {loadingTemplates ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 animate-pulse">
                Loading templates...
              </div>
            ) : (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={templateID}
                onChange={(e) => setTemplateID(e.target.value)}
                disabled={smsTemplates.length === 0}
              >
                <option value="">Select a template</option>
                {smsTemplates.map((template, index) => (
                  <option 
                    key={getTemplateKey(template, index)} 
                    value={getTemplateValue(template)}
                  >
                    {getTemplateName(template)}
                  </option>
                ))}
              </select>
            )}
            {smsTemplates.length === 0 && !loadingTemplates && (
              <p className="text-sm text-red-500 mt-1">No SMS templates available</p>
            )}
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
              onClick={() => setClose(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSms}
              disabled={isLoading || smsTemplates.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send SMS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendSmsCon;