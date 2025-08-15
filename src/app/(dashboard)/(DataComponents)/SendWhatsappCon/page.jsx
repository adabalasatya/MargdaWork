'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/component/customtoast/page";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
};

const WhatsAppCon = ({ selectedLeads, setClose, userID, setSelectedLeads }) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [headerUrl, setHeaderUrl] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (userID) {
      fetchWhatsAppProfiles(userID);
      fetchTemplates(userID);
    }
  }, [userID]);

  const fetchTemplates = async (userID) => {
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
        const filter = templates.filter((template) => template.temptype === "W");
        setTemplates(filter);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      addToast("Failed to fetch WhatsApp templates", "error");
    }
  };

  const fetchWhatsAppProfiles = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/whatsapp/scan/get-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID }),
        }
      );
      const body = await response.json();
      if (response.ok) {
        setProfile(body.Profile || null);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp profiles:", error);
      addToast("Failed to fetch WhatsApp profile", "error");
    }
  };

  const sendMessage = async () => {
    if (!followUpDateTime) {
      return addToast("Please Enter Follow up date and time", "info");
    }

    if (!remarks) {
      addToast("Please Enter Remarks", "info");
      return;
    }

    if (!selectedTemplate) {
      addToast("Please select a template", "info");
      return;
    }

    setLoading(true);
    const dataIDs = selectedLeads.map((lead) => lead.dataID);
    
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/whatsapp/send-whatsapp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataIDs,
            templateID: selectedTemplate.tempID,
            userID: userID,
            remarks,
            fdate: followUpDateTime,
          }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        const responseMessages = data.responses;
        if (Array.isArray(responseMessages)) {
          responseMessages.forEach((mess) => addToast(mess.message, mess.type));
        }
      } else {
        if (response.status === 402) {
          addToast(data.message, "error", { autoClose: 10000 });
          return router.push("/shop");
        }
        addToast(data.message, "error");
      }

      setSelectedLeads([]);
      setClose(false);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.message) {
        return addToast(error.message, "error");
      }
      addToast("Error in Message Sending: " + error.toString(), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex !== "") {
      const template = templates[parseInt(selectedIndex)];
      setSelectedTemplate(template);
      setMessage(template.matter || "");
      if (template.bimg_url) {
        setHeaderUrl(template.bimg_url);
      } else {
        setHeaderUrl(null);
      }
    } else {
      setSelectedTemplate(null);
      setHeaderUrl(null);
      setMessage("");
    }
  };

  const canSendMessage = profile && profile.active;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Send WhatsApp</h2>
          <button
            onClick={() => setClose(false)}
            className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✖
          </button>
        </div>

        {/* Template Selection */}
        <div className="mb-6">
          <div className="flex flex-col">
            <label htmlFor="template" className="font-bold mb-2">
              Template
            </label>
            <select
              name="template"
              id="template"
              onChange={handleTemplateChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Template</option>
              {templates.length > 0 &&
                templates.map((template, index) => (
                  <option key={template.tempID || index} value={index}>
                    {template.template}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Header Image */}
        {headerUrl && (
          <div className="mb-6">
            <label className="font-bold mb-2 block">Header Image</label>
            <div className="w-full max-w-xs">
              <CustomImage
                src={headerUrl}
                alt="Header"
                width={300}
                height={200}
                className="w-full h-auto rounded-lg border border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Message */}
        <div className="mb-4">
          <label className="font-bold mb-2 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-vertical"
            rows={5}
            placeholder="Type your message here..."
          />
        </div>

        {/* Remarks */}
        <div className="flex flex-col mb-4">
          <label htmlFor="remarks" className="font-bold mb-2">
            Remarks
          </label>
          <textarea
            name="remarks"
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={3}
            placeholder="Enter remarks"
          />
        </div>

        {/* Follow Up date and time */}
        <div className="flex justify-between mb-6">
          <div className="flex flex-col">
            <label htmlFor="followup-date-time" className="font-bold mb-2">
              Follow up date
            </label>
            <input
              name="followup-date-time"
              id="followup-date-time"
              value={followUpDateTime}
              onChange={(e) => setFollowUpDateTime(e.target.value)}
              type="datetime-local"
              className="px-3 py-2 border border-gray-400 rounded font-light focus:ring-2 focus:ring-blue-500 focus:outline-none text-base focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {!canSendMessage && (
            <Link
              href="/work/qr-scan"
              className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors text-center"
            >
              Scan WhatsApp First
            </Link>
          )}
          
          {canSendMessage && (
            <button
              onClick={sendMessage}
              disabled={loading || !selectedTemplate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          )}

          <button
            onClick={() => setClose(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppCon;
