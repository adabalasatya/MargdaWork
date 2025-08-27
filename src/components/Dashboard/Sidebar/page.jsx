"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import {
  FaBuilding,
  FaUserTie,
  FaEdit,
  FaWhatsapp,
  FaPhone,
  FaArrowAltCircleRight,
  FaHourglassEnd,
  FaVoicemail,
  FaMailBulk,
  FaArrowRight,
  FaList,
  FaSms,
} from "react-icons/fa";

const Sidebar = ({ toggleSidebar }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [menuStates, setMenuStates] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMenuStates = sessionStorage.getItem("menuStates");
      return savedMenuStates ? JSON.parse(savedMenuStates) : {};
    }
    return {};
  });

  const sidebarRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = sessionStorage.getItem("userData");
      if (!userData) {
        router.push("/login");
        return;
      }
      try {
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    }
  }, [router]);

  const menus = [
    // Uncomment HR menu when needed
    // {
    //   name: "HR",
    //   icon: <FaUserTie />,
    //   items: [
    //     { title: "Add Skill", link: "/add-skill", icon: <FaArrowAltCircleRight /> },
    //     { title: "Skill MCQ", link: "/skill-mcq", icon: <FaArrowAltCircleRight /> },
    //     { title: "Skill Test", link: "/skill-test", icon: <FaArrowAltCircleRight /> },
    //     { title: "Add Interview Questions", link: "/add-hr-question", icon: <FaArrowAltCircleRight /> },
    //     { title: "HR Interaction", link: "/hr-interaction", icon: <FaArrowAltCircleRight /> },
    //     { title: "HR Communication Test", link: "/hr-communication-test", icon: <FaArrowAltCircleRight /> },
    //     { title: "Trainee Dashboard", link: "/trainee-dashboard", icon: <FaArrowAltCircleRight /> },
    //     { title: "Upload Documents", link: "/upload-documents", icon: <FaArrowAltCircleRight /> },
    //     { title: "Verify Documents", link: "/verify-documents", icon: <FaArrowAltCircleRight /> },
    //   ],
    // },
    {
      name: "Email Campaign",
      icon: <FaMailBulk />,
      items: [
        {
          title: "Email Credentials",
          link: "/email-credentials",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Email Campaign",
          link: "/email-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Email Campaign Reports",
          link: "/campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Communicate", link: "/work/communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "Whatsapp campaign",
      icon: <FaWhatsapp />,
      items: [
        {
          title: "Scan WhatsApp",
          link: "/qr-scan",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Whatsapp Campaign",
          link: "/whatsapp-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Whatsapp Campaign Reports",
          link: "/whatsapp-campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Communicate", link: "/work/whatsapp-communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "SMS/RCM campaign",
      icon: <FaSms />,
      items: [
        // { title: "SIM/API Credentials", link: "/work/sim-api-credentials", icon: <FaArrowAltCircleRight /> },
        {
          title: "Sms Campaign",
          link: "/sms-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Sms Lists", link: "/work/sms-lists", icon: <FaArrowAltCircleRight /> },
        // { title: "Sms Templates", link: "/work/Sms-templates", icon: <FaArrowAltCircleRight /> },
        {
          title: "Sms Campaign Reports",
          link: "/sms-campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Sms Communicate", link: "/work/sms-communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "Templates",
      icon: <FaList />,
      items: [
        {
          title: "All Templates",
          link: "/templates-list",
          icon: <FaArrowRight />,
        },
        {
          title: "Add Template",
          link: "/add-template",
          icon: <FaArrowRight />,
        },
      ],
    },
    {
      name: "Lists",
      icon: <FaList />,
      items: [
        {
          title: "Manage Lists",
          link: "/manage-lists",
          icon: <FaArrowRight />,
        },
      ],
    },
    {
      name: "Tasks",
      icon: <FaList />,
      items: [
        {
          title: "Manage Tasks",
          link: "/manage-tasks",
          icon: <FaArrowRight />,
        },
      ],
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("menuStates", JSON.stringify(menuStates));
    }
  }, [menuStates]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("menuStates", JSON.stringify({}));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const scrollPositionKey = `sidebarScrollPosition`;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && typeof window !== "undefined") {
        const scrollTop = scrollContainerRef.current.scrollTop;
        sessionStorage.setItem(scrollPositionKey, scrollTop);
      }
    };
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [scrollPositionKey]);

  useEffect(() => {
    const restoreScrollPosition = () => {
      if (typeof window !== "undefined") {
        const savedPosition = sessionStorage.getItem(scrollPositionKey);
        if (savedPosition && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = parseInt(savedPosition, 10);
        }
      }
    };
    restoreScrollPosition();
  }, [pathname, scrollPositionKey]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuStates({});
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleMenu = (name) => (e) => {
    e.stopPropagation();
    setMenuStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (isMobile) setIsOpen(false);
  };

  const renderMenu = (menu) => (
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-md text-sm">
      <div
        className={`p-4 flex items-center cursor-pointer ${
          !isOpen ? "justify-center" : "justify-between"
        }`}
        onClick={toggleMenu(menu.name)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{menu.icon}</span>
          {isOpen && <span className="font-semibold">{menu.name}</span>}
        </div>
        {isOpen && (
          <svg
            className={`w-4 h-4 transition-transform ${
              menuStates[menu.name] ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
      {menuStates[menu.name] && (
        <div
          className="border-t border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {menu.items.map((item) => (
            <Link
              key={item.link || item.title}
              href={item.link}
              onClick={handleLinkClick}
              className={`flex items-center px-3 py-2 text-[13px] font-medium rounded-md text-black hover:bg-gradient-to-r from-blue-500 to-blue-600 hover:text-white ${
                !isOpen ? "justify-center" : ""
              }`}
            >
              {item.icon && <span className="text-sm">{item.icon}</span>}
              {isOpen && <span className="ml-2">{item.title}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`relative z-20 ${isMobile ? "fixed inset-y-0 left-0" : ""}`}
      >
        <aside
          ref={sidebarRef}
          className={`text-gray-900 transition-all duration-300 ease-in-out m-1 bg-white h-full ${
            isOpen ? "w-60" : "w-18"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Single Card containing logo + menus */}
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg h-full flex flex-col">
            {/* Logo + Toggle */}
            <div className="flex items-center p-4 border-b border-gray-200">
              {isOpen && (
                <Image
                  src="/margdalogo.png"
                  alt="Logo"
                  width={220}
                  height={32}
                  className="w-64 h-8 object-contain"
                  priority
                />
              )}
              <button
                className={`${
                  isOpen ? "ml-auto" : "mx-auto"
                } bg-white text-gray-900 p-2 rounded-full shadow hover:bg-gradient-to-r from-blue-500 to-blue-600 hover:text-white focus:outline-none transition-all duration-300`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Menu Items */}
            <div
              ref={scrollContainerRef}
              className="p-1 space-y-2 overflow-x-hidden overflow-y-auto flex-1"
            >
              {menus.map((menu) => (
                <React.Fragment key={menu.name}>
                  {renderMenu(menu)}
                </React.Fragment>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
