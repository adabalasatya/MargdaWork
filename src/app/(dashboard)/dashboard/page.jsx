"use client";

import { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaWhatsapp,
  FaEdit,
  FaSearch,
  FaUserCog,
  FaUpload,
  FaDownload,
  FaTimes,
  FaUsers,
  FaPlus,
  FaBuilding,
  FaCheck,
  FaTrash,
  FaSms,
  FaFile,
  FaChevronDown,
  FaRegHandPointRight,
  FaTasks,
  FaSteamSquare,
  FaHospitalUser,
  FaMapMarkedAlt,
  FaRegAngry,
  FaMeetup,
  FaUserCheck,
  FaAnchor,
  FaEllipsisH,
  FaEye,
  FaExchangeAlt,
  FaShareAlt,
  FaUserPlus,
  FaLock,
  FaFileInvoice,
  FaReceipt,
  FaBrain,
  FaComments,
  FaUserTie,
  FaQuestionCircle,
  FaFileUpload,
  FaTrophy,
  FaChartBar,
  FaHeart,
  FaCogs,
  FaBriefcase,
  FaFilter,
} from "react-icons/fa";
import Select from "react-select";
import Papa from "papaparse";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import AddDataForm from "@/app/(dashboard)/(DataComponents)/AddDataForm/page"
import { useToast } from "@/app/component/customtoast/page"
import SendEmailCon from "@/app/(dashboard)/(DataComponents)/SendEmailCon/page"
import WhatsAppCon from "@/app/(dashboard)/(DataComponents)/SendWhatsappCon/page"

// Sample options for filters
const sampleTasks = ["Follow-up", "Meeting", "Hiring", "Call Back"];
const sampleDataTypes = [
  { value: "P", label: "Individual" },
  { value: "B", label: "Business" },
  { value: "A", label: "Advisor" },
  { value: "W", label: "Work Seeker" },
];
const sampleCountries = [
  { country_code: "IN", country: "India" },
  { country_code: "US", country: "United States" },
];
const sampleStates = [
  { stateID: 1, state_code: "MH", state: "Maharashtra", country_code: "IN" },
  { stateID: 2, state_code: "KA", state: "Karnataka", country_code: "IN" },
];
const sampleDistricts = [
  { districtID: 1, district: "Mumbai", state_code: "MH" },
  { districtID: 2, district: "Bangalore", state_code: "KA" },
];
const samplePincodes = [
  { pinID: 1, pincode: "400001", label: "400001, Mumbai", value: 1 },
  { pinID: 2, pincode: "560001", label: "560001, Bangalore", value: 2 },
];
const sampleSkills = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];
const sampleFunctionalAreas = [
  { value: "it", label: "Information Technology" },
  { value: "hr", label: "Human Resources" },
];
const samplePositions = [
  { value: "developer", label: "Developer" },
  { value: "manager", label: "Manager" },
];
const sampleIndustries = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
];
const sampleEducations = [
  { value: "btech", label: "B.Tech" },
  { value: "mba", label: "MBA" },
];
const sampleInstitutes = [
  { value: "iit", label: "IIT" },
  { value: "iim", label: "IIM" },
];
const sampleExperiences = [
  { value: "frontend", label: "Frontend Development" },
  { value: "backend", label: "Backend Development" },
];

