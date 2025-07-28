import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg-biru.png";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      return Swal.fire({
        icon: "warning",
        title: "Email dibutuhkan",
        text: "Silakan masukkan email Anda terlebih dahulu.",
        customClass: {
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
        },
      });
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        icon: "success",
        title: "Email terkirim",
        text: "Silakan cek email Anda untuk mereset password.",
        customClass: {
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
        },
      }).then(() => {
        navigate("/login");
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
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-full"
          >
            Kirim Link Reset
          </button>
        </form>
      </div>
    </div>
  );
}
