'use client';

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaVenusMars,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCamera,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useToast } from "@/app/component/customtoast/page";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: `${width}px`, height: `${height}px` }}
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

const MyProfile = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState({
    pic_url: "",
    name: "",
    gender: "",
    mobile: "",
    email: "",
    dob: "",
    country_code: "",
    stateID: "",
    districtID: "",
    pincode: "",
    place: "",
    languages: [],
    referID: "",
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    console.log("storedUserData:", storedUserData);

    if (!storedUserData || !storedUserData.userID) {
      return router.push("/login");
    } else {
      console.log(storedUserData);
      setUserData(storedUserData);
      setFormValues((prev) => ({
        ...prev,
        pic_url: storedUserData.pic || "",
        name: storedUserData.name || "",
        gender: storedUserData.gender || "",
        mobile: String(storedUserData.mobile || ""),
        email: storedUserData.email || "",
        dob: formatDateToIndianISO(storedUserData.dob) || "",
        country_code: storedUserData.country_code || "",
        stateID: storedUserData.stateID || "",
        districtID: storedUserData.districtID || "",
        pincode: storedUserData.pincode || "",
        place: storedUserData.place || "",
        languages: storedUserData.languages
          ? JSON.parse(storedUserData.languages)
          : [],
        referID: storedUserData.referID || "",
      }));
    }
  }, [router]);

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleInputChange = (name, value) => {
    setFormValues({
      ...formValues,
      [name]:
        name === "languages"
          ? value
          : typeof value === "string"
          ? value
          : String(value || ""),
    });
  };

  const handleProfilePicChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        addToast("Please select an image file", "error", { toastId: Date.now() + Math.random() });
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        addToast("Image size should be less than 5MB", "error", { toastId: Date.now() + Math.random() });
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormValues({ ...formValues, pic_url: reader.result });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadProfilePicture = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userID", userData.userID);

      const response = await fetch(
        "https://www.margda.in/miraj/work/profile/upload-profile-pic",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile picture");
      }

      addToast("Profile picture uploaded successfully!", "success", {
        toastId: Date.now() + Math.random(),
      });
      
      // Update the user data in session storage
      const updatedUserData = {
        ...userData,
        pic: data.pic_url || formValues.pic_url,
      };
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
      }
      
      setUserData(updatedUserData);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      addToast(
        error.message || "Failed to upload profile picture",
        "error",
        {
          toastId: Date.now() + Math.random(),
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  function formatDateToIndianISO(dateString) {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    // Get the local time adjusted for IST (UTC+5:30)
    const offsetDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

    // Extract year, month, and day
    const year = offsetDate.getUTCFullYear();
    const month = String(offsetDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(offsetDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formValues.pic_url)
        newErrors.pic_url = "Please upload a profile picture.";
      if (!formValues.name) newErrors.name = "Please input your Name.";
      else if (formValues.name.length < 2)
        newErrors.name = "Name must be at least 2 characters long.";
      if (!formValues.gender) newErrors.gender = "Please select your Gender.";
    } else if (step === 2) {
      if (!formValues.mobile)
        newErrors.mobile = "Please input your Mobile Number.";
      if (!formValues.email) newErrors.email = "Please input your Email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email))
        newErrors.email = "Please enter a valid email address.";
      if (!formValues.dob) newErrors.dob = "Please input your Date of Birth.";
    }
    return newErrors;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = validateStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach((error) =>
        addToast(error, "error", { toastId: Date.now() + Math.random() })
      );
      return;
    }

    const messages = [
      "Personal details validated successfully!",
      "Contact information validated successfully!",
    ];
    addToast(messages[step - 1], "success", {
      toastId: Date.now() + Math.random(),
    });

    setErrors({});
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = validateStep();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach((error) =>
        addToast(error, "error", { toastId: Date.now() + Math.random() })
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload profile picture first if a new one was selected
      if (file) {
        await uploadProfilePicture();
      }

      const formData = new FormData();
      formData.append("userID", userData.userID);
      formData.append("name", formValues.name);
      formData.append("gender", formValues.gender);
      formData.append("DOB", formValues.dob);
      formData.append("email", formValues.email);
      formData.append("mobile", formValues.mobile);
      formData.append("languages", JSON.stringify(formValues.languages));

      const response = await fetch(
        "https://www.margda.in/miraj/work/profile/update-profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
          body: formData,
        }
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          `Unexpected response format: ${text.substring(0, 100)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      addToast(
        "Profile updated successfully! Redirecting to dashboard...",
        "success",
        {
          toastId: Date.now() + Math.random(),
          autoClose: 2000,
        }
      );

      const updatedUserData = {
        ...userData,
        pic: formValues.pic_url,
        name: formValues.name,
        gender: formValues.gender,
        mobile: formValues.mobile,
        email: formValues.email,
        dob: formValues.dob,
        languages: JSON.stringify(formValues.languages),
      };
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("userData", JSON.stringify(updatedUserData));
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 200);
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast(
        error.message ||
          "An error occurred while updating your profile. Please try again later.",
        "error",
        {
          toastId: Date.now() + Math.random(),
          autoClose: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      {/* Form Card */}
      <div className="flex items-center justify-center w-full">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 space-y-6"
        >
          <div className="flex items-center justify-center mb-6">
            <CustomImage
              src="/logoicon.png"
              alt="Logo"
              width={48}
              height={48}
              className="mr-3"
            />
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
          </div>

          <form
            onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <label
                    htmlFor="profilePic"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Profile Picture
                  </label>
                  <div className="relative group">
                    <CustomImage
                      src={
                        formValues.pic_url ||
                        "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_1280.png"
                      }
                      alt="Profile"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-full border-2 border-gradient-to-r from-blue-500 to-blue-600 shadow-md mb-4 object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <label
                      htmlFor="profilePic"
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition opacity-0 group-hover:opacity-100"
                    >
                      <FaCamera className="text-sm" />
                    </label>
                    {file && (
                      <button
                        type="button"
                        onClick={uploadProfilePicture}
                        disabled={isUploading}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isUploading ? "Uploading..." : "Save Image"}
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={handleProfilePicChange}
                    accept="image/*"
                    id="profilePic"
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Click on the camera icon to upload a profile picture
                  </p>
                  {errors.pic_url && (
                    <p className="text-red-500 text-xs text-center mt-1">
                      {errors.pic_url}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative h-[4.5rem]">
                      <FaUser className="absolute left-4 top-4 text-blue-500 text-lg" />
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formValues.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 text-gray-700 placeholder-gray-400 text-base"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gender
                    </label>
                    <div className="relative h-[4.5rem]">
                      <FaVenusMars className="absolute left-4 top-4 text-blue-500 text-lg" />
                      <select
                        id="gender"
                        value={formValues.gender || ""}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 text-gray-700 placeholder-gray-400 text-base"
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <div className="relative h-[4.5rem]">
                    <PhoneInput
                      country={"in"}
                      value={String(formValues.mobile || "")}
                      onChange={(value) => handleInputChange("mobile", value)}
                      placeholder="Enter mobile number"
                      inputStyle={{
                        width: "100%",
                        paddingLeft: "3rem",
                        paddingRight: "1rem",
                        paddingTop: "1.55rem",
                        paddingBottom: "1.55rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        lineHeight: "1.5rem",
                        color: "#374151",
                        backgroundColor: "white",
                        height: "2.75rem",
                      }}
                      buttonStyle={{
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem 0 0 0.5rem",
                        backgroundColor: "white",
                      }}
                      dropdownStyle={{ borderRadius: "0.5rem", zIndex: 9999 }}
                    />
                  </div>
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative h-[4.5rem]">
                    <FaEnvelope className="absolute left-4 top-4 text-blue-500 text-lg" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formValues.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 text-gray-700 placeholder-gray-400 text-base"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <div className="relative h-[4.5rem]">
                    <FaCalendarAlt className="absolute left-4 top-4 text-blue-500 text-lg" />
                    <input
                      id="dob"
                      type="date"
                      value={formValues.dob || ""}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400 text-gray-700 placeholder-gray-400 text-base"
                    />
                  </div>
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3">
              {step > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold text-base focus:outline-none transition-all duration-300 hover:bg-gray-300"
                >
                  <FaArrowLeft className="mr-2" /> Previous
                </motion.button>
              )}
              {step < 2 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="flex items-center justify-center px-6 py-3 ml-auto w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-base focus:outline-none transition-all duration-300 hover:bg-purple-700"
                >
                  Next <FaArrowRight className="ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-lg focus:outline-none transition-all duration-300 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-purple-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Complete Profile"}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfile;