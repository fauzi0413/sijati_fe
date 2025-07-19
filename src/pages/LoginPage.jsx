import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import bgImage from '../assets/bg-biru.png';
import Swal from 'sweetalert2';
import { IoMdArrowRoundBack } from 'react-icons/io';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleManualLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      return Swal.fire({
        icon: 'warning',
        title: 'Form tidak lengkap',
        text: 'Email dan password harus diisi!',
      });
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login gagal',
        text: 'Email atau password salah. Coba lagi.',
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Google login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Login Google gagal',
        text: 'Terjadi kesalahan saat login.',
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white shadow-md rounded-2xl px-6 pt-6 pb-8 w-full max-w-md sm:max-w-sm min-h-[580px]">
        {/* Tombol Back */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition"
          >
            <IoMdArrowRoundBack className="text-xl" />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <div className="relative mb-6 bg-gray-200 rounded-full h-10">
          <div className="absolute top-0 left-[45%] h-full w-[55%] bg-black rounded-full z-10 transition-all duration-300" />
          <div className="relative z-20 flex h-full text-sm font-semibold">
            <button
              onClick={() => navigate('/register')}
              className="flex-1 rounded-full text-gray-600"
            >
              Register
            </button>
            <button
              className="flex-1 rounded-full text-white"
              disabled
            >
              Login
            </button>
          </div>
        </div>

        <h2 className="text-center font-semibold text-base sm:text-lg mb-6">Login</h2>

        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button
          onClick={handleManualLogin}
          className="bg-blue-500 text-white w-full py-2 rounded-full font-medium mt-6 hover:bg-blue-600"
        >
          Login
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 border rounded-full px-4 py-2 w-full hover:bg-gray-100"
        >
          <FcGoogle className="text-xl" />
          <span className="text-sm">Login with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
