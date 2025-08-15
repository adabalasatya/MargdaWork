'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Eye, EyeOff, ArrowLeft, Edit, MailIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import { MdOutlineBusinessCenter } from "react-icons/md";

// Helper object to map source codes to readable names and pre-fill data
const SOURCE_PROVIDERS = {
  G: { name: "Gmail", host: "smtp.gmail.com", port: "465" },
  A: { name: "AWS (Amazon SES)" },
  O: { name: "Outlook", host: "smtp.office365.com", port: "587" },
  C: { name: "Custom Domain", host: "", port: "" },
};

const EmailCredentials = () => {
  const router = useRouter();

  const initialFormData = {
    name: "",
    from_name: "",
    from_email: "",
    reply_email: "",
    source: "G",
    aws_region: "",
    aws_id: "",
    aws_secret: "",
    smtp_host: SOURCE_PROVIDERS.G.host,
    smtp_port: SOURCE_PROVIDERS.G.port,
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Data and Table state
  const [credentials, setCredentials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [userID, setUserID] = useState("");

  // Safe sessionStorage access
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  };

  useEffect(() => {
    const userData = getUserData();
    if (!userData || !userData.pic) {
      router.push("/work/login");
    } else {
      setUserID(userData.userID);
      fetchData(userData.userID);
    }
  }, []);

  const fetchData = async (currentUserID) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/get-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID: currentUserID }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setCredentials(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch credentials.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
      // Auto-populate SMTP fields when source changes
      if (name === "source") {
        const provider = SOURCE_PROVIDERS[value];
        if (provider?.host) {
          newFormData.smtp_host = provider.host;
          newFormData.smtp_port = provider.port;
        } else {
          newFormData.smtp_host = "";
          newFormData.smtp_port = "";
        }
      }
      return newFormData;
    });

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.from_name.trim()) errors.from_name = "From name is required";
    if (!formData.from_email || !emailRegex.test(formData.from_email))
      errors.from_email = "Valid from email is required";
    if (!formData.reply_email || !emailRegex.test(formData.reply_email))
      errors.reply_email = "Valid reply email is required";

    if (formData.source === "A") {
      if (!formData.aws_id.trim()) errors.aws_id = "AWS ID is required";
      if (!formData.aws_secret.trim()) errors.aws_secret = "AWS Secret is required";
    } else if (["G", "O", "C"].includes(formData.source)) {
      if (!formData.smtp_host.trim()) errors.smtp_host = "SMTP Host is required";
      const port = parseInt(formData.smtp_port);
      if (isNaN(port) || port < 1 || port > 65535)
        errors.smtp_port = "Valid SMTP Port (1-65535) is required";
      if (!formData.password.trim()) errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warn("Please review the form for errors.", { toastId: "form_error" });
      return;
    }

    setLoading(true);
    const payload = {
      userID,
      name: formData.name,
      from_name: formData.from_name,
      from_email: formData.from_email,
      reply_email: formData.reply_email,
      source: formData.source,
    };

    if (formData.source === "A") {
      payload.aws_id = formData.aws_id;
      payload.aws_secret = formData.aws_secret.trim();
      payload.aws_region = formData.aws_region.trim();
    } else {
      payload.smtp_host = formData.smtp_host.trim();
      payload.smtp_port = formData.smtp_port.trim();
      payload.password = formData.password.trim();
    }

    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/credentials/save-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Brand added successfully!");
        fetchData(userID); // Re-fetch data to update the table
        setFormData(initialFormData); // Reset form
        setValidationErrors({});
      } else {
        toast.error(data.message || "Failed to add brand.");
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, placeholder, type = "text") => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${
          validationErrors[name] ? "border-red-500" : "border-gray-300"
        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
      />
      {validationErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{validationErrors[name]}</p>
      )}
    </div>
  );

  // Memoized calculations for search and pagination
  const filteredCredentials = useMemo(() => {
    return credentials.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [credentials, searchQuery]);

  const paginatedCredentials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCredentials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCredentials, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-blue-600 text-white border border-gray-200 hover:bg-blue-700 transition-colors flex items-center"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="ml-1 font-medium">Back</span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center flex-1 flex justify-center items-center gap-2">
              <MailIcon className="h-7 w-7 mt-1 text-blue-600" />
              Email Service Providers
            </h1>

            <div className="w-10"></div> {/* Spacer */}
          </header>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Add New Provider
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <fieldset className="md:col-span-2 space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-700 px-2">Sender Information</legend>
                {renderInput("name", "Name", "e.g., Marketing Team Brand")}
                {renderInput("from_name", "From Name", "e.g., Miraj from Margda")}
                {renderInput("from_email", "From Email", "name@domain.com", "email")}
                {renderInput("reply_email", "Reply-To Email", "reply@domain.com", "email")}
              </fieldset>

              <fieldset className="md:col-span-2 space-y-4 border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-700 px-2">Connection Settings</legend>
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(SOURCE_PROVIDERS).map(([key, { name }]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                {formData.source === "A" ? (
                  <>
                    {renderInput("aws_region", "AWS Region", "e.g., us-east-1")}
                    {renderInput("aws_id", "AWS Access Key ID", "Your AWS Access Key")}
                    {renderInput("aws_secret", "AWS Secret Access Key", "Your AWS Secret Key", "password")}
                  </>
                ) : (
                  <>
                    {renderInput("smtp_host", "SMTP Host", "e.g., smtp.gmail.com")}
                    {renderInput("smtp_port", "SMTP Port", "e.g., 465", "number")}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Your email or app password"
                          className={`w-full px-3 py-2 border ${
                            validationErrors.password ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10`}
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          type="button"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                      )}
                    </div>
                  </>
                )}
              </fieldset>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Saving..." : "Save Provider"}
              </button>
            </div>
          </div>

          {/* Credentials List Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Saved Providers
            </h2>
            {credentials.length > 0 ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className="text-gray-700">Show</label>
                    <select id="items-per-page" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-gray-700">entries</span>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border rounded-md pl-10 py-1.5 w-full md:w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-sm text-gray-600 uppercase">
                      <tr>
                        <th className="p-3">Name</th>
                        <th className="p-3">From</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">Connection Detail</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCredentials.map((item, index) => (
                        <tr key={item.instID || `${item.from_email}-${index}`} className="border-b hover:bg-gray-50 text-sm">
                          <td className="p-3 font-medium text-gray-800">{item.name}</td>
                          <td className="p-3">{`${item.from_name} <${item.from_email}>`}</td>
                          <td className="p-3">{SOURCE_PROVIDERS[item.source]?.name || item.source}</td>
                          <td className="p-3">{item.source === "A" ? `Key: ${item.aws_id}` : `Host: ${item.smtp_host}:${item.smtp_port}`}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <button className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                              <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-md font-semibold text-gray-500">
                  <span>
                    Showing {filteredCredentials.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCredentials.length)} of {filteredCredentials.length} entries
                  </span>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <span className="px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium bg-blue-600 text-white">{currentPage}</span>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <MdOutlineBusinessCenter className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No providers added</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding an email provider above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailCredentials;