import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import Layout from "../components/Layout";
import { PencilIcon } from "@heroicons/react/24/outline";
import { deleteUserById, getUser, postUser, putUser } from "../api/axios";
import { HiEye, HiEyeOff } from "react-icons/hi";
import bcrypt from "bcryptjs";

export default function ManagementUser() {
  const [search, setSearch] = useState("");
  const [modalData, setModalData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUser(setUsers);
  }, []);

  const openEditModal = (user) => {
    setModalData(user);
    setIsEdit(true);
  };

  const openCreateModal = () => {
    setModalData({ username: "", email: "", role: "", password: "", last_login: null });
    setIsEdit(false);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleSave = () => {
    if (!modalData.username || !modalData.email || !modalData.role || (!isEdit && (!modalData.password || !modalData.confirmPassword))) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Semua field wajib diisi!",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded mt-2",
        },
      });
      return;
    }

    if (!isEdit && modalData.password !== modalData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Tidak Cocok",
        text: "Password dan Konfirmasi Password harus sama.",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded mt-2",
        },
      });
      return;
    }

    if (isEdit) {
      putUser(modalData.user_id, modalData, () => {
        getUser(setUsers);
        closeModal();
        Swal.fire({
          icon: "success",
          title: "Tersimpan",
          text: "Data user berhasil diperbarui.",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded mt-2",
          },
        });
      });
    } else {
      const hashedPassword = bcrypt.hashSync(modalData.password, 10); // 10 adalah salt rounds
        const payload = {
          ...modalData,
          password: hashedPassword,
          confirmPassword: undefined, // remove from payload
          last_login: null,
        };

        postUser(payload, () => {
        getUser(setUsers);
        closeModal();
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "User baru berhasil ditambahkan.",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded mt-2",
          },
        });
      });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: `Hapus user ini?`,
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded mr-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserById(id, () => {
          getUser(setUsers);
          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "User berhasil dihapus.",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded mt-2",
            },
          });
        });
      }
    });
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );
  
  const getRoleBadgeStyle = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const showUserDetail = (user) => {
    Swal.fire({
      title: `<strong>Detail User</strong>`,
      html: `
        <div class="text-left text-sm leading-relaxed space-y-2">
          <p><strong>User ID:</strong> ${user.user_id}</p>
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Created At:</strong> ${user.created_at || '-'}</p>
          <p><strong>Last Login:</strong> ${user.last_login || '-'}</p>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: "Tutup",
      customClass: {
        popup: "rounded-xl px-6 pt-6 pb-4 max-w-sm",
        title: "text-lg font-bold",
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded mt-4",
      },
    });
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Management User</h1>

        {/* Search & Create */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-2">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search User"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md text-sm w-full sm:w-auto"
          >
            <UserPlusIcon className="w-5 h-5" />
            Create User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full bg-white text-sm text-left">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="hidden sm:table-cell py-3 px-4">User ID</th>
                <th className="hidden sm:table-cell py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="hidden sm:table-cell py-3 px-4">Created</th>
                <th className="hidden sm:table-cell py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{idx + 1}.</td>
                  <td className="hidden sm:table-cell py-2 px-4">{user.user_id.slice(0, 6)}...</td>
                  <td className="hidden sm:table-cell py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4">
                    <span className="hidden sm:block">{user.email}</span>

                    {/* Mobile: klik akan munculkan detail */}
                    <div className="block sm:hidden">
                      <button
                        onClick={() => showUserDetail(user)}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        {user.email}
                      </button>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeStyle(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Created (hanya desktop) */}
                  <td className="hidden sm:table-cell py-2 px-4">{new Date(user.created_at).toLocaleString()}</td>

                  {/* Last Login (hanya desktop) */}
                  <td className="hidden sm:table-cell py-2 px-4">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : "-"}
                  </td>

                  {/* Aksi */}
                  <td className="py-2 px-4">
                    <div className="flex gap-3">
                      <PencilIcon
                        className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                        onClick={() => openEditModal(user)}
                      />
                      <TrashIcon
                        className="w-4 h-4 text-gray-700 cursor-pointer hover:text-red-500"
                        onClick={() => handleDelete(user.user_id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {modalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md sm:max-w-lg relative shadow-lg">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                onClick={closeModal}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Title */}
              <h2 className="text-xl font-bold mb-4">
                {isEdit ? "Edit User" : "Create User"}
              </h2>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium capitalize mb-2">Username</label>
                  <input
                    type="text"
                    value={modalData.username || ""}
                    onChange={(e) => setModalData({ ...modalData, username: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="ex: johndoe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium capitalize mb-2">Email</label>
                  <input
                    type="email"
                    value={modalData.email || ""}
                    onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                    className={`w-full border rounded px-3 py-2 text-sm ${
                      isEdit ? "bg-gray-200" : "bg-white"
                    }`}
                    disabled={isEdit}
                    placeholder="ex: johndoe@gmail.com"
                  />
                </div>

                {/* Password */}
                {!isEdit && (
                  <>
                    <div className="relative">
                      <label className="block text-sm font-medium capitalize mb-2">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={modalData.password || ""}
                        onChange={(e) => setModalData({ ...modalData, password: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm pr-10"
                        placeholder="Masukkan password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                      </button>
                    </div>

                    <div className="relative mt-4">
                      <label className="block text-sm font-medium capitalize mb-2">Konfirmasi Password</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={modalData.confirmPassword || ""}
                        onChange={(e) => setModalData({ ...modalData, confirmPassword: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm pr-10"
                        placeholder="Ulangi password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                      </button>
                    </div>
                  </>
                )}

                {/* Role (Dropdown) */}
                <div>
                  <label className="block text-sm font-medium capitalize mb-2">Role</label>
                  <select
                    value={modalData.role || ""}
                    onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                  >
                    <option value="" disabled>
                      -- Pilih Role --
                    </option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 mt-6 flex-wrap">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
