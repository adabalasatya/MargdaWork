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

  // Initialize user data and listen for updates
  useEffect(() => {
    // Only access sessionStorage on client side
    if (typeof window === "undefined") return;

    const loadUserData = () => {
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
    };

    // Initial load
    loadUserData();

    // Listen for custom event dispatched by MyProfile
    const handleStorageUpdate = () => {
      loadUserData();
    };

    window.addEventListener("userDataUpdated", handleStorageUpdate);

    // Optional: Polling mechanism as fallback (every 5 seconds)
    const interval = setInterval(() => {
      loadUserData();
    }, 5000);

    // Cleanup
    return () => {
      window.removeEventListener("userDataUpdated", handleStorageUpdate);
      clearInterval(interval);
      clearTimeout(mouseLeaveTimeout);
    };
  }, [router]);

  // Memoized values for better performance
  const userName = useMemo(() => (userData ? userData.name : "User"), [userData]);
  const profilePicUrl = useMemo(() => (userData ? userData.pic : null), [userData]);
  const userInitial = useMemo(
    () => (userData && userData.name ? userData.name.charAt(0).toUpperCase() : "U"),
    [userData]
  );
  const userEmail = useMemo(() => (userData ? userData.email : ""), [userData]);

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
    }, 200);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userData");
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
    router.push("/login");
  }, [router]);

  // Don't render until user data is checked
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
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 focus:outline-none cursor-pointer max-w-xs"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">{userInitial}</span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm font-medium text-gray-700 truncate">
          <span title={userName}>
            {userName && userName.length > 8 ? `${userName.slice(0, 8)}...` : userName}
          </span>
        </div>
        <FaChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform cursor-pointer ${
            isProfileMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isProfileMenuOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out cursor-pointer w-48">
          <div className="p-2 space-y-1">
            {userData && (
              <div className="px-1 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-22 h-8 rounded-full overflow-hidden border-2 border-orange-500 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500">
                    {profilePicUrl ? (
                      <img
                        src={profilePicUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">{userInitial}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700" title={userName}>
                      {userName && userName.length > 15 ? `${userName.slice(0, 15)}...` : userName}
                    </p>
                    <p className="text-xs text-gray-500" title={userEmail}>
                      {userEmail && userEmail.length > 20 ? `${userEmail.slice(0, 20)}...` : userEmail}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Link
              href="/update-profile"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center">👤</span>
              <span>Profile</span>
            </Link>
            <Link
              href="/qr-scan"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-300 cursor-pointer"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <FaQrcode className="w-5 h-5 mr-2 text-gray-700" />
              <span>WhatsApp Scan</span>
            </Link>
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