'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/component/customtoast/page";
import { FaFileAlt } from "react-icons/fa";
import axios from "axios";
import LoadingProgress from "@/app/component/LoadingProgress";

const AddTemplate = () => {
  const router = useRouter();
  const [templateType, setTemplateType] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [headerFile, setHeaderFile] = useState(null);
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

  const { addToast } = useToast();

  const handleHeaderFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type for header file (images only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        addToast("Please select a valid image file (JPG, JPEG, PNG)", "error");
        return;
      }
      setHeaderFile(file);
    }
  };

  const handleHeaderFileDelete = () => {
    setHeaderFile(null);
    // Reset the file input
    const fileInput = document.getElementById('header');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    // Validation
    if (!templateType.trim()) {
      newErrors.templateType = "Template type is required.";
    }
    if (!templateName.trim()) {
      newErrors.templateName = "Template Name is required.";
    }
    if (!message.trim()) {
      newErrors.message = "Message is required";
    }
    if (templateType === "E") {
      if (!subject.trim()) {
        newErrors.subject = "Subject is required";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    let payload;
    if (templateType !== "E") {
      payload = {
        templateType,
        templateName,
        message,
        userID,
      };
    } else {
      payload = {
        templateType,
        templateName,
        subject,
        message,
        userID,
      };
    }

    try {
      // Upload header file if exists
      if (headerFile) {
        const formData = new FormData();
        formData.append("files", headerFile);
        setIsUploading(true);
        setUploadingMessage("Uploading Header File");
        setUploadProgress(0);

        try {
          const uploadRes = await axios.post(
            "https://www.margda.in/miraj/work/template/upload-file",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          if (uploadRes.status === 200) {
            payload.headerFileUrl = uploadRes.data.fileUrls[0];
          } else {
            payload.headerFileUrl = null;
          }
        } catch (uploadError) {
          console.error("Header file upload error:", uploadError);
          addToast("Failed to upload header file", "error");
          payload.headerFileUrl = null;
        }

        setUploadingMessage("");
        setIsUploading(false);
      }

      // Upload attachment files if any
      if (attachmentFiles.length > 0) {
        const validFiles = attachmentFiles.filter(file => file !== null);
        
        if (validFiles.length > 0) {
          setIsUploading(true);
          setUploadingMessage("Uploading Attachment Files");
          setUploadProgress(0);

          const formData = new FormData();
          validFiles.forEach((file) => {
            formData.append("files", file);
          });

          try {
            const uploadRes = await axios.post(
              "https://www.margda.in/miraj/work/template/upload-file",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setUploadProgress(percentCompleted);
                },
              }
            );

            if (uploadRes.status === 200) {
              payload.templateFileUrls = uploadRes.data.fileUrls;
            } else {
              payload.templateFileUrls = [];
            }
          } catch (uploadError) {
            console.error("Attachment files upload error:", uploadError);
            addToast("Failed to upload attachment files", "error");
            payload.templateFileUrls = [];
          }

          setUploadingMessage("");
          setIsUploading(false);
        }
      }

      // Submit template
      const apiUrl = "https://www.margda.in/miraj/work/template/add-template";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok) {
        addToast(data.message, "success");
        router.push("/work/templates-list");
      } else {
        addToast(data.message, "error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast(error.message || "An error occurred while submitting", "error");
    } finally {
      setIsUploading(false);
      setUploadingMessage("");
      setUploadProgress(0);
    }
  };

  const handleAttachmentFilesChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedFiles = [...attachmentFiles];
      updatedFiles[index] = file;
      setAttachmentFiles(updatedFiles);
    }
  };

  const handleAddAttachmentFilesInput = () => {
    if (attachmentFiles.length < 4) {
      setAttachmentFiles([...attachmentFiles, null]);
    }
  };

  const handleRemoveAttachmentFilesInput = (index) => {
    const updatedFiles = attachmentFiles.filter((_, i) => i !== index);
    setAttachmentFiles(updatedFiles);
  };

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    
    switch (field) {
      case 'templateType':
        setTemplateType(value);
        // Reset form fields when template type changes
        setSubject("");
        setMessage("");
        setHeaderFile(null);
        setAttachmentFiles([]);
        break;
      case 'templateName':
        setTemplateName(value);
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'message':
        setMessage(value);
        break;
      default:
        break;
    }
  };

  // Show loading if user data is not loaded yet
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      {isUploading && (
        <LoadingProgress
          progress={uploadProgress}
          uploadMessage={uploadingMessage}
        />
      )}
      
      <div className="text-3xl font-bold text-center font-sans mb-6 flex justify-center items-center">
        <FaFileAlt className="text-blue-500 mr-2" /> Template
      </div>
      
      <div className="bg-white rounded shadow-md p-6 w-full max-w-6xl mx-auto border-2 border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="template-type" className="font-bold mb-2">
              Template Type <span className="text-red-500">*</span>
            </label>
            <select
              name="template-type"
              id="template-type"
              value={templateType}
              onChange={(e) => handleInputChange('templateType', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Template Type</option>
              <option value="E">Email</option>
              <option value="W">WhatsApp</option>
              <option value="S">SMS</option>
            </select>
            {errors.templateType && (
              <p className="text-red-500 text-sm mt-1">{errors.templateType}</p>
            )}
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="template-name" className="font-bold mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="template-name"
              id="template-name"
              value={templateName}
              onChange={(e) => handleInputChange('templateName', e.target.value)}
              placeholder="Enter Template Name Here"
              className="px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.templateName && (
              <p className="text-red-500 text-sm mt-1">{errors.templateName}</p>
            )}
          </div>
        </div>

        {/* Subject field for Email templates */}
        {templateType === "E" && (
          <div className="mt-6">
            <div className="flex flex-col">
              <label htmlFor="template-subject" className="font-bold mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="template-subject"
                id="template-subject"
                value={subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter Subject Here"
                className="px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
            </div>
          </div>
        )}

        {/* Header file upload for WhatsApp templates */}
        {templateType === "W" && (
          <div className="mt-6">
            <div className="flex flex-col">
              <label className="font-bold mb-2">Header File</label>
              <label
                htmlFor="header"
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-center transition-colors"
              >
                {headerFile ? "Change Header File" : "Select Header File"}
              </label>
              {headerFile && (
                <div className="flex items-center justify-between border border-gray-300 rounded p-2 mt-3 hover:bg-red-50 transition-colors">
                  <span className="text-gray-700">{headerFile.name}</span>
                  <button
                    onClick={handleHeaderFileDelete}
                    className="text-red-600 hover:text-red-800 ml-2"
                    aria-label="Remove File"
                  >
                    ✖
                  </button>
                </div>
              )}
              <input
                type="file"
                name="header"
                className="hidden"
                id="header"
                onChange={handleHeaderFileChange}
                accept="image/jpeg,image/jpg,image/png"
              />
              <div className="text-red-500 text-sm mt-2">
                Allowed only .jpg, .png, .jpeg formats
              </div>
            </div>
          </div>
        )}

        {/* Message field */}
        <div className="mt-6">
          <div className="flex flex-col">
            <label htmlFor="template-message" className="font-bold mb-2">
              Message <span className="text-red-500">*</span>
            </label>

            <div>
              <textarea
                name="message"
                id="template-message"
                placeholder="Enter your message here..."
                rows={5}
                value={message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-vertical"
              />
              <div className="justify-end flex text-sm text-gray-600 mr-3 mt-1">
                Length: {message.length}
              </div>
            </div>

            {/* Preview for Email templates */}
            {templateType === "E" && (
              <div className="mt-4">
                <label htmlFor="preview" className="font-bold mb-2 block">
                  Preview
                </label>
                <div
                  id="preview"
                  className="border border-gray-300 rounded p-4 min-h-[100px] bg-gray-50"
                  dangerouslySetInnerHTML={{
                    __html: message || "Preview will be shown here",
                  }}
                />
              </div>
            )}
            
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
        </div>

        {/* Attachment files (not for SMS) */}
        {templateType !== "S" && templateType && (
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4">Attachments</h2>
            {attachmentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 mb-4 border border-gray-300 rounded p-3 bg-gray-50"
              >
                <input
                  type="file"
                  id={`attachment${index}`}
                  onChange={(e) => handleAttachmentFilesChange(e, index)}
                  className="hidden"
                />
                <label
                  htmlFor={`attachment${index}`}
                  className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer hover:bg-gray-500 transition-colors"
                >
                  {file ? "Change File" : `${index + 1}. Choose File`}
                </label>
                {file && (
                  <span className="text-gray-600 flex-1">{file.name}</span>
                )}
                <button
                  onClick={() => handleRemoveAttachmentFilesInput(index)}
                  className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  title="Remove attachment"
                >
                  ✖
                </button>
              </div>
            ))}
            
            {attachmentFiles.length < 4 ? (
              <button
                onClick={handleAddAttachmentFilesInput}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              >
                {attachmentFiles.length === 0
                  ? "Add Attachment"
                  : "Add Another Attachment"}
              </button>
            ) : (
              <div className="text-red-500 text-sm mt-2">
                Maximum 4 files allowed
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Submitting..." : "Submit"}
          </button>
          <Link
            href="/templates-list"
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-center"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddTemplate;
