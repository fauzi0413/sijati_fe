import React, { useState } from "react";
import Layout from "../components/Layout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { getFAQ, postFAQ, putFAQ, deleteFAQById } from "../api/axios";
import { useEffect } from "react";

export default function FAQPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [reference, setReference] = useState("");
  const [kategori, setKategori] = useState("");
  const categories = ["Autentikasi", "Umum", "Layanan"];
  const [faqList, setFaq] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [userId] = useState("user-001");

  useEffect(() => {
    getFAQ((data) => {
      setFaq(data);
    });
  }, []);

  const handleSubmit = () => {
    if (!question || !answer || !reference || !kategori) {
      Swal.fire({
        icon: "warning",
        title: "Field tidak boleh kosong",
        text: "Lengkapi semua isian sebelum menyimpan FAQ",
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

    const payload = { question, answer, reference, kategori, user_id: userId };

    if (editIndex !== null) {
      const id = faqList[editIndex]?.faq_id;
      putFAQ(id, payload, () => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "FAQ diperbarui",
          text: "Data berhasil diupdate",
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        });
        setEditIndex(null);
        resetForm();
        getFAQ((data) => setFaq(data));
      });
    } else {
      postFAQ(payload, () => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "FAQ ditambahkan",
          text: "Data berhasil disimpan",
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        });
        resetForm();
        getFAQ((data) => setFaq(data));
      });
    }
  };

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setReference("");
    setKategori("");
  };

  const handleEdit = (index) => {
    const faq = faqList[index];
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setReference(faq.reference);
    setKategori(faq.kategori);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const id = faqList[index]?.faq_id;
      Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data yang dihapus tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    buttonsStyling: false, // menonaktifkan styling SweetAlert
    customClass: {
      confirmButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 me-3',
      cancelButton: 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
    }
  }).then((result) => {
      if (result.isConfirmed) {
        deleteFAQById(id, () => {
          Swal.fire({
          icon: "success",
          title: "Berhasil dihapus",
          text: "FAQ berhasil dihapus",
          confirmButtonColor: "#3B82F6",
          }).then(() => {
            getFAQ((data) => setFaq(data));
          });
        });
      }
    });
  };

  const handleShowDetail = (index) => {
    const faq = faqList[index];

    Swal.fire({
      title: faq.question,
      html: `
        <div style="text-align: left;">
          <p class="mb-5"><strong>Jawaban:</strong><br/>${faq.answer}</p>
          <p class="mb-5"><strong>Referensi:</strong><br/><a href="${faq.reference}" target="_blank" style="color: #3B82F6;">${faq.reference}</a></p>
          <p><strong>Kategori:</strong> ${faq.kategori}</p>
        </div>
      `,
      width: 600,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-md shadow',
      }
    });
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Manajemen FAQ</h1>

        <div className="bg-white p-6 rounded-md shadow w-full mb-8">
          <div className="space-y-4">
            <div>
              <h2 className="block font-semibold text-base mb-3">Masukkan Pertanyaan</h2>
              <input
                type="text"
                placeholder="Ex: Apa itu SI JATI?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
              />
            </div>
            <div>
              <h2 className="block font-semibold text-base mb-3">Masukkan Jawaban</h2>
              <textarea
                placeholder="Ex: SI JATI adalah Sistem Informasi Jakarta Timur"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4} // Bisa diubah sesuai kebutuhan
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50 resize-none"
              />
            </div>
            <div>
              <h2 className="block font-semibold text-base mb-3">Masukkan Referensi</h2>
              <input
                type="text"
                placeholder="Ex: https://example.com/faq"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded bg-gray-50"
              />
            </div>
            <div className="flex gap-4 items-end">
              <div className="w-full">
                <h2 className="block font-semibold text-base mb-3">Pilih Kategori</h2>
                <Listbox value={kategori} onChange={setKategori}>
                  <div className="relative">
                    <Listbox.Button className="w-full border border-gray-300 bg-white text-left px-4 py-2 rounded focus:outline-none">
                      {kategori || "Pilih"}
                      <ChevronUpDownIcon className="w-5 h-5 absolute right-2 top-2.5 text-gray-500" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg z-10 border border-gray-300">
                      {categories.map((item, i) => (
                        <Listbox.Option
                          key={i}
                          value={item}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 rounded ${
                              active ? "bg-[#F4418D] text-white" : "text-gray-900"
                            }`
                          }
                        >
                          {item}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <input type="hidden" value={userId} />
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded h-[42px]"
              >
                {editIndex !== null ? "Update" : "Tambah"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md shadow w-full">
          <h2 className="font-semibold text-base mb-4">Daftar FAQ</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="font-semibold">
                <th className="text-left font-medium px-3 py-2">No.</th>
                <th className="text-left font-medium px-3 py-2">Pertanyaan</th>
                <th className="text-left font-medium px-3 py-2">Kategori</th>
                <th className="text-left font-medium px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {faqList.map((item, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 w-[1%] whitespace-nowrap text-center">{i + 1}.</td>
                  <td className="px-3 py-2">
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleShowDetail(i)}
                    >
                      {item.question}
                    </span>
                  </td>
                  <td className="px-3 py-2">{item.kategori}</td>
                  <td className="px-3 py-2 flex items-center gap-2">
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
    </Layout>
  );
}
