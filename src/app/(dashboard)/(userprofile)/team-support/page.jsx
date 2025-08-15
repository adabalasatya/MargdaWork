'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaPhone, FaTicketAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "@/app/component/Loader";
import { useToast } from "@/app/component/customtoast/page";

// Custom Image Component to handle both external and internal images
const CustomImage = ({ src, alt, className, width, height, onError, ...props }) => {
  const isExternalUrl = src?.startsWith('http');
  
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: `${width}px`, height: `${height}px` }}
        onError={onError}
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
      onError={onError}
      {...props}
    />
  );
};

// Define header variants for animation
const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DownArrow = () => (
  <div className="flex justify-center my-8">
    <svg
      className="w-8 h-8 text-gray-600 animate-bounce"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </div>
);

const UpArrow = () => (
  <div className="flex justify-center my-8">
    <svg
      className="w-8 h-8 text-gray-600 animate-bounce"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
  </div>
);

const TeamSupport = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localUserData, setLocalUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refered, setRefered] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [associate, setAssociate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const userData = JSON.parse(localStorage.getItem("userData") || 'null');
    if (userData) {
      setLocalUserData(userData);
      setAccessToken(userData.access_token);
      fetchTeamDetails(userData.access_token);
    }
  }, []);

  const fetchTeamDetails = async (token) => {
    try {
      const response = await fetch(
        "https://www.margda.in/api/user/team/team-details",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log(data);
        if (data.Refered && data.Refered.length > 0) {
          setRefered(data.Refered);
        }
        if (data.mentor) {
          setMentor(data.mentor);
        }
        if (data.associate) {
          setAssociate(data.associate);
        }
      }
    } catch (error) {
      console.log(error);
      addToast("Failed to fetch team details", "error");
    }
  };

  const openSupportTicket = () => {
    router.push("/support-ticket");
  };

  const handleCallClick = async (phoneNumber) => {
    if (phoneNumber && localUserData) {
      setLoading(true);
      try {
        const response = await fetch(
          "https://www.margda.in/api/cloud_telephony/initiate_call_to_lead",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              agent_number: localUserData.user_data.mobile,
              destination_number: phoneNumber,
            }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          addToast(data.message || "Call initiated successfully.", "success");
        } else {
          if (response.status === 400 || response.status === 402) {
            return router.push("/shop");
          }
          addToast(data.message || "Failed to initiate call.", "error");
        }
      } catch (error) {
        console.log(error);
        addToast(error.message || "An error occurred", "error");
      } finally {
        setLoading(false);
      }
    } else {
      addToast("This team member hasn't added mobile number yet", "error");
    }
  };

  // Show loading or return null if data is not available yet
  if (!localUserData) {
    return <Loader />;
  }

  return (
    <div className="bg-white p-4">
      {/* Header Section */}
      {loading && <Loader />}
      <motion.header
        className="bg-gray-50"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 rounded-lg shadow-md overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CustomImage
                src="/logoicon.png"
                alt="Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%"],
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{
                background:
                  "linear-gradient(to right, purple, blue, cyan, purple)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                MozBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              Team Support
            </motion.h1>
          </div>
        </div>
      </motion.header>
      <br />
      
      {/* Support Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-1">
        {/* Support Call */}
        <div className="flex flex-col items-center group">
          <div className="w-[360px] h-28 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-400 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-400 transition-all duration-300">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
              <motion.div
                className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CustomImage
                  src="/support.jpg"
                  alt="Support Call"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
          <button
            onClick={() => handleCallClick("7965174000")}
            className="flex items-center bg-blue-900 text-white px-8 py-2 rounded-md hover:bg-purple-700 transition-colors mt-6 shadow-md hover:shadow-lg"
          >
            <FaPhone className="mr-2" /> Support Call
          </button>
        </div>

        {/* Support Ticket */}
        <div className="flex flex-col items-center group">
          <div className="w-[360px] h-28 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-400 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-400 transition-all duration-300">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4">
              <motion.div
                className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CustomImage
                  src="/support1.jpg"
                  alt="Support Ticket"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
          <button
            onClick={openSupportTicket}
            className="flex items-center bg-blue-900 text-white px-8 py-2 rounded-md hover:bg-purple-700 transition-colors mt-6 shadow-md hover:shadow-lg"
          >
            <FaTicketAlt className="mr-2" /> Support Ticket
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-16">
        <div className="flex flex-row justify-around px-6 items-center">
          {associate && (
            <div className="flex flex-col items-center group ">
              <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <motion.div
                    className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CustomImage
                      src={associate.pic_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"}
                      alt={associate.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-12 text-gray-800">
                Associate
              </h3>
              <p className="text-gray-600">{associate.name}</p>
              <button
                onClick={() => handleCallClick(associate.mobile)}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <FaPhone className="mr-2" /> Click to Call
              </button>
            </div>
          )}
          {mentor && (
            <div className="flex flex-col items-center group ">
              <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <motion.div
                    className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CustomImage
                      src={mentor.pic_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"}
                      alt={mentor.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-12 text-gray-800">
                Mentor
              </h3>
              <p className="text-gray-600">{mentor.name}</p>
              <button
                onClick={() => handleCallClick(mentor.mobile)}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <FaPhone className="mr-2" /> Click to Call
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Leaders */}
      <div className="">
        {/* Up Arrow on top of Support Team */}
        <UpArrow />

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Support TEAM
          </h2>
          <div className="flex flex-col items-center group">
            <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <motion.div
                  className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CustomImage
                    src={localUserData.user_data.pic_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"}
                    alt={localUserData.user_data.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-12 text-gray-800">
              {localUserData.user_data.name}
            </h3>
          </div>
        </div>

        {/* Down Arrow below Support Team */}
        <DownArrow />

        <div className="text-center pb-9">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Business Associates
          </h2>

          {refered.length > 0 ? (
            <div className="flex flex-row flex-wrap w-full gap-3">
              {refered.map((item, index) => (
                <div
                  className="flex flex-col items-center group mb-9"
                  key={index}
                >
                  <div className="w-[360px] h-32 bg-[#183258] rounded-b-full relative mb-4 shadow-lg group-hover:bg-sky-500 group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-sky-500 transition-all duration-300">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <motion.div
                        className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0px 10px 15px rgba(255, 0, 0, 0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CustomImage
                          src={
                            item.pic_url ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4uQmq5l06DIuhNUDihsvATgceMTbyKNBzT4Rharp2hacekLEJHq9eaKF1LPaT9_iRpA&usqp=CAU"
                          }
                          alt={item.name}
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mt-12 text-gray-800">
                    {item.name}
                  </h3>

                  <div>
                    {item.district ? item.district : ""}
                    &nbsp;
                    {item.pincode ? item.pincode : ""}
                  </div>
                  <button
                    onClick={() => handleCallClick(item.mobile)}
                    className="flex flex-col items-center bg-green-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center">
                      <FaPhone className="mr-2" /> Click to Call
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              <p>No business associates found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSupport;
