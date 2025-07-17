import React from "react";
import Layout from "../components/Layout";

export default function DokumenDetail() {
  const dokumen = {
    title: "Peraturan Gubernur Jakarta Nomor 23 Tahun 2016",
    category: "Peraturan",
    uploadAt: "Jul 13–2025 at 2:15 PM",
    fileName: "Pergub-23-tahun-2016.pdf",
    preview: "/preview/pergub23.png", // ganti sesuai path gambarnya
  };

  const chunks = [
    {
      id: 1,
      text: "PERATURAN GUBERNUR PROVINSI DAERAH KHUSUS IBU KOTA JAKARTA",
    },
    {
      id: 2,
      text: "TENTANG\nHARI BEBAS KENDARAAN BERMOTOR",
    },
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Documen Detail</h1>

      {/* Metadata + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Metadata */}
        <div className="bg-white border rounded-lg p-4 text-sm space-y-2 lg:col-span-7 max-w-full">
          <div className="flex">
            <span className="w-24 font-semibold">Title</span>
            <span className="text-sm">{dokumen.title}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">Category</span>
            <span className="text-sm">{dokumen.category}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">Upload at</span>
            <span className="text-sm">{dokumen.uploadAt}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-semibold">File name</span>
            <span className="text-sm">{dokumen.fileName}</span>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-100 border rounded-lg overflow-hidden flex flex-col lg:col-span-5">
          <div className="px-4 py-2 border-b font-semibold text-sm">Preview</div>
          <div className="flex-grow flex items-center justify-center p-4">
            <img
              src={dokumen.preview}
              alt="Preview Dokumen"
              className="w-full max-w-[320px] rounded border"
            />
          </div>
        </div>
      </div>

      {/* Chunks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Chunks</h2>
        <div className="space-y-3 max-w-3xl">
          {chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="bg-white border rounded-lg px-4 py-2 text-sm whitespace-pre-line"
            >
              <span className="font-semibold mr-2 text-xs">#{chunk.id}</span>
              <span className="text-sm">{chunk.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
