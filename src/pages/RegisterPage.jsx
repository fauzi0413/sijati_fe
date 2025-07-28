import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaCheck, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import bgImage from '../assets/bg-biru.png';
import Swal from 'sweetalert2';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { postUser } from '../api/axios';
import bcrypt from 'bcryptjs';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      checkPasswordCriteria(value);
    }
  };

  const checkPasswordCriteria = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[@$!%*?&]/.test(password)
    });
  };

  const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });

  const handleManualSignUp = async () => {
    const { email, password, confirmPassword, username } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return Swal.fire({
        icon: 'warning',
        title: 'Form tidak lengkap',
        text: 'Semua kolom harus diisi!',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        },
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Password tidak cocok',
        text: 'Konfirmasi password harus sama',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        },
      });
    }

    if (!isPasswordStrong(password)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Password tidak valid',
        html: 'Password minimal 8 karakter dan harus mengandung:<br>• Huruf besar<br>• Huruf kecil<br>• Angka<br>• Simbol (@$!%*?&)',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        },
      });
    }

     try {
      // 1. Registrasi ke Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Simpan ke database lokal
      const userData = {
        user_id: firebaseUser.uid, // atau UUID manual
        username,
        email,
        password:hashedPassword,
        role: 'user', // default role
        created_at: new Date(),
        updated_at: new Date()
      };

      postUser(userData, (responseData) => {
        // 4. Jika sukses, tampilkan alert dan arahkan ke login
        Swal.fire({
          icon: 'success',
          title: 'Registrasi berhasil',
          text: 'Silakan login untuk masuk ke sistem.',
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        }).then(() => {
          navigate('/login');
        });
      });
    } catch (error) {
      console.error('❌ Register error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Swal.fire({
          icon: 'warning',
          title: 'Email sudah terdaftar, silahkan login',
          text: 'Silahkan gunakan email lain atau login jika sudah memiliki akun.',
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          },
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal registrasi',
          text: 'Password harus minimal 6 karakter.',
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          },
        })
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Google sign-up error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal login dengan Google',
        text: 'Terjadi kesalahan saat otentikasi.',
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white shadow-md rounded-2xl px-6 pt-6 pb-8 my-10 w-full max-w-md sm:max-w-sm min-h-[580px]">
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
          <div className="absolute top-0 left-0 h-full w-[55%] bg-black rounded-full z-10 transition-all duration-300" />
          <div className="relative z-20 flex h-full text-sm font-semibold">
            <button className="flex-1 rounded-full text-white" disabled>Register</button>
            <button onClick={() => navigate('/login')} className="flex-1 rounded-full text-gray-600">Login</button>
          </div>
        </div>

        <h2 className="text-center font-semibold text-base sm:text-lg mb-6">Register</h2>

        <div className="space-y-4">
          <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          <div className="relative">
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password"
              value={formData.password} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="relative">
            <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Konfirmasi Password"
              value={formData.confirmPassword} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowConfirm(prev => !prev)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1 ml-1 space-y-1">
            <p>
              {passwordCriteria.length
                ? <FaCheck className="text-green-600 inline mr-1" />
                : <FaTimes className="text-red-500 inline mr-1" />}
              Minimal 8 karakter
            </p>
            <p>
              {passwordCriteria.uppercase
                ? <FaCheck className="text-green-600 inline mr-1" />
                : <FaTimes className="text-red-500 inline mr-1" />}
              Huruf besar (A–Z)
            </p>
            <p>
              {passwordCriteria.lowercase
                ? <FaCheck className="text-green-600 inline mr-1" />
                : <FaTimes className="text-red-500 inline mr-1" />}
              Huruf kecil (a–z)
            </p>
            <p>
              {passwordCriteria.number
                ? <FaCheck className="text-green-600 inline mr-1" />
                : <FaTimes className="text-red-500 inline mr-1" />}
              Angka (0–9)
            </p>
            <p>
              {passwordCriteria.symbol
                ? <FaCheck className="text-green-600 inline mr-1" />
                : <FaTimes className="text-red-500 inline mr-1" />}
              Simbol (@$!%*?&)
            </p>
          </div>
        </div>

        <button onClick={handleManualSignUp}
          className="bg-blue-500 text-white w-full py-2 rounded-full font-medium mt-6 hover:bg-blue-600">
          Register
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-2 border rounded-full px-4 py-2 w-full hover:bg-gray-100">
          <FcGoogle className="text-xl" />
          <span className="text-sm">Register with Google</span>
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
