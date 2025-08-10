import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import { AiFillStar } from "react-icons/ai";
import { FaRegStar } from "react-icons/fa";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { getUserByID, postFeedback } from "../api/axios";
import Swal from "sweetalert2";
import LogoSiJati from "../assets/jati-logo-polos.png";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const profileRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.uid || user?.user_id) {
      const id = user.uid || user.user_id;
      getUserByID(id, (data) => {
        setUserData(data);
      });
    }
  }, [user]);

  // Ekspor fungsi supaya bisa dipanggil dari Sidebar
  useEffect(() => {
    window.openFeedbackPopup = () => setShowFeedback(true);
  }, []);

  const getProfileImage = () => {
    if (user?.photoURL?.startsWith("https")) return user.photoURL;
    const name = user?.displayName || user?.username || "Not Found!";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&rounded=true`;
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
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2",
        cancelButton:
          "bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");

        let countdown = 10;
        let countdownInterval;

        Swal.fire({
          icon: "success",
          title: "Berhasil logout",
          html: `Anda telah keluar dari sesi saat ini.<br><strong>Tertutup dalam <span id="timer">${countdown}</span> detik</strong>`,
          showConfirmButton: true,
          confirmButtonText: "OK",
          customClass: {
            confirmButton:
              "bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded",
            popup: "rounded-lg shadow-lg",
            title: "text-xl",
            htmlContainer: "text-sm text-gray-700 text-center",
          },
          buttonsStyling: false,
          didOpen: () => {
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
            clearInterval(countdownInterval);
          },
        }).then(() => {
          window.location.href = "/chatbot";
        });

        setTimeout(() => {
          window.location.href = "/chatbot";
        }, 30000);
      }
    });
  };

  const handleResetPasswordLink = async () => {
    if (!user || !user.email) {
      return Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Email pengguna tidak tersedia. Pastikan Anda sudah login.",
      });
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      Swal.fire({
        icon: "success",
        title: "Email terkirim",
        text: `Link reset password telah dikirim ke ${user.email}.`,
        customClass: {
          confirmButton:
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded",
          popup: "rounded-lg shadow-lg",
          title: "text-lg",
          htmlContainer: "text-sm text-gray-700 text-center",
        },
        buttonsStyling: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan.",
        customClass: {
          confirmButton:
            "bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded",
          popup: "rounded-lg shadow-md",
          title: "text-lg",
          htmlContainer: "text-sm text-gray-700 text-center",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleFeedbackSubmit = () => {
    if (rating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Rating kosong",
        text: "Silakan pilih bintang sebelum mengirim feedback.",
        customClass: {
          confirmButton:
            "bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded",
          popup: "rounded-lg shadow-md",
          title: "text-lg",
          htmlContainer: "text-sm text-gray-700 text-center",
        },
        buttonsStyling: false,
      });
      return;
    }

    const payload = {
      user_id: user?.uid || user?.user_id || "guest",
      rating,
      comment,
    };

    postFeedback(payload, () => {
      Swal.fire({
        icon: "success",
        title: "Terima kasih!",
        text: "Feedback Anda berhasil dikirim.",
        customClass: {
          confirmButton:
            "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded",
          popup: "rounded-lg shadow-md",
          title: "text-lg",
          htmlContainer: "text-sm text-gray-700 text-center",
        },
        buttonsStyling: false,
      });
      setShowFeedback(false);
      setRating(0);
      setComment("");
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col sm:ml-64">
        <header className="fixed top-0 left-0 sm:left-64 right-0 h-16 px-4 sm:px-6 bg-[#f5f6fa] border-b flex items-center justify-between sm:justify-end z-40">
          <button
            className="sm:hidden text-2xl text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="relative" ref={profileRef}>
            {user ? (
              <>
                {/* Menu User */}
                <div
                  className="flex items-center space-x-2"
                  onClick={() => {
                    setShowSettings(false);
                    setShowMenu((prev) => !prev);
                  }}
                >
                  <span className="hidden sm:block text-sm text-gray-700">
                    Welcome, {userData?.username?.toUpperCase()}
                  </span>
                  <img
                    src={getProfileImage()}
                    onError={(e) => {
                      const name =
                        user?.displayName || user?.username || "User";
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        name
                      )}&background=random&rounded=true`;
                    }}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                  />
                </div>

                {/* Dropdown Menu */}
                {showMenu && !showSettings && (
                  <div className="absolute top-16 right-6 bg-white shadow-lg rounded-xl py-3 px-2 space-y-1 z-50 w-44">
                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 text-sm group w-full px-3 py-2 rounded-md hover:bg-blue-100"
                    >
                      <FiSettings className="text-lg text-black group-hover:text-blue-500" />
                      <span className="group-hover:text-blue-700">Setting</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedback(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 text-sm group w-full px-3 py-2 rounded-md hover:bg-yellow-100"
                    >
                      <FaRegStar className="text-lg text-black group-hover:text-yellow-500" />
                      <span className="group-hover:text-yellow-700">
                        Feedback
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-sm group w-full px-3 py-2 rounded-md hover:bg-red-100"
                    >
                      <FiLogOut className="text-lg text-red-500 group-hover:text-red-600" />
                      <span className="text-red-500 group-hover:text-red-700">
                        Logout
                      </span>
                    </button>
                  </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                  <div className="absolute top-16 right-0 w-80 bg-white shadow-2xl rounded-xl p-5 z-50">
                    <div className="flex flex-col items-center mb-4">
                      <div
                        className="flex self-start text-xl space-x-2 cursor-pointer"
                        onClick={() => {
                          setShowSettings(false);
                          setShowMenu(true);
                        }}
                      >
                        <IoMdArrowBack className="text-2xl text-gray-700 hover:text-black" />
                        <span className="text-base text-gray-700 hover:text-black">
                          Back
                        </span>
                      </div>
                      <img
                        src={getProfileImage()}
                        onError={(e) => {
                          const name =
                            user?.displayName || user?.username || "User";
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name
                          )}&background=random&rounded=true`;
                        }}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border cursor-pointer"
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
                          value={userData?.username || ""}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <input
                          className="w-full border px-3 py-1 rounded text-sm"
                          value={userData?.email || ""}
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
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm text-blue-600 hover:underline">
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

        {/* Feedback Modal (bisa untuk login & guest) */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
              >
                ✕
              </button>
              <div className="flex flex-col items-center">
                <img src={LogoSiJati} alt="SI JATI" className="w-30 mb-3" />
                <h2 className="text-xl font-bold mb-2">Give us a feedback!</h2>
                <p className="text-gray-500 text-sm text-center mb-4">
                  Your input is important for us. We take customer feedback
                  very seriously.
                </p>
                <div className="flex space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <AiFillStar
                      key={star}
                      size={28}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`cursor-pointer ${
                        (hoverRating || rating) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm mb-4"
                  rows="3"
                ></textarea>
                <button
                  onClick={handleFeedbackSubmit}
                  className="bg-pink-500 hover:bg-pink-600 text-white w-full py-2 rounded-lg font-semibold"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="pt-16 px-4 sm:px-6 pb-20 flex-1 overflow-y-auto bg-[#f5f6fa]">
          {children}
        </main>
      </div>
    </div>
  );
}