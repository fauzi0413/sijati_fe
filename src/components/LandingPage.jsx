import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg-biru.png'; // Pastikan path benar

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
        Welcome to SI JATI
      </h1>

      <p className="text-white text-base sm:text-lg md:text-xl mb-10 max-w-md sm:max-w-xl">
        Explore East Jakarta and create your experience.
      </p>

      <button
        onClick={() => navigate('/dashboard')}
        className="px-8 sm:px-12 py-3 sm:py-4 border border-white text-white text-sm sm:text-base md:text-lg rounded-full font-semibold hover:bg-white hover:text-[#0E2A7B] transition"
      >
        Let&apos;s Explore!
      </button>
    </div>
  );
};

export default LandingPage;
