import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bgImage from "../assets/bg-biru.png";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form kosong
    if (!newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Form tidak lengkap",
        text: "Password baru dan konfirmasi harus diisi!",
      });
      return;
    }

    // Validasi password tidak cocok
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Password tidak cocok!",
      });
      return;
    }

    // Tampilkan loading
    Swal.fire({
      title: "Resetting Password...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Simulasi delay (ganti dengan API call jika ada backend)
    setTimeout(() => {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil direset!",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}