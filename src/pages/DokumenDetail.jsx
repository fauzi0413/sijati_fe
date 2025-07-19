import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link, useParams } from "react-router-dom";
import { getDocumentByID } from "../api/axios";

const baseURLBackEnd = process.env.REACT_APP_BASE_URL_BACKEND;

export default function DokumenDetail() {
  const { id } = useParams();
  const [dokumen, setDokumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chunks, setChunks] = useState([]);
  const getFileExtension = (filename) => {
    return filename?.split(".").pop()?.toLowerCase();
  };


  useEffect(() => {
    getDocumentByID(id, (data) => {
      setDokumen(data);

      // Cek apakah chunks adalah array
      if (Array.isArray(data.chunks)) {
        setChunks(data.chunks);
      } else if (typeof data.chunks === "string") {
        // Pisahkan string berdasarkan baris jika perlu
        const lines = data.chunks
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((text, i) => ({ id: i + 1, text }));
        setChunks(lines);
      } else {
        setChunks([]);
      }

      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <main className="p-6 text-center text-gray-600">Loading document...</main>
      </Layout>
    );
  }

  if (!dokumen) {
    return (
      <Layout>
        <main className="p-6 text-center text-red-600">Dokumen tidak ditemukan.</main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full min-w-0">
        <div className="max-w-7xl mx-auto w-full min-w-0">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-600 mb-4">
            <Link to="/upload" className="text-blue-600 font-semibold hover:underline">
              Upload Document
            </Link>
            <span className="mx-1">/</span>
            <span className="text-gray-600">Document Detail</span>
          </div>

          <h1 className="text-3xl font-bold mb-6">Document Detail</h1>

          {/* Metadata & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="bg-white border rounded-lg p-4 text-sm space-y-2 lg:col-span-7 max-w-full">
              <div className="flex flex-wrap break-words">
                <span className="w-28 font-semibold">Title</span>
                <span className="flex-1 break-words">{dokumen.title}</span>
              </div>
              <div className="flex flex-wrap break-words">
                <span className="w-28 font-semibold">Category</span>
                <span className="flex-1 break-words">{dokumen.type}</span>
              </div>
              <div className="flex flex-wrap break-words">
                <span className="w-28 font-semibold">Upload at</span>
                <span>{new Date(dokumen.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>
              <div className="flex flex-wrap break-words">
                <span className="w-28 font-semibold">File name</span>
                <span className="flex-1 break-all">{dokumen.file_name}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-100 border rounded-lg overflow-hidden flex flex-col lg:col-span-5">
              <div className="px-4 py-2 border-b font-semibold text-sm">Preview</div>
              <div className="flex-grow flex items-center justify-center p-4">
                {(() => {
                  const fileUrl = `${baseURLBackEnd}/uploads/${encodeURIComponent(dokumen.file_name)}`;
                  const ext = getFileExtension(dokumen.file_name);

                   if (["jpg", "jpeg", "png"].includes(ext)) {
                    return (
                      <img
                        src={fileUrl}
                        alt="Preview Dokumen"
                        className="w-full max-w-[320px] rounded border"
                      />
                    );
                  } else if (ext === "pdf") {
                    return (
                      <iframe
                        src={fileUrl}
                        title="PDF Preview"
                        className="w-full h-72 border rounded"
                      />
                    );
                  } else {
                    return (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Lihat atau Unduh File
                      </a>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Chunks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Chunks</h2>
            <div className="space-y-3 max-w-3xl">
              {chunks.length > 0 ? (
                chunks.map((chunk, i) => (
                  <div
                    key={i}
                    className="bg-white border rounded-lg px-4 py-2 text-sm whitespace-pre-line"
                  >
                    <span className="font-semibold mr-2 text-xs">#{i + 1}</span>
                    <span>{chunk.text}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada potongan teks tersedia.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
