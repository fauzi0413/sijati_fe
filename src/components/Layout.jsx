import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import Swal from "sweetalert2";


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
    Swal.fire({
      title: "Yakin ingin logout?",
      text: "Kamu akan keluar dari sesi saat ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");

        let countdown = 30;
        let countdownInterval;

        Swal.fire({
          icon: "success",
          title: "Berhasil logout",
          html: `Anda telah keluar dari sesi saat ini.<br><strong>Tertutup dalam <span id="timer">${countdown}</span> detik</strong>`,
          showConfirmButton: true,
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded",
            popup: "rounded-lg shadow-lg",
            title: "text-xl",
            htmlContainer: "text-sm text-gray-700 text-center",
          },
          buttonsStyling: false,
          didOpen: () => {
            const btn = Swal.getConfirmButton();
            if (btn) btn.focus();

            const timerEl = document.getElementById("timer");

            countdownInterval = setInterval(() => {
              countdown--;
              if (timerEl) timerEl.textContent = countdown;

              if (countdown <= 0) {
                clearInterval(countdownInterval);
                Swal.close();
                window.location.href = "/chatbot";
              }
            }, 1000);
          },
          willClose: () => {
            clearInterval(countdownInterval); // pastikan interval dibersihkan jika user klik OK lebih awal
          },
        }).then(() => {
          window.location.href = "/chatbot"; // jika user klik OK
        });

        // atau auto redirect setelah 30 detik
        setTimeout(() => {
          window.location.href = "/chatbot";
        }, 30000);
      }
    });
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

  
  const handleResetPasswordLink = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.email) {
      return Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Email pengguna tidak tersedia. Pastikan Anda sudah login.",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded",
        },
      });
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      Swal.fire({
        icon: "success",
        title: "Email terkirim",
        text: `Link reset password telah dikirim ke ${user.email}.`,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
        },
      });
    } catch (err) {
      console.error(err);
      let message = "Terjadi kesalahan.";
      if (err.code === "auth/user-not-found") {
        message = "Email tidak ditemukan.";
      } else if (err.code === "auth/invalid-email") {
        message = "Format email tidak valid.";
      }

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded",
        },
      });
    }
  };

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
                        user?.displayName || user?.username || "User"
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
                            user?.displayName || user?.username || "User"
                          )}&background=random&rounded=true`;
                        }}
                      />
                      <span className="font-semibold">
                        {user?.displayName || user?.username || "User"}
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
                          value={user?.displayName || user?.username || ""}
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
                        <button
                          onClick={handleResetPasswordLink}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Reset Password?
                        </button>
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