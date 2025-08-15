'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/component/customtoast/page";
import axios from "axios";
import LoadingProgress from "@/app/component/LoadingProgress";

const EditTemplate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allUsers, setAllUsers] = useState([]);
  const [tempID, setTempID] = useState("");
  const [members, setMembers] = useState([]);
  const [templateType, setTemplateType] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [share, setShare] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [attachmentUrls, setAttachmentUrls] = useState([]);
  const [headerFile, setHeaderFile] = useState(null);
  const [headerUrl, setHeaderUrl] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const { addToast } = useToast();

  // Safe localStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  const userLocalData = getUserData();
  const accessToken = userLocalData ? userLocalData.access_token : null;

  useEffect(() => {
    // Get template data from query parameters
    const templateData = searchParams.get('template');
    if (templateData) {
      try {
        const template = JSON.parse(decodeURIComponent(templateData));
        setTemplateType(template.temptype.trim());
        setTempID(template.tempID);
        setSubject(template.subject);
        setTemplateName(template.template);
        setTemplateId(template.auth);
        setMessage(template.matter);
        setShare(template.share);
        setHeaderUrl(template.bimg_url);
        setAttachmentUrls(template.attach_url);
      } catch (error) {
        console.error('Error parsing template data:', error);
        router.push("/work/templates-list");
      }
    } else {
      router.push("/work/templates-list");
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAllUsersData();
  }, []);

  const fetchAllUsersData = async () => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/margda.org/admin/getallusers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setAllUsers([]);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (response.ok) {
        const users = result.data;
        users.map((user) => {
          user.label = `${user.name}, ${user.email.slice(
            0,
            4
          )}******${user.email.slice(
            user.email.length - 3,
            user.email.length
          )}`;
          user.value = user.userID;
          return user;
        });
        setAllUsers(users);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleHeaderFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setHeaderFile(file);
    }
  };

  const handleHeaderFileDelete = () => {
    setHeaderFile(null);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!templateType.trim()) {
      newErrors.templateType = "Template type is required.";
    }
    if (!templateName.trim()) {
      newErrors.templateName = "Template Name is required.";
    }
    if (!message) {
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
    let payload;
    if (templateType !== "E") {
      payload = {
        tempID,
        templateName,
        share,
        templateId,
        message,
      };
    } else {
      payload = {
        tempID,
        templateName,
        share,
        subject,
        message,
      };
    }
    if (headerFile) {
      const formData = new FormData();
      formData.append("files", headerFile);
      setIsUploading(true);
      setUploadingMessage("Uploading Header File");
      const uploadRes = await axios.post(
        "https://www.margda.in/miraj/work/template/upload-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      setUploadingMessage("");
      setIsUploading(false);
      if (uploadRes.status === 200) {
        payload.headerFileUrl = uploadRes.data.fileUrls[0];
      } else {
        payload.headerFileUrl = null;
      }
    } else if (headerUrl) {
      payload.headerFileUrl = headerUrl;
    }
    payload.templateFileUrls = [];
    if (attachmentFiles.length > 0) {
      setIsUploading(true);
      setUploadingMessage("Uploading Attachment Files");
      const formData = new FormData();

      attachmentFiles.forEach((file) => {
        if (file) {
          formData.append("files", file);
        }
      });
      try {
        const uploadRes = await axios.post(
          "https://www.margda.in/miraj/work/template/upload-file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );
        setUploadingMessage("");
        setIsUploading(false);
        if (uploadRes.status === 200) {
          payload.templateFileUrls.push(...uploadRes.data.fileUrls);
        } else {
          payload.templateFileUrls = [];
        }
      } catch (error) {
        setUploadingMessage("");
        setIsUploading(false);
      }
    }
    if (attachmentUrls && attachmentUrls.length > 0) {
      payload.templateFileUrls.push(...attachmentUrls);
    }
    const apiUrl = "https://www.margda.in/miraj/work/template/edit-template";
    try {
      const response = await fetch(apiUrl, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        addToast(data.message, "success");
        return router.push("/templates-list");
      } else {
        return addToast(data.message, "error");
      }
    } catch (error) {
      console.log(error);
      return addToast(error, "error");
    }
  };

  const handleAttachmentFilesChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const updatedFiles = [...attachmentFiles];
      updatedFiles[index] = file; // Update the specific index with the selected file
      setAttachmentFiles(updatedFiles);
    }
  };

  const handleAddAttachmentFilesInput = () => {
    setAttachmentFiles([...attachmentFiles, null]); // Add a placeholder for a new file
  };

  const handleRemoveAttachmentFilesInput = (index) => {
    const updatedFiles = attachmentFiles.filter((_, i) => i !== index);
    setAttachmentFiles(updatedFiles);
  };

  const handleRemoveAttachmentUrls = (index) => {
    const updatedUrls = attachmentUrls.filter((_, i) => i !== index);
    setAttachmentUrls(updatedUrls);
  };

  return (
    <div className="flex flex-col  justify-start items-start p-2">
      {isUploading && (
        <LoadingProgress
          progress={uploadProgress}
          uploadMessage={uploadingMessage}
        />
      )}
      <div className="text-3xl font-semibold font-sans mt-4 text-center w-full">
  Template
</div>

      <div
        className="bg-white self-center justify-between flex flex-col p-4 mt-4 rounded-md border-2 shadow-md border-gray-300"
        style={{ minWidth: "98%" }}
      >
        <div className="flex flex-row text-base font-normal justify-between w-full">
          <div className="flex flex-col items-start w-full">
            <label htmlFor="template-type" className="font-bold text-center p-1">
              Template Type
            </label>
            <select
              disabled
              name="template-type"
              id="template-type"
              value={templateType}
              onChange={(e) => {
                setTemplateType(e.target.value);
                setErrors({ ...errors, ["templateType"]: "" });
              }}
              className="px-3  w-[90%] py-2 border border-gray-400 rounded font-light focus:ring-blue-500 text-base focus:border-blue-500 "
            >
              <option value="">Select Template Type</option>
              <option value="W">Whatsapp</option>
              <option value="E">Email</option>
              <option value="S">Sms</option>
            </select>
            {errors.templateType && (
              <p className="text-red-500 text-sm mt-1">{errors.templateType}</p>
            )}
          </div>
          <div className="flex flex-col items-start w-full">
            <label htmlFor="template-name" className="font-bold p-1">
              Template Name
            </label>
            <input
              type="text"
              name="template-name"
              id="template-name"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setErrors({ ...errors, ["templateName"]: "" });
              }}
              placeholder="Enter Template Name Here"
              className="px-3  w-[90%] py-2 border border-gray-400 rounded font-light focus:ring-blue-500 text-base focus:border-blue-500 "
            />
            {errors.templateName && (
              <p className="text-red-500 text-sm mt-1">{errors.templateName}</p>
            )}
          </div>
        </div>
        {templateType !== "W" && (
          <div className="flex flex-row text-base font-normal justify-between w-1/2 mt-4">
            {templateType === "E" && (
              <div className="flex flex-col items-start w-full">
                <label htmlFor="template-id" className="font-bold p-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="template-subject"
                  id="template-subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setErrors({ ...errors, ["subject"]: "" });
                  }}
                  placeholder="Enter Subject Here"
                  className="px-3  w-[90%] py-2 border border-gray-400 rounded font-light focus:ring-blue-500 text-base focus:border-blue-500 "
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>
            )}
          </div>
        )}

        {templateType === "W" && (
          <div className="flex flex-row text-base font-normal justify-between w-1/2 mt-4">
            <div className="flex flex-col items-start w-full">
              <label
                htmlFor="header"
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
              >
                {headerUrl || headerFile
                  ? "Change Header File"
                  : "Select Header File"}
              </label>
              {headerFile && (
                <div className="flex items-center justify-between border border-gray-300 rounded p-2 mt-3 hover:bg-red-300">
                  <button
                    onClick={handleHeaderFileDelete}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Remove File"
                  >
                    <span className="text-gray-700">{headerFile.name}</span>✖
                  </button>
                </div>
              )}
              <input
                type="file"
                name="header"
                className="hidden"
                id="header"
                onChange={handleHeaderFileChange}
                accept="image/*"
              />
              <div className="text-red-500 mt-3">
                Allowed only .jpg, .png,.jpeg formats
              </div>
            </div>
          </div>
        )}
        {headerUrl && !headerFile && (
          <a href={headerUrl} className="w-max" target="_blank" rel="noopener noreferrer">
            <div className="flex items-start justify-start border border-gray-300 rounded p-2 mt-3 text-base font-normal w-full">
              {"Header File"}
            </div>
          </a>
        )}
        <div className="mt-6">
          <div className="flex flex-col">
            <label
              htmlFor="template-message"
              className="text-base font-normal p-1"
            >
              Message
            </label>

            <div>
              <textarea
                name="message"
                id="template-message"
                placeholder="Message"
                rows={5}
                value={message}
                onChange={(e) => {
                  const newText = e.target.value;
                  setMessage(newText); // Update state normally if within limit
                }}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div className="justify-end flex text-sm mr-3 mt-3">
              Length: {message.length}
            </div>
            {templateType == "E" && (
              <div className="flex flex-col justify-start items-start">
                <label htmlFor="preview" className="text-base font-normal p-1">
                  Preview
                </label>
                <div
                  id="preview"
                  style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginTop: "10px",
                    overflowX: "scroll",
                    maxHeight: "400px",
                    overflowY: "scroll",
                  }}
                  className="w-full p-2 mb-4 border-gray-300 flex flex-col items-start"
                  dangerouslySetInnerHTML={{
                    __html: message ? message : "Preview Will be Show Here",
                  }}
                />
              </div>
            )}
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
        </div>

        {templateType && templateType.trim() !== "S" && (
          <div>
            <div className="flex flex-col text-base font-bold justify-between items-start w-[90%] mt-6">
              <h1 className="text-lg font-bold mt-6">
                {attachmentUrls && attachmentUrls.length > 0
                  ? "Change Attachments"
                  : "Attachment"}
              </h1>
              {attachmentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mt-6 border px-4 py-1 pl-1"
                >
                  <input
                    type="file"
                    id={`attachmet${index}`}
                    onChange={(e) => handleAttachmentFilesChange(e, index)}
                    className="hidden"
                  />

                  <label
                    htmlFor={`attachmet${index}`}
                    className="px-4 py-2 bg-gray-400 text-white rounded cursor-pointer hover:bg-gray-500"
                  >
                    {file ? "Change File" : `${index + 1}. Choose File`}
                  </label>
                  {file ? (
                    <button
                      onClick={() => handleRemoveAttachmentFilesInput(index)}
                      className="text-red-600 px-4 hover:bg-gray-300 rounded"
                    >
                      <span className="text-gray-600 ">{file.name} </span>
                      <sup>X</sup>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRemoveAttachmentFilesInput(index)}
                      className="text-red-400 hover:text-red-800"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              {attachmentFiles.length +
                (attachmentUrls ? attachmentUrls.length : 0) <
              4 ? (
                <button
                  onClick={handleAddAttachmentFilesInput}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 mt-6"
                >
                  {attachmentFiles.length === 0
                    ? "Add Attachment"
                    : "Add another attachment"}
                </button>
              ) : (
                <div className="text-base font-normal text-red-500 mt-6">
                  You can add only 4 files
                </div>
              )}
            </div>
            {attachmentUrls &&
              attachmentUrls.length > 0 &&
              attachmentUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center gap-4 mt-6 border px-4 py-1 pl-1 w-min"
                >
                  <a key={index} href={url} className="w-min" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-start justify-start border border-gray-300 rounded p-2 text-base font-normal w-max">
                      {`${index + 1}. Attachment`}
                    </div>
                  </a>
                  <button
                    onClick={() => handleRemoveAttachmentUrls(index)}
                    className="text-red-400 hover:text-red-800"
                  >
                    X
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="flex flex-row justify-start gap-3 my-3">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-normal font-mono text-base"
          >
            Submit
          </button>
          <Link
            href="/templates-list"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-normal font-mono text-base"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditTemplate;
