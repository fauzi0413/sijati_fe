import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileRef = useRef(null);

  const getProfileImage = () => {
    return user?.photoURL?.startsWith("http")
      ? user.photoURL
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.displayName || user?.username
        )}&background=random&rounded=true`;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/dashboard";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col sm:ml-64">
        {/* Header */}
        <header
          className="fixed top-0 left-0 sm:left-64 right-0 h-16 px-4 sm:px-6 bg-[#f5f6fa] border-b flex items-center justify-between sm:justify-end z-40"
          ref={profileRef}
        >
          {/* Hamburger menu */}
          <button
            className="sm:hidden text-2xl text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="relative">
            {user ? (
              <>
                {/* Profile & Welcome */}
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:block text-sm text-gray-700">
                    Welcome, {user?.displayName?.toUpperCase() || user?.username?.toUpperCase()}
                  </span>
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                    onClick={() => {
                      setShowMenu(!showMenu);
                      setShowSettings(false);
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.displayName || "User"
                      )}&background=random&rounded=true`;
                    }}
                  />
                </div>

                {/* Dropdown */}
                {showMenu && !showSettings && (
                  <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl py-3 px-5 space-y-3 z-50 w-44">
                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 hover:opacity-80 text-sm"
                    >
                      <FiSettings className="text-lg" />
                      <span>Setting</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm text-red-500 hover:opacity-80"
                    >
                      <FiLogOut className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}

                {/* Settings Modal */}
                {showSettings && (
                  <div className="absolute top-16 right-0 w-80 bg-white shadow-2xl rounded-xl p-5 z-50">
                    <div className="flex flex-col items-center mb-4">
                      <div className="flex self-start text-xl space-x-2 cursor-pointer" onClick={() => {
                        setShowSettings(false);
                        setShowMenu(true);
                      }}>
                        <IoMdArrowBack className="text-2xl text-gray-700 hover:text-black" />
                        <span className="text-base text-gray-700 hover:text-black">Back</span>
                      </div>
                      <img
                        src={getProfileImage()}
                        alt="Profile"
                        className="w-14 h-14 rounded-full my-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.displayName || "User"
                          )}&background=random&rounded=true`;
                        }}
                      />
                      <span className="font-semibold">
                        {user?.displayName || "User"}
                      </span>
                    </div>

                    <div className="text-gray-500 font-semibold text-sm mb-2">
                      Settings
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Username</label>
                        <input
                          className="w-full border px-3 py-1 rounded text-sm"
                          value={user?.displayName || ""}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <input
                          className="w-full border px-3 py-1 rounded text-sm"
                          value={user?.email || ""}
                          readOnly
                        />
                      </div>
                      <div className="text-right mt-2">
                        <Link
                          to="/reset-password"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Reset Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Guest mode
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="pt-16 px-4 sm:px-6 pb-20 flex-1 overflow-y-auto bg-[#f5f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}