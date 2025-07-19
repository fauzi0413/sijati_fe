import React, { useState } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import Layout from "./Layout";

const initialUsers = [
  { username: "I_Admin", email: "admin@test.com", role: "Admin", created: "16/07/2025", lastLogin: "17/07/2025" },
  { username: "I_Editor", email: "editor@test.com", role: "Editor", created: "16/07/2025", lastLogin: "17/07/2025" },
  { username: "I_Viewer1", email: "viewer1@test.com", role: "Viewer", created: "16/07/2025", lastLogin: "17/07/2025" },
  { username: "I_Viewer2", email: "viewer2@test.com", role: "Viewer", created: "16/07/2025", lastLogin: "17/07/2025" },
];

export default function ManagementUser() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [modalData, setModalData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const openEditModal = (user) => {
    setModalData(user);
    setIsEdit(true);
  };

  const openCreateModal = () => {
    setModalData({ username: "", email: "", role: "", password: "" });
    setIsEdit(false);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleSave = () => {
    if (!modalData.username || !modalData.email || !modalData.role) {
      Swal.fire("Gagal", "Semua field harus diisi!", "error");
      return;
    }

    if (isEdit) {
      setUsers((prev) =>
        prev.map((u) => (u.username === modalData.username ? modalData : u))
      );
      Swal.fire("Tersimpan", "Data user berhasil diperbarui.", "success");
    } else {
      setUsers((prev) => [
        ...prev,
        {
          ...modalData,
          created: new Date().toLocaleDateString("en-GB"),
          lastLogin: new Date().toLocaleDateString("en-GB"),
        },
      ]);
      Swal.fire("Berhasil", "User baru berhasil ditambahkan.", "success");
    }
    closeModal();
  };

  const handleDelete = (username) => {
    Swal.fire({
      title: `Hapus user "${username}"?`,
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded mr-2",
        cancelButton:
          "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers(users.filter((u) => u.username !== username));
        Swal.fire("Terhapus!", "User berhasil dihapus.", "success");
      }
    });
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

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
          <table className="min-w-[800px] w-full bg-white text-sm text-left">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 whitespace-nowrap">{user.username}</td>
                  <td className="py-2 px-4 truncate max-w-[200px]">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{user.created}</td>
                  <td className="py-2 px-4">{user.lastLogin}</td>
                  <td className="py-2 px-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-blue-500 hover:bg-blue-600 p-1 rounded text-white"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.username)}
                      className="bg-red-500 hover:bg-red-600 p-1 rounded text-white"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
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
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
                onClick={closeModal}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {isEdit ? "Edit User" : "Create User"}
              </h2>
              <div className="space-y-4">
                {[
                  ["username", "text"],
                  ["email", "email"],
                  ["role", "text"],
                  ["password", "password"],
                ].map(([field, type]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium capitalize">
                      {field}
                    </label>
                    <input
                      type={type}
                      value={modalData[field] || ""}
                      onChange={(e) =>
                        setModalData({ ...modalData, [field]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-6 flex-wrap">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
