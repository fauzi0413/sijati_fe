import React, { useState } from "react";
import Layout from "../components/Layout";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Listbox } from "@headlessui/react";
import { getDocument, postDocument, putDocument, deleteDocumentById } from "../api/axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon } from "lucide-react";

export default function UploadDokumen() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState(""); // kategori dokumen
  const [selectedFile, setSelectedFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [user_id] = useState(user.uid)
  const [docList, setDocList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const categories = ["Laporan", "Data", "Slides", "Gambar"];

  useEffect(() => {
    getDocument((data) => {
      // Urutkan dari terbaru ke terlama (descending)
      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setDocList(sorted);
    });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!selectedFile || !type || !title) {
      Swal.fire({
        icon: "warning",
        title: "Field tidak boleh kosong",
        text: "Lengkapi kategori, judul, dan file sebelum upload",
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        }
      });
      return;
    }

    // 👇 Tambahkan validasi ukuran file di sini
    if (selectedFile.size > 100 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Ukuran file terlalu besar",
        text: "Maksimal ukuran file adalah 100MB",
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        }
      });
      return;
    }

    // ✅ Tampilkan loading saat file dibaca & upload dimulai
    Swal.fire({
      title: "Sedang mengunggah...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64File = reader.result.split(",")[1];

      const payload = {
        title,
        type,
        user_id,
        file_name: selectedFile.name,
        file_base64: base64File,
      };
      
      if (editIndex !== null) {
        const id = docList[editIndex]?.doc_id;
        putDocument(id, payload, () => {
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Dokumen diperbarui",
            text: "Data berhasil diupdate",
            customClass: {
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
            }
          });
          setEditIndex(null);
          resetForm();
          getDocument((data) => setDocList(data));
        });
      } else {
        postDocument(payload, () => {
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Dokument Berhasil di Upload!",
            customClass: {
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
            }
          });
          resetForm();
          getDocument((data) => setDocList(data));
        });
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  const resetForm = () => {
    setTitle("");
    setType("");
    setSelectedFile(null);
  };

  const handleEdit = (index) => {
    const doc = docList[index];
    setTitle(doc.title);
    setType(doc.type);
    setEditIndex(index);

    Swal.fire({
      icon: "info",
      title: "Edit Dokumen",
      text: "Silakan unggah file baru jika ingin mengganti file.",
      customClass: {
        confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
      }
    });
  };

  const handleDelete = (index) => {
    const id = docList[index]?.doc_id;
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 me-3',
        cancelButton: 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDocumentById(id, () => {
          Swal.fire({
            icon: "success",
            title: "Berhasil dihapus",
            text: "Dokumen berhasil dihapus",
            customClass: {
              confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
            }
          }).then(() => {
            getDocument((data) => setDocList(data));
          });
        });
      }
    });
  };

    return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-1">Upload Dokumen</h1>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput").click()}
            className="w-full p-4 sm:p-6 border-2 border-dashed border-gray-300 bg-white rounded-lg text-center text-gray-500 mb-4 cursor-pointer"
          >
            <ArrowUpTrayIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            {selectedFile ? (
              <p className="text-sm break-words px-2">{selectedFile.name}</p>
            ) : (
              <p className="text-sm px-2">Drag dan drop file ke sini, atau klik untuk upload</p>
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

          <div className="flex flex-col gap-3 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <Listbox value={type} onChange={setType}>
                <div className="relative">
                  <Listbox.Button className="border border-gray-300 bg-white w-full px-3 py-2 rounded text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {type || "Pilih Kategori"}
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg text-sm max-h-60 overflow-auto">
                    {categories.map((cat, idx) => (
                      <Listbox.Option
                        key={idx}
                        value={cat}
                        className={({ active }) =>
                          `cursor-pointer px-3 py-2 ${
                            active ? "bg-blue-600 text-white" : "text-gray-900 hover:bg-gray-100"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Dokumen
              </label>
              <input
                type="text"
                placeholder="Masukkan judul dokumen"
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm font-medium"
            >
              {editIndex !== null ? "Perbarui Dokumen" : "Upload Dokumen"}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">Riwayat Dokumen</h2>
            </div>
            
            {/* Mobile View - Card Layout */}
            <div className="block sm:hidden">
              {docList.map((item, i) => (
                <div key={i} className="border-b last:border-b-0 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      to={`/dokumen/${item.doc_id}`}
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
                      <span className="text-sm font-medium truncate">{item.title}</span>
                    </Link>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.chunks && item.embedding
                          ? "bg-green-100 text-green-700"
                          : (!item.chunks || !item.embedding)
                          ? "bg-gray-200 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.chunks && item.embedding
                        ? "Indexed"
                        : (!item.chunks || !item.embedding)
                        ? "Parsing"
                        : "Error"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.type}</span>
                    <span>
                      {new Date(item.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Nama File</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Tanggal Upload</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {docList.map((item, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4 w-[1%] whitespace-nowrap text-center">{i + 1}.</td>
                      <td className="py-3 px-4 max-w-0">
                        <Link
                          to={`/dokumen/${item.doc_id}`}
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
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">{item.type}</td>
                      <td className="py-3 px-4">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.chunks && item.embedding
                              ? "bg-green-100 text-green-700"
                              : (!item.chunks || !item.embedding)
                              ? "bg-gray-200 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.chunks && item.embedding
                            ? "Indexed"
                            : (!item.chunks || !item.embedding)
                            ? "Parsing"
                            : "Error"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <PencilIcon
                          className="w-4 h-4 text-gray-700 cursor-pointer hover:text-blue-500"
                          onClick={() => handleEdit(i)}
                        />
                        <TrashIcon
                          className="w-4 h-4 text-gray-700 cursor-pointer hover:text-red-500"
                          onClick={() => handleDelete(i)}
                        />
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