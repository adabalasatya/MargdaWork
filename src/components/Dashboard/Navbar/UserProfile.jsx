"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaQrcode,
  FaSignOutAlt,
  FaSpinner,
  FaCrown,
  FaChevronDown,
} from "react-icons/fa";

const UserProfile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  let mouseLeaveTimeout;

  // Memoize user data to prevent unnecessary computations
  useEffect(() => {
    // Only access sessionStorage on client side
    if (typeof window !== "undefined") {
      const storedUserData = sessionStorage.getItem("userData");
      if (!storedUserData) {
        router.push("/login");
      } else {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          if (!parsedUserData || !parsedUserData.userID) {
            router.push("/login");
          } else {
            setUserData(parsedUserData);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          router.push("/login");
        }
      }
    }
  }, [router]);

  // Memoized values for better performance
  const userName = useMemo(
    () => (userData ? userData.name : "User"),
    [userData]
  );
  
  const profilePicUrl = useMemo(
    () => (userData ? userData.pic : null),
    [userData]
  );
  
  const userInitial = useMemo(
    () => (userData && userData.name ? userData.name.charAt(0).toUpperCase() : "U"),
    [userData]
  );

  const toggleProfileMenu = useCallback(() => {
    setIsProfileMenuOpen((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(mouseLeaveTimeout);
    setIsProfileMenuOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseLeaveTimeout = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 200); // 200ms delay to prevent flickering
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userData");
      localStorage.removeItem("userData"); // Also remove from localStorage if exists
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
    // Use router.push instead of window.location.href for better Next.js navigation
    router.push("/login");
  }, [router]);

  // Don't render anything until we've checked for user data (prevents hydration issues)
  if (typeof window !== "undefined" && userData === null) {
    return null;
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={toggleProfileMenu}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 focus:outline-none cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {userInitial}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 cursor-pointer">
          {userName && userName.length > 10
            ? `${userName.slice(0, 10)}...`
            : userName}
        </span>
        <FaChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform cursor-pointer ${
            isProfileMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out cursor-pointer">
          <div className="p-2 space-y-1">
            {userData && (
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
                    {profilePicUrl ? (
                      <img
                        src={profilePicUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {userInitial}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {userName && userName.length > 15
                        ? `${userName.slice(0, 15)}...`
                        : userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userData.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Commented out links remain commented but converted to Next.js format */}
            {/* <Link
              href="/data-share"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                📤
              </span>
              <span>Data Share</span>
            </Link>
            <Link
              href="/authorisation"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                🔐
              </span>
              <span>Authorisation</span>
            </Link>
            <Link
              href="/knowledge-royalty"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FaCrown className="w-5 h-5 mr-2 text-yellow-500" />
              <span>Knowledge Royalty</span>
            </Link> */}
            
            <Link
              href="/update-profile"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                👤
              </span>
              <span>Profile</span>
            </Link>
            
            {/* <Link
              href="/credential"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                🔑
              </span>
              <span>Credential</span>
            </Link>
            <Link
              href="/email-auth"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                📧
              </span>
              <span>Email App Password</span>
            </Link> */}
            
            <Link
              href="/qr-scan"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FaQrcode className="w-5 h-5 mr-2 text-gray-700" />
              <span>WhatsApp Scan</span>
            </Link>
            
            <div className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer">
              <span className="w-5 h-5 mr-2 flex items-center justify-center">
                ⛓️‍💥
              </span>
              <span>Refer Code {userData?.user_data?.refercode}</span>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-100 rounded-lg transition-colors duration-300 disabled:opacity-75 cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <FaSpinner className="w-5 h-5 mr-2 text-red-600 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <FaSignOutAlt className="w-5 h-5 mr-2 text-red-600" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
