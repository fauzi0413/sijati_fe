import React, { useState, useEffect, useRef } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { getFeedback } from "../api/axios";
import Layout from "../components/Layout";

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedStars, setSelectedStars] = useState("All Ratings");
  const [openStarsDropdown, setOpenStarsDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState("All Dates");
  const [openDateDropdown, setOpenDateDropdown] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const starsRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    getFeedback((data) => setFeedbacks(data));

    const handleClickOutside = (event) => {
      if (starsRef.current && !starsRef.current.contains(event.target)) {
        setOpenStarsDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setOpenDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const starOptions = [
    { label: "All Ratings", value: "All" },
    { label: "(5 stars)", value: 5 },
    { label: "(4 stars & up)", value: 4 },
    { label: "(3 stars & up)", value: 3 },
    { label: "(2 stars & up)", value: 2 },
    { label: "(1 stars)", value: 1 },
  ];

  const dateOptions = [
    "All Dates", "Today", "Yesterday", "Last 7 Days",
    "Last 30 Days", "This Month", "Last Month",
  ];

  const handleSelectStars = (option) => {
    setSelectedStars(option.label);
    setOpenStarsDropdown(false);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setOpenDateDropdown(false);
  };

  const handleApplyCustomDate = () => {
    setSelectedDate(`${customFrom} - ${customTo}`);
    setOpenDateDropdown(false);
  };

  const isWithinDateRange = (feedbackDate) => {
    const date = new Date(feedbackDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    switch (selectedDate) {
      case "Today":
        return date >= today;
      case "Yesterday":
        return date >= yesterday && date < today;
      case "Last 7 Days":
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);
        return date >= last7;
      case "Last 30 Days":
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);
        return date >= last30;
      case "This Month":
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case "Last Month":
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      default:
        if (selectedDate.includes("-")) {
          const [from, to] = selectedDate.split(" - ");
          const fromDate = new Date(from);
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          return date >= fromDate && date <= toDate;
        }
        return true;
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const starPass = selectedStars === "All Ratings"
      ? true
      : fb.rating >= parseInt(selectedStars.match(/\d/)[0], 10);

    const datePass = isWithinDateRange(fb.created_at);
    return starPass && datePass;
  });

  const keywordCounts = {};
  filteredFeedbacks.forEach((fb) => {
    if (fb.comment) {
      const words = fb.comment.toLowerCase().replace(/[.,!?]/g, "").split(" ");
      words.forEach((word) => {
        if (word.length > 3) {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1;
        }
      });
    }
  });

  const keywords = Object.entries(keywordCounts).map(([word, count]) => ({ word, count }));
  const maxCount = Math.max(...keywords.map(k => k.count), 1);

  return (
    <Layout>
      <h1 className="text-xl md:text-2xl font-bold mb-4">Feedback</h1>

      {/* Mobile Keyword Panel */}
      <div className="md:hidden w-full bg-white shadow-md rounded-xl p-5 mb-4">
        <h2 className="text-lg font-semibold mb-3">Keyword Populer</h2>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {keywords.length > 0 ? (
            keywords.map((k, idx) => (
              <span key={idx} className="text-blue-700" style={{ fontSize: `${10 + (k.count / maxCount) * 12}px` }}>
                {k.word}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada keyword</p>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        {/* Stars Dropdown */}
        <div ref={starsRef} className="relative w-full md:w-56">
          <button
            onClick={() => setOpenStarsDropdown(!openStarsDropdown)}
            className="border rounded-lg px-3 py-2 flex items-center justify-between w-full bg-white"
          >
            Stars: {selectedStars}
            <span className="ml-2">▼</span>
          </button>
          {openStarsDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
              {starOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectStars(option)}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {option.value !== "All" ? (
                    <div className="flex items-center mr-2">
                      {Array.from({ length: option.value }).map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                      {option.value < 5 &&
                        Array.from({ length: 5 - option.value }).map((_, i) => (
                          <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center mr-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  )}
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Dropdown */}
        <div ref={dateRef} className="relative w-full md:w-72">
          <button
            onClick={() => setOpenDateDropdown(!openDateDropdown)}
            className="border rounded-lg px-3 py-2 flex items-center justify-between w-full bg-white"
          >
            Date: {selectedDate}
            <span className="ml-2">▼</span>
          </button>
          {openDateDropdown && (
            <div className="absolute left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10 p-3">
              {dateOptions.map((date, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectDate(date)}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {date}
                </div>
              ))}
              {/* Custom Range */}
              <div className="border-t mt-2 pt-2">
                <p className="text-xs text-gray-600 mb-2">Custom Range</p>
                <div className="flex items-center gap-1 mb-3">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="border rounded px-1 py-1 text-xs w-full"
                  />
                  <span className="text-xs">To</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="border rounded px-1 py-1 text-xs w-full"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpenDateDropdown(false)}
                    className="text-xs text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCustomDate}
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feedback List */}
        <div className="md:col-span-2 space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center text-gray-500 text-sm bg-white p-6 rounded-lg shadow-sm">
              Tidak ada data feedback yang tersedia.
            </div>
          ) : (
            filteredFeedbacks
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((fb) => (
                <div key={fb.feedback_id} className="bg-white shadow-sm rounded-lg p-4 flex flex-col hover:shadow-md transition">
                  <div className="flex items-center mb-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">{fb.user_id}</p>
                      <div className="flex items-center text-yellow-500">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <StarIcon key={idx} className={`w-4 h-4 ${idx < fb.rating ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                        <span className="ml-2 text-gray-500 text-sm">
                          {new Date(fb.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{fb.comment || "Tidak ada komentar"}</p>
                </div>
              ))
          )}
        </div>

        {/* Desktop Keyword Panel */}
        <div className="hidden md:block w-full bg-white shadow-md rounded-xl p-5 md:sticky md:top-24">
          <h2 className="text-lg font-semibold mb-3">Keyword Populer</h2>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {keywords.length > 0 ? (
              keywords.map((k, idx) => (
                <span key={idx} className="text-blue-700" style={{ fontSize: `${12 + (k.count / maxCount) * 16}px` }}>
                  {k.word}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Tidak ada keyword</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