const Dashboard = () => {
  const router = useRouter();
  const { addToast } = useToast();
  
  // Existing state
  const [dataDetails, setDataDetails] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedDataType, setSelectedDataType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPincode, setSelectedPincode] = useState("");
  const [dataFilter, setDataFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddDataFormOpen, setIsAddDataFormOpen] = useState(false);
  const [showEmailSend, setShowEmailSend] = useState(false);
  const [showWhatsappSend, setShowSendWhatsapp] = useState(false);
  const [showSmsSend, setShowSmsSend] = useState(false);
  const [showCallSend, setShowCallSend] = useState(false);
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showCsvData, setShowCsvData] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [isEditDataFormOpen, setIsEditDataFormOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [applyFilters, setApplyFilters] = useState(false);
  const [userID, setUserID] = useState("");
  const [tasks, setTasks] = useState([]);

  // Filter states
  const [selectedDataFilter, setSelectedDataFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedEducations, setSelectedEducations] = useState([]);
  const [selectedInstitutes, setSelectedInstitutes] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [experienceYearsFrom, setExperienceYearsFrom] = useState("");
  const [experienceYearsTo, setExperienceYearsTo] = useState("");

  const expectedHeaders = [
    "datatype",
    "name",
    "mobile",
    "whatsapp",
    "email",
    "gender",
    "country_code",
    "state",
    "district",
    "pincode",
    "skills",
    "functional_area",
    "position",
    "industry",
    "education",
    "institute",
    "experience",
    "experience_years",
    "lead",
    "status",
    "created_at",
  ];

  useEffect(() => {
    // Safe access to sessionStorage
    if (typeof window !== "undefined") {
      const userData = sessionStorage.getItem("userData");
      if (!userData) {
        router.push("/work/login");
        return;
      }
      
      try {
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData || !parsedUserData.pic) {
          router.push("/work/login");
        } else {
          setUserID(parsedUserData.userID);
          fetchData(parsedUserData.userID);
          fetchTasks(parsedUserData.userID);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/work/login");
      }
    }
  }, [router]);

  const fetchData = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/data/get-data",
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
        setDataDetails(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTasks = async (userID) => {
    try {
      const response = await fetch(
        "https://www.margda.in/miraj/work/task/get-tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: userID }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTasks(data.Tasks || []);
      } else {
        setTasks([]);
        addToast(data.message || "Failed to fetch lists", "error");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      addToast("Failed to fetch lists", "error");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, meta } = results;
          const fileHeaders = meta.fields;
          if (fileHeaders.join(",") !== expectedHeaders.join(",")) {
            addToast(`Invalid columns. Expected: ${expectedHeaders.join(", ")}`, "error");
            setCsvData([]);
            setHeaders([]);
            return;
          }
          setHeaders(fileHeaders);
          setCsvData(data);
          setShowCsvData(true);
        },
      });
    }
  };

  const handleAddLeadFromCsv = () => {
    setShowCsvData(false);
    setDataDetails((prev) => [...prev, ...csvData]);
    addToast("CSV data added successfully!", "success");
  };

  const downloadSample = () => {
    const data =
      expectedHeaders.join(",") +
      "\n" +
      "P,John Doe,+911234567890,+911234567890,john@example.com,Male,IN,Maharashtra,Mumbai,400001,javascript;python,it,developer,tech,btech,iit,frontend,5,lead1,active,2025-01-15T10:00:00Z\n" +
      "B,Jane Smith,+919876543210,+919876543210,jane@example.com,Female,IN,Karnataka,Bangalore,560001,java,hr,manager,finance,mba,iim,backend,8,lead2,inactive,2025-02-20T12:00:00Z";
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleRowSelection = (data) => {
    setSelectedRows((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item !== data)
        : [...prev, data]
    );
  };

  const toggleSelectAll = (isChecked) => {
    setSelectedRows(isChecked ? [...currentRecords] : []);
  };

  const handleShortlist = () => {
    if (selectedRows.length === 0) {
      addToast("Please select at least one record to shortlist.", "error");
      return;
    }
    if (!selectedTask) {
      addToast("Select a task to Shortlist", "error");
      return;
    }
    addToast(
      `Shortlisted ${selectedRows.length} records for task: ${selectedTask}`,
      "success"
    );
    setSelectedRows([]);
  };

  const handleSelectCountry = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedPincode("");
    setApplyFilters(false);
  };

  const handleStateChange = (e) => {
    const state_code = e.target.value;
    const selectedState = sampleStates.find(
      (item) => item.state_code === state_code
    );
    setSelectedState(selectedState);
    setSelectedDistrict("");
    setSelectedPincode("");
    setApplyFilters(false);
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedPincode("");
    setApplyFilters(false);
  };

  const handlePinCodeChange = (selectedPincode) => {
    setSelectedPincode(selectedPincode);
    setApplyFilters(false);
  };

  const handleView = (item) => {
    setDataDetails((prev) =>
      prev.map((dataItem) =>
        dataItem.dataID === item.dataID
          ? { ...dataItem, show: true, isView: true }
          : dataItem
      )
    );
    addToast(`Viewing details for ${item.name}`, "info");
    setOpenDropdownId(null);
  };

  const handleDelete = (item) => {
    setDataDetails((prev) =>
      prev.filter((preItem) => preItem.dataID !== item.dataID)
    );
    addToast(`Deleted ${item.name}`, "success");
    setOpenDropdownId(null);
  };

  // Action handlers
  const handleChangeTask = (item) => {
    addToast(`Change Task for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleChangeLead = (item) => {
    addToast(`Change Lead for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleShareData = (item) => {
    addToast(`Share Data for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleShareLog = (item) => {
    addToast(`Share Log for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleMakeUser = (item) => {
    addToast(`Make User for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handlePasscode = (item) => {
    addToast(`Generate Passcode for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleInvoice = (item) => {
    addToast(`Generate Invoice for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleReceipt = (item) => {
    addToast(`Generate Receipt for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleSkillsTest = (item) => {
    addToast(`Skills Test for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleCommunicationEvaluation = (item) => {
    addToast(
      `Communication Evaluation for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleHRInteraction = (item) => {
    addToast(`HR Interaction for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleInterviewQuestions = (item) => {
    addToast(
      `Interview Questions for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleDocumentUpload = (item) => {
    addToast(`Document Upload for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleStudentContest = (item) => {
    addToast(`Student Contest for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleAptitudeAssessment = (item) => {
    addToast(
      `Aptitude Assessment for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleAttitudeAssessment = (item) => {
    addToast(
      `Attitude Assessment for ${item.name} - Functionality not implemented`,
      "info"
    );
    setOpenDropdownId(null);
  };

  const handleAbilityAnalyser = (item) => {
    addToast(`Ability Analyser for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const handleCareerDashboard = (item) => {
    addToast(`Career Dashboard for ${item.name} - Functionality not implemented`, "info");
    setOpenDropdownId(null);
  };

  const toggleDropdown = (dataID) => {
    setOpenDropdownId(openDropdownId === dataID ? null : dataID);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle filter search
  const handleFilterSearch = () => {
    setApplyFilters(true);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedDataFilter("All");
    setSelectedLead("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedPincode("");
    setSelectedSkills([]);
    setSelectedFunctionalArea("");
    setSelectedPosition("");
    setSelectedIndustry("");
    setSelectedEducations([]);
    setSelectedInstitutes([]);
    setSelectedExperiences([]);
    setExperienceYearsFrom("");
    setExperienceYearsTo("");
    setApplyFilters(false);
  };

  // Handle filter change
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setApplyFilters(false);
  };

  // Filter data
  const filteredData = dataDetails.filter((item) => {
    const matchesSearchQuery = Object.values(item).some(
      (value) =>
        value &&
        value
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim())
    );

    const matchesDataType = selectedDataType
      ? item.datatype === selectedDataType
      : true;
    const matchDataFilter =
      selectedDataFilter === "All" || item.datatype === selectedDataFilter;
    const matchLead = selectedLead ? item.lead === selectedLead : true;
    const matchStatus = selectedStatus ? item.status === selectedStatus : true;
    const matchTask = selectedTask ? item.taskID === selectedTask : true;
    const matchCountry = selectedCountry
      ? item.country_code === selectedCountry
      : true;
    const matchState = selectedState
      ? item.state === selectedState.state
      : true;
    const matchDistrict = selectedDistrict
      ? item.district === selectedDistrict
      : true;
    const matchPincode = selectedPincode
      ? item.pincode === selectedPincode.pincode
      : true;
    const matchSkills = selectedSkills.length
      ? selectedSkills.every((skill) => item.skills?.includes(skill.value))
      : true;
    const matchFunctionalArea = selectedFunctionalArea
      ? item.functional_area === selectedFunctionalArea
      : true;
    const matchPosition = selectedPosition
      ? item.position === selectedPosition
      : true;
    const matchIndustry = selectedIndustry
      ? item.industry === selectedIndustry
      : true;
    const matchEducations = selectedEducations.length
      ? selectedEducations.every((edu) => item.education?.includes(edu.value))
      : true;
    const matchInstitutes = selectedInstitutes.length
      ? selectedInstitutes.every((inst) => item.institute?.includes(inst.value))
      : true;
    const matchExperiences = selectedExperiences.length
      ? selectedExperiences.every((exp) => item.experience?.includes(exp.value))
      : true;
    const matchExperienceYears =
      (!experienceYearsFrom ||
        item.experience_years >= Number(experienceYearsFrom)) &&
      (!experienceYearsTo ||
        item.experience_years <= Number(experienceYearsTo));
    const matchDate =
      (!dateFrom || moment(item.created_at).isSameOrAfter(moment(dateFrom))) &&
      (!dateTo || moment(item.created_at).isSameOrBefore(moment(dateTo)));

    return (
      matchesSearchQuery &&
      matchesDataType &&
      matchDataFilter &&
      matchTask &&
      matchLead &&
      matchStatus &&
      matchCountry &&
      matchState &&
      matchDistrict &&
      matchPincode &&
      matchSkills &&
      matchFunctionalArea &&
      matchPosition &&
      matchIndustry &&
      matchEducations &&
      matchInstitutes &&
      matchExperiences &&
      matchExperienceYears &&
      matchDate
    );
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    const value = e.target.value;
    setCurrentPage(1);
    setRecordsPerPage(value ? Math.max(1, Math.min(500, value)) : 1);
  };

  const getPaginationRange = () => {
    const totalPageNumbers = 5;
    const halfRange = Math.floor(totalPageNumbers / 2);
    let startPage = Math.max(currentPage - halfRange, 1);
    let endPage = Math.min(startPage + totalPageNumbers - 1, totalPages);
    if (endPage - startPage + 1 < totalPageNumbers) {
      startPage = Math.max(endPage - totalPageNumbers + 1, 1);
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
      {/* Header Section */}
      <div className="bg-white z-30 border-2 border-gray-200 w-fit mt-2 shadow-sm rounded-xl px-6 py-3">
        <div className="flex items-center justify-left space-x-4">
          <button
            onClick={() => setIsAddDataFormOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaPlus className="mr-2 text-lg" /> Add Data
          </button>
          <Link href="">
            <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200">
              <FaVenusMars className="mr-2 text-lg" /> Campaign
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Upload Section */}
      <div className="bg-white border-2 border-gray-200 shadow-md rounded-xl px-6 py-4 mt-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 max-w-md">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* CRM Section */}
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
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
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
            onClick={() => addToast("RCM functionality not implemented", "info")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaUserCheck className="mr-2 text-lg" /> RCM
          </button>
          <button
            onClick={() => addToast("Meet functionality not implemented", "info")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaUsers className="mr-2 text-lg" /> Meet
          </button>
          <button
            onClick={() => addToast("Visit functionality not implemented", "info")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaMapMarkedAlt className="mr-2 text-lg" /> Visit
          </button>
          <button
            onClick={() => addToast("Work Report functionality not implemented", "info")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
          >
            <FaRegHandPointRight className="mr-2 text-lg" /> Work Report
          </button>
        </div>
      </div>

      {/* Filter Toggle Button (Right Corner) */}
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={toggleFilter}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaFilter className="mr-2 text-lg" />
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </button>

        <button
          onClick={handleShortlist}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
        >
          <FaCheck className="mr-2 text-lg" />
          Shortlist ({selectedRows.length})
        </button>

        <select
          name="tasks"
          id="tasks"
          onChange={(e) => setSelectedTask(e.target.value)}
          value={selectedTask}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:scale-105 transition-transform duration-200"
        >
          <option value="">Tasks</option>
          {tasks.map((task) => (
            <option className="bg-blue-500" value={task.taskID} key={task.taskID}>
              {task.task}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Popup */}
      {isFilterOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Advanced Filters</h2>
              <button
                onClick={toggleFilter}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Filters</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <select
                    value={selectedDataFilter}
                    onChange={(e) => setSelectedDataFilter(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="All">All Data</option>
                    <option value="P">Individual</option>
                    <option value="B">Business</option>
                    <option value="A">Advisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
                  <select
                    value={selectedLead}
                    onChange={(e) => setSelectedLead(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">All Leads</option>
                    <option value="lead1">Lead 1</option>
                    <option value="lead2">Lead 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="border-2 border-gray-300 rounded-lg p-2"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="border-2 border-gray-300 rounded-lg p-2"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              {/* Location Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Location</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={handleSelectCountry}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select Country</option>
                    {sampleCountries.map((country) => (
                      <option key={country.country_code} value={country.country_code}>
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={selectedState?.state_code || ""}
                    onChange={handleStateChange}
                    disabled={!selectedCountry}
                    className={`w-full border-2 border-gray-300 rounded-lg p-2 ${
                      !selectedCountry ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select State</option>
                    {sampleStates
                      .filter((state) => state.country_code === selectedCountry)
                      .map((state) => (
                        <option key={state.state_code} value={state.state_code}>
                          {state.state}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={!selectedState}
                    className={`w-full border-2 border-gray-300 rounded-lg p-2 ${
                      !selectedState ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select District</option>
                    {sampleDistricts
                      .filter(
                        (district) =>
                          district.state_code === selectedState?.state_code
                      )
                      .map((district) => (
                        <option key={district.districtID} value={district.district}>
                          {district.district}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pin code</label>
                  <Select
                    options={samplePincodes.filter(
                      (pincode) =>
                        sampleDistricts.find((d) => d.district === selectedDistrict)
                          ?.state_code ===
                        sampleStates.find(
                          (s) => s.state_code === selectedState?.state_code
                        )?.state_code
                    )}
                    value={selectedPincode}
                    onChange={handlePinCodeChange}
                    placeholder="Select Pincode"
                    className="w-full"
                    isDisabled={!selectedDistrict}
                  />
                </div>
              </div>

              {/* Professional Filters */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Professional</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <Select
                    isMulti
                    options={sampleSkills}
                    value={selectedSkills}
                    onChange={(selected) => setSelectedSkills(selected)}
                    placeholder="Select Skills"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Functional Area</label>
                  <select
                    value={selectedFunctionalArea}
                    onChange={(e) => setSelectedFunctionalArea(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select Functional Area</option>
                    {sampleFunctionalAreas.map((area) => (
                      <option key={area.value} value={area.value}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select Position</option>
                    {samplePositions.map((position) => (
                      <option key={position.value} value={position.value}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select Industry</option>
                    {sampleIndustries.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <Select
                    isMulti
                    options={sampleEducations}
                    value={selectedEducations}
                    onChange={(selected) => setSelectedEducations(selected)}
                    placeholder="Select Education"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                  <Select
                    isMulti
                    options={sampleInstitutes}
                    value={selectedInstitutes}
                    onChange={(selected) => setSelectedInstitutes(selected)}
                    placeholder="Select Institute"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <Select
                    isMulti
                    options={sampleExperiences}
                    value={selectedExperiences}
                    onChange={(selected) => setSelectedExperiences(selected)}
                    placeholder="Select Experience"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Years</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={experienceYearsFrom}
                      onChange={(e) => setExperienceYearsFrom(e.target.value)}
                      placeholder="From"
                      className="border-2 border-gray-300 rounded-lg p-2"
                    />
                    <input
                      type="number"
                      value={experienceYearsTo}
                      onChange={(e) => setExperienceYearsTo(e.target.value)}
                      placeholder="To"
                      className="border-2 border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200"
              >
                Reset Filters
              </button>
              <button
                onClick={handleFilterSearch}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-md p-6 mt-4">
        <table className="w-full text-sm text-left border-spacing-x-4">
          <thead>
            <tr className="text-gray-700 top-0 bg-gray-50 z-10">
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.length >= currentRecords.length && currentRecords.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Selected ({selectedRows.length})
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaUserCog className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Action
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-purple-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Data
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-green-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Location
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaFile className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Details
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-green-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Status
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-200 bg-gray-100">
                <div className="flex items-center space-x-2">
                  <FaFile className="text-blue-600 w-5 h-5" />
                  <span className="text-sm font-semibold text-gray-700">
                    Logs
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRecords.map((item, i) => (
              <tr
                key={i}
                className={`hover:bg-gray-100 transition-colors duration-200 ${
                  selectedRows.includes(item) ? "bg-blue-50" : ""
                }`}
                onClick={() => toggleRowSelection(item)}
              >
                <td className="px-4 py-3 border-r border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item)}
                    onChange={() => toggleRowSelection(item)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="relative">
                    <button
                      title="Actions"
                      className="p-2 bg-gray-500 text-white rounded-full shadow-md hover:scale-105 transition-transform duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.dataID);
                      }}
                    >
                      <FaEllipsisH className="w-5 h-5" />
                    </button>
                    {openDropdownId === item.dataID && (
                      <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(item);
                          }}
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingData(item);
                            setIsEditDataFormOpen(true);
                          }}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeTask(item);
                          }}
                        >
                          <FaExchangeAlt className="mr-2" /> C-Task
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeLead(item);
                          }}
                        >
                          <FaExchangeAlt className="mr-2" /> C-Lead
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareData(item);
                          }}
                        >
                          <FaShareAlt className="mr-2" /> S-Data
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareLog(item);
                          }}
                        >
                          <FaShareAlt className="mr-2" /> S-Log
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeUser(item);
                          }}
                        >
                          <FaUserPlus className="mr-2" /> Make User
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePasscode(item);
                          }}
                        >
                          <FaLock className="mr-2" /> Passcode
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoice(item);
                          }}
                        >
                          <FaFileInvoice className="mr-2" /> Invoice
                        </button>
                        {item.paid && (
                          <button
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceipt(item);
                            }}
                          >
                            <FaReceipt className="mr-2" /> Receipt
                          </button>
                        )}
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkillsTest(item);
                          }}
                        >
                          <FaBrain className="mr-2" /> Skills Test
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunicationEvaluation(item);
                          }}
                        >
                          <FaComments className="mr-2" /> Communication
                          Evaluation
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHRInteraction(item);
                          }}
                        >
                          <FaUserTie className="mr-2" /> HR Interaction
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInterviewQuestions(item);
                          }}
                        >
                          <FaQuestionCircle className="mr-2" /> Interview
                          Questions
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentUpload(item);
                          }}
                        >
                          <FaFileUpload className="mr-2" /> Document Upload
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentContest(item);
                          }}
                        >
                          <FaTrophy className="mr-2" /> Student Contest
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAptitudeAssessment(item);
                          }}
                        >
                          <FaChartBar className="mr-2" /> Aptitude Assessment
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttitudeAssessment(item);
                          }}
                        >
                          <FaHeart className="mr-2" /> Attitude Assessment
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAbilityAnalyser(item);
                          }}
                        >
                          <FaCogs className="mr-2" /> Ability Analyser
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCareerDashboard(item);
                          }}
                        >
                          <FaBriefcase className="mr-2" /> Career Dashboard
                        </button>
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <FaTrash className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-500 w-5 h-5" />
                      <span className="font-medium text-gray-800">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-purple-500 w-5 h-5" />
                      <span className="flex text-gray-800 items-center gap-1">
                        {item.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-green-500 w-5 h-5" />
                      <span className="text-gray-800">
                        {item.mobile || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaWhatsapp className="text-green-600 w-5 h-5" />
                      <span className="text-gray-800">
                        {item.whatsapp || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-600 w-5 h-5" />
                      <span className="text-gray-800">
                        {Array.isArray(item.datatype)
                          ? item.datatype
                              .map((type) =>
                                type == "P"
                                  ? "Individual"
                                  : type == "B"
                                  ? "Business"
                                  : type == "L"
                                  ? "Learner"
                                  : type
                              )
                              .join(", ")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <p className="text-sm text-gray-800">
                        Country: {item.country_code}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <p className="text-sm text-gray-800">
                        State: {item.state}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <p className="text-sm text-gray-800">
                        District: {item.district}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <p className="text-sm text-gray-800">
                        Pincode: {item.pincode}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-green-500 w-5 h-5" />
                      <p className="text-sm text-gray-800">
                        Place: {item.address}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-800">
                      Task: {item.taskName}
                    </p>
                    <p className="text-sm text-gray-800">
                      Owner: {item.euserName}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <p className="text-sm text-gray-800">Status: {item.status}</p>
                </td>
                <td className="px-4 py-3 border-r border-gray-200">
                  <p className="text-sm text-gray-800">
                    Logs: No logs available
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4">
        <div className="text-sm font-semibold text-gray-600">
          Showing {indexOfFirstRecord + 1} to{" "}
          {Math.min(indexOfLastRecord, filteredData.length)} Records
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
            }`}
          >
            {"<<"} Previous
          </button>
          {getPaginationRange().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 ${
                currentPage === page
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
              } rounded-lg shadow-md`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300 hover:scale-105 transition-transform duration-200"
            }`}
          >
            Next {">>"}
          </button>
        </div>
      </div>

      {/* CSV Data Modal */}
      {csvData.length > 0 && showCsvData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white shadow-xl rounded-xl overflow-x-auto overflow-y-auto max-h-[700px] w-3/4 p-6">
            <div className="flex justify-end space-x-4 mb-4">
              <button
                onClick={() => setShowCsvData(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLeadFromCsv}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
              >
                Add All Data
              </button>
            </div>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-center">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="py-3 px-4 text-justify uppercase font-semibold text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="py-3 px-4 text-justify text-base font-normal"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Data Modal */}
      {isAddDataFormOpen && (
        <AddDataForm
          setIsAddDataFormOpen={setIsAddDataFormOpen}
          fetchData={fetchData}
          userID={userID}
        />
      )}

      {/* Edit Data Modal */}
      {isEditDataFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Data
            </h2>
            <p className="text-gray-700">Editing: {editingData.name}</p>
            <button
              onClick={() => setIsEditDataFormOpen(false)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Email Send Modal */}
      {showEmailSend && (
        <SendEmailCon
          setSendEmail={setShowEmailSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* WhatsApp Send Modal */}
      {showWhatsappSend && (
        <WhatsAppCon
          setClose={setShowSendWhatsapp}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* SMS Send Modal */}
      {showSmsSend && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Send SMS
            </h2>
            <button
              onClick={() => setShowSmsSend(false)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Call Send Modal */}
      {showCallSend && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Make Call
            </h2>
            <button
              onClick={() => setShowCallSend(false)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
