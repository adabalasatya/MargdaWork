'use client';

/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useToast } from "@/app/component/customtoast/page";

const SendEmailCon = ({
  setSendEmail,
  selectedLeads = [], // Default to empty array
  setSelectedLeads,
  userID,
}) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [emailDetails, setEmailDetails] = useState({
    recipientEmails: [],
    subject: "",
    body: "",
    senderEmail: "",
    senderPassword: "",
    replyToEmail: "",
    senderName: "",
    recipientnames: [],
    attachment_urls: [],
    tempID: null,
    dataIDs: [],
    userIDs: [],
    isFooter: false,
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedService, setSelectedService] = useState("aws");
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [error, setError] = useState("");

  const [esps, setEsps] = useState([]);

  useEffect(() => {
    if (userID) {
      fetchTemplates(userID);
      fetchCreds(userID);
    }
  }, [userID]);

  const fetchCreds = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/get-credentials",
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
        setEsps(Array.isArray(data.data) ? data.data : []); // Ensure it's an array
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      if (addToast) {
        addToast("Failed to fetch email credentials", "error");
      }
    }
  };

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
        const templates = Array.isArray(data.Templates) ? data.Templates : []; // Ensure it's an array
        const filter = templates.filter((template) => template.temptype === "E");
        setTemplates(filter);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      if (addToast) {
        addToast("Failed to fetch email templates", "error");
      }
    }
  };

  const handleTemplateSelection = (template) => {
    if (template) {
      setSelectedTemplate(template);
      setEmailDetails((prevState) => ({
        ...prevState,
        subject: template.subject || "",
        body: template.matter || "",
        attachment_urls: Array.isArray(template.attach_url) ? template.attach_url : [],
        tempID: template.tempID || null,
      }));
    } else {
      setSelectedTemplate(null);
      setEmailDetails((prevState) => ({
        ...prevState,
        subject: "",
        body: "",
        attachment_urls: [],
        tempID: null,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      setError("Please select an ESP.");
      return;
    }

    if (!selectedTemplate) {
      setError("Please select a template.");
      return;
    }

    if (!followUpDateTime) {
      setError("Please provide follow up date and time");
      if (typeof toast !== 'undefined') {
        toast.warn("Please provide follow up date and time");
      }
      return;
    }

    if (!remarks) {
      if (typeof toast !== 'undefined') {
        toast.warn("Please Enter Remarks");
      }
      return;
    }

    // Ensure selectedLeads is an array and has items
    if (!Array.isArray(selectedLeads) || selectedLeads.length === 0) {
      setError("No leads selected");
      return;
    }

    setLoading(true);
    setError("");

    const emailData = {
      dataIDs: selectedLeads.map((lead) => lead.dataID),
      templateID: selectedTemplate.tempID,
      remarks,
      fdate: followUpDateTime,
      userID,
      credID: selectedService,
    };

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/email/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (!response.ok) {
        if (response.status === 402) {
          const data = await response.json();
          if (addToast) {
            addToast(data.message, "error", { autoClose: 10000 });
          }
          return router.push("/shop");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send email");
      }

      const data = await response.json();

      if (
        data.responses &&
        Array.isArray(data.responses) &&
        data.responses.length > 0
      ) {
        data.responses.forEach((resMes) => {
          if (addToast) {
            addToast(resMes.message, resMes.type);
          }
        });
      } else {
        if (addToast) {
          addToast("Email sent, Verify in email report", "info");
        }
      }

      setEmailDetails({
        recipientEmails: [],
        subject: "",
        body: "",
        senderEmail: "",
        senderPassword: "",
        replyToEmail: "",
        senderName: "",
        recipientnames: [],
        attachment_urls: [],
        tempID: null,
        dataIDs: [],
        userIDs: [],
        isFooter: false,
      });
      
      if (setSelectedLeads) {
        setSelectedLeads([]);
      }
      setSelectedTemplate(null);
      if (setSendEmail) {
        setSendEmail(false);
      }
    } catch (error) {
      if (error.message) {
        if (addToast) {
          addToast(error.message, "error");
        }
        return;
      }
      console.error("Error sending email:", error);
      if (addToast) {
        addToast(JSON.stringify(error), "error");
      }
      setError(error.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  // Add safety checks for rendering
  const safeSelectedLeads = Array.isArray(selectedLeads) ? selectedLeads : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeEsps = Array.isArray(esps) ? esps : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Send Email</h2>
          <button
            onClick={() => setSendEmail && setSendEmail(false)}
            className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✖
          </button>
        </div>
        {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Service Selection */}
          <div className="flex flex-col">
            <label htmlFor="emailService" className="font-bold mb-2">
              Select Email Service
            </label>
            <select
              id="emailService"
              value={selectedService}
              onChange={handleServiceChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select ESP</option>
              {safeEsps.map((service) => (
                <option key={service.credID} value={service.credID}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selection */}
          <div className="flex flex-col">
            <label htmlFor="template" className="font-bold mb-2">
              Select Template
            </label>
            <select
              id="template"
              value={selectedTemplate ? selectedTemplate.tempID : ""}
              onChange={(e) => {
                const selected = safeTemplates.find(
                  (template) => template.tempID === parseInt(e.target.value)
                );
                handleTemplateSelection(selected);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a template</option>
              {safeTemplates.length > 0 ? (
                safeTemplates.map((template) => (
                  <option key={template.tempID} value={template.tempID}>
                    {template.template}
                  </option>
                ))
              ) : (
                <option disabled>No templates available</option>
              )}
            </select>
          </div>

          {/* Subject */}
          <div className="flex flex-col">
            <label htmlFor="subject" className="font-bold mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={emailDetails.subject}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              placeholder={
                selectedTemplate ? "Subject from template" : "Enter subject"
              }
              disabled={!!selectedTemplate}
            />
          </div>

          {/* Body */}
          <div className="flex flex-col">
            <label htmlFor="body" className="font-bold mb-2">
              Body
            </label>
            <textarea
              name="body"
              id="body"
              value={emailDetails.body}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-vertical"
              rows={5}
              placeholder={
                selectedTemplate ? "Body from template" : "Email body"
              }
            />
          </div>

          {/* Preview Section */}
          <div className="flex flex-col">
            <label htmlFor="preview" className="font-bold mb-2">
              Preview
            </label>
            <div
              id="preview"
              className="px-4 py-2 border border-gray-300 rounded overflow-x-auto max-h-40"
              dangerouslySetInnerHTML={{ __html: emailDetails.body }}
            />
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
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              rows={3}
              placeholder="Enter remarks"
            />
          </div>

          {/* Follow Up date and time */}
          <div className="flex justify-between">
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

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setSendEmail && setSendEmail(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !safeSelectedLeads.length || !selectedTemplate}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailCon;
