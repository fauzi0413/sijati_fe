import React from "react";
import { useNavigate } from "react-router-dom";
import NotFoundImg from "../assets/jati-404.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center px-4">
        <img src={NotFoundImg} alt="404" className="w-80 max-w-full mb-6 mx-auto" />
        <p className="text-base md:text-lg text-gray-700 font-medium mb-6">
          Sorry, the page you are looking for could not be found.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#F4418D] text-white px-6 py-3 rounded-md text-sm font-semibold hover:brightness-110 transition"
        >
          Go back to Home
        </button>
      </div>
    </div>
  );
}