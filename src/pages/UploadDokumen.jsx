import Layout from "../components/Layout";
import React, { useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { Listbox } from '@headlessui/react';

const categories = ["Laporan", "Data", "Slides", "Gambar"];

export default function UploadDokumen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");

  const dummyHistory = [
    { name: "file_update.pdf", category: "Laporan", date: "13 Jul 2025", status: "Parsing" },
    { name: "dataset.xisx", category: "Data", date: "13 Jul 2025", status: "Indexed" },
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
        icon: 'warning',
        title: 'Lengkapi semua field!',
        text: 'Mohon isi kategori, judul, dan file sebelum upload.',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Upload Berhasil!',
      html: `<p><strong>File:</strong> ${selectedFile.name}</p><p><strong>Kategori:</strong> ${category}</p><p><strong>Judul:</strong> ${title}</p>`,
      confirmButtonColor: '#3B82F6',
    });
  };

  return (
    <Layout>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Upload Dokumen</h1>

        {/* Area Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("fileInput").click()}
          className="w-full p-8 border-2 border-dashed border-gray-300 bg-white rounded-lg text-center text-gray-500 mb-6 cursor-pointer"
        >
          <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          {selectedFile ? (
            <p>{selectedFile.name}</p>
          ) : (
            <p>Drag dan drop file ke sini, atau klik untuk upload</p>
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

        {/* Form input */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <Listbox value={category} onChange={setCategory}>
              <div className="relative">
                <Listbox.Button className="border border-gray-300 bg-white w-full px-4 py-2 rounded text-left">
                  {category || "Pilih Kategori"}
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md">
                  {categories.map((cat, idx) => (
                    <Listbox.Option
                      key={idx}
                      value={cat}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? 'bg-[#F4418D] text-white' : 'text-gray-900'}`
                      }
                    >
                      {cat}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          <input
            type="text"
            placeholder="Masukkan judul dokumen"
            className="border border-gray-300 rounded px-3 py-2 w-full flex-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            onClick={handleUploadClick}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </div>

        {/* Tabel Riwayat Dokumen */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Riwayat Dokumen</h2>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="py-2 px-3">Nama File</th>
                <th className="py-2 px-3">Kategori</th>
                <th className="py-2 px-3">Tanggal Upload</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyHistory.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="py-2 px-3">
                    <Link
                      to={`/dokumen/${item.name}`}
                      className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:underline transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v4.125A2.625 2.625 0 0116.875 21H7.125A2.625 2.625 0 014.5 18.375V5.625A2.625 2.625 0 017.125 3h5.377a2.625 2.625 0 011.855.77l4.373 4.373a2.625 2.625 0 01.77 1.855z"
                        />
                      </svg>
                      <span>{item.name}</span>
                    </Link>
                  </td>
                  <td className="py-2 px-3">{item.category}</td>
                  <td className="py-2 px-3">{item.date}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${item.status === "Indexed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Parsing"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-red-100 text-red-700"}
                      `}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}
