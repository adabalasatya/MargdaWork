"use client";

import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaDatabase,
  FaUserTie,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { Menu, X, Database, Users, ShoppingCart, UserCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // State to track if component has mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loginUserID, setLoginUserID] = useState(null);

  useEffect(() => {
    // Set mounted to true after first render
    setIsMounted(true);

    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          setLoginUserID(parsedData?.user_data?.userID || null);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
    router.push("/");
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Show loading skeleton until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative flex items-center justify-between px-6 py-2 bg-gradient-to-r from-white via-slate-50 to-white border border-gray-200/50 shadow-xl rounded-2xl backdrop-blur-sm m-2">
        {/* Mobile Menu Icon (Loading state) */}
        <div className="sm:hidden flex items-center">
          <div className="flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-100 to-slate-200 border border-gray-200 rounded-xl shadow-lg">
            <div className="w-5 h-5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-md mr-3 animate-pulse"></div>
            <span className="text-slate-600">Menu</span>
          </div>
        </div>

        {/* User Profile Icon (Loading state) */}
        <div className="sm:hidden flex items-center ml-auto">
          <div className="px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-300 to-purple-400 animate-pulse shadow-lg"></div>
          </div>
        </div>

        {/* Desktop version (Loading state) */}
        <div className="hidden sm:flex items-center w-full ml-6">
          <div className="flex justify-start w-full space-x-6 whitespace-nowrap">
            <div className="flex items-center px-6 py-2 text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-lg">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-md mr-3 animate-pulse"></div>
              <span className="text-slate-700">Contact List</span>
            </div>
          </div>

          {/* <div className="flex space-x-6 ml-auto mr-20 whitespace-nowrap">
            <div className="flex items-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl shadow-lg">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-300 to-pink-400 rounded-md mr-3 animate-pulse"></div>
              <span className="text-slate-700">Team-Support</span>
            </div>
          </div> */}

          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-300 to-purple-400 animate-pulse shadow-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between px-6 py-2 bg-gradient-to-r from-white via-slate-50 to-white border border-gray-200/50 shadow-md rounded-2xl backdrop-blur-sm m-2 transition-all duration-300 hover:shadow-3xl">
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 rounded-2xl opacity-50"></div>
      
      {/* Mobile Menu Icon (Visible only on mobile screens) */}
      <div className="sm:hidden flex items-center relative z-10">
        <button
          onClick={toggleMenu}
          className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-white to-slate-50 border border-gray-200/70 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:text-blue-700 transform hover:scale-105 transition-all duration-300 ease-out"
        >
          <div className="relative mr-3">
            {isMenuOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200 group-hover:rotate-180" />
            )}
          </div>
          <span className="tracking-wide">Menu</span>
          
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl"></div>
        </button>
      </div>

      {/* User Profile Icon (Visible only on mobile screens) */}
      <div className="sm:hidden flex items-center ml-auto relative z-10">
        <div className="px-3 py-2">
          <div className="transform hover:scale-110 transition-all duration-300">
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Visible only on mobile screens) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="sm:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="sm:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl z-50 mx-2 animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col space-y-3 p-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                Navigation
              </div>
              
              <Link
                href="/dashboard"
                className="group flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-600 hover:text-white transform hover:scale-[1.02] transition-all duration-300 ease-out"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                  <Database className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Contact List</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaChevronDown className="w-3 h-3 -rotate-90" />
                </div>
              </Link>

              {/* {loginUserID === 1 && (
                <Link 
                  href="/all-users"
                  className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-600 hover:text-white transform hover:scale-[1.02] transition-all duration-300 ease-out"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="tracking-wide">All Users</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaChevronDown className="w-3 h-3 -rotate-90" />
                  </div>
                </Link>
              )} */}
              
              {/* <Link 
                href="/work/mart"
                className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-teal-600 hover:text-white transform hover:scale-[1.02] transition-all duration-300 ease-out"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Mart</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaChevronDown className="w-3 h-3 -rotate-90" />
                </div>
              </Link> */}
              
              {/* <Link
                href="/team-support"
                className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-red-600 hover:text-white transform hover:scale-[1.02] transition-all duration-300 ease-out"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                  <Users className="w-4 h-4" />
                </div>
                <span className="tracking-wide">Team Support</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaChevronDown className="w-3 h-3 -rotate-90" />
                </div>
              </Link> */}
            </div>
          </div>
        </>
      )}

      {/* Desktop Navigation (Visible on larger screens) */}
      <div className="hidden sm:flex items-center w-full ml-6 relative z-10">
        {/* Left Navigation Items */}
        <div className="flex justify-start w-full space-x-6 whitespace-nowrap">
          <Link
            href="/dashboard"
            className="group flex items-center px-6 py-2 text-[14px] font-semibold text-slate-700 bg-gradient-to-r from-white to-white/50 border-2 border-gray-300 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-600 hover:text-white transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden"
          >
            <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
              <Database className="w-4 h-4" />
            </div>
            <span className="tracking-wide font-medium">Contact List</span>
            
            {/* Hover shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex space-x-6 ml-auto mr-20 whitespace-nowrap">
          {/* {loginUserID === 1 && (
            <Link
              href="/all-users"
              className="group flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-600 hover:text-white transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden"
            >
              <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="tracking-wide font-medium">All Users</span>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          )} */}
          
          {/* <Link
            href="/work/mart"
            className="group flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-teal-600 hover:text-white transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden"
          >
            <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="tracking-wide font-medium">Mart</span>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link> */}
          
          {/* <Link
            href="/team-support"
            className="group flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-500 hover:to-red-600 hover:text-white transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out relative overflow-hidden"
          >
            <div className="p-2 bg-white/70 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
              <Users className="w-4 h-4" />
            </div>
            <span className="tracking-wide font-medium">Team Support</span>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Link> */}
        </div>

        {/* Profile Section */}
        <div className="transform text-[12px] hover:scale-110 transition-all duration-300">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
