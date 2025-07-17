import React, { useState } from "react";
import Layout from "../components/Layout";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Listbox } from "@headlessui/react";

const categories = ["Laporan", "Data", "Slides", "Gambar"];

export default function UploadDokumen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");

  const dummyHistory = [
    { name: "file_update.pdf", category: "Laporan", date: "13 Jul 2025", status: "Parsing" },
    { name: "dataset.xlsx", category: "Data", date: "13 Jul 2025", status: "Indexed" },
    { name: "presentation.pptx", category: "Slides", date: "13 Jul 2025", status: "Error" },
    { name: "photo.jpg", category: "Gambar", date: "13 Jul 2025", status: "Indexed" },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleUploadClick = () => {
    if (!selectedFile || !category || !title) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi semua field!",
        text: "Mohon isi kategori, judul, dan file sebelum upload.",
        confirmButtonColor: "#3B82F6",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Upload Berhasil!",
      html: `<p><strong>File:</strong> ${selectedFile.name}</p><p><strong>Kategori:</strong> ${category}</p><p><strong>Judul:</strong> ${title}</p>`,
      confirmButtonColor: "#3B82F6",
    });
  };

  return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-1">Upload Dokumen</h1>

          {/* Area Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput").click()}
            className="w-full p-4 sm:p-6 md:p-8 border-2 border-dashed border-gray-300 bg-white rounded-lg text-center text-gray-500 mb-4 sm:mb-6 cursor-pointer mx-auto"
          >
            <ArrowUpTrayIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
            {selectedFile ? (
              <p className="text-sm sm:text-base break-words px-2">{selectedFile.name}</p>
            ) : (
              <p className="text-sm sm:text-base px-2">Drag dan drop file ke sini, atau klik untuk upload</p>
            )}
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Form Input - Mobile First Design */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            {/* Dropdown Kategori */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                Kategori
              </label>
              <Listbox value={category} onChange={setCategory}>
                <div className="relative">
                  <Listbox.Button className="border border-gray-300 bg-white w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {category || "Pilih Kategori"}
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg text-sm max-h-60 overflow-auto">
                    {categories.map((cat, idx) => (
                      <Listbox.Option
                        key={idx}
                        value={cat}
                        className={({ active }) =>
                          `cursor-pointer px-3 sm:px-4 py-2 ${
                            active ? "bg-[#F4418D] text-white" : "text-gray-900 hover:bg-gray-100"
                          }`
                        }
                      >
                        {cat}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* Input Judul */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">
                Judul Dokumen
              </label>
              <input
                type="text"
                placeholder="Masukkan judul dokumen"
                className="border border-gray-300 rounded px-3 sm:px-4 py-2 sm:py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tombol Upload */}
            <button
              onClick={handleUploadClick}
              className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded hover:bg-blue-600 active:bg-blue-700 text-sm w-full font-medium transition-colors duration-200"
            >
              Upload Dokumen
            </button>
          </div>

          {/* Tabel Riwayat Dokumen - Mobile Responsive */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Riwayat Dokumen</h2>
            </div>
            
            {/* Mobile View - Card Layout */}
            <div className="block sm:hidden">
              {dummyHistory.map((item, i) => (
                <div key={i} className="border-b last:border-b-0 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      to={`/dokumen/${item.name}`}
                      className="flex items-center gap-2 text-gray-800 hover:text-blue-600 transition flex-1 min-w-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-blue-500 flex-shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v4.125A2.625 2.625 0 0116.875 21H7.125A2.625 2.625 0 014.5 18.375V5.625A2.625 2.625 0 017.125 3h5.377a2.625 2.625 0 011.855.77l4.373 4.373a2.625 2.625 0 01.77 1.855z"
                        />
                      </svg>
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    </Link>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${
                        item.status === "Indexed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Parsing"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="py-3 px-4 font-medium whitespace-nowrap">Nama File</th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">Kategori</th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">Tanggal Upload</th>
                    <th className="py-3 px-4 font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyHistory.map((item, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4 max-w-0">
                        <Link
                          to={`/dokumen/${item.name}`}
                          className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:underline transition min-w-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-blue-500 flex-shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v4.125A2.625 2.625 0 0116.875 21H7.125A2.625 2.625 0 014.5 18.375V5.625A2.625 2.625 0 017.125 3h5.377a2.625 2.625 0 011.855.77l4.373 4.373a2.625 2.625 0 01.77 1.855z"
                            />
                          </svg>
                          <span className="truncate">{item.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "Indexed"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Parsing"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}