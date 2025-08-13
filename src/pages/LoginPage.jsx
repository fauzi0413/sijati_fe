import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import bgImage from '../assets/bg-biru.png';
import Swal from 'sweetalert2';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { getUser, postLoginlogs, postUser, putUser } from '../api/axios';
import bcrypt from 'bcryptjs';

const hashed = await bcrypt.hash('google-oauth-user', 10);

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
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        }
      });
    }

    // Cek akun admin statis
    if (email === "admin@sijati.com" && password === "admin123") {
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const userAgent = navigator.userAgent;

      const staticAdmin = {
        user_id: "admin-static",
        email,
        username: "Admin SI JATI",
        role: "admin",
        last_login: new Date().toISOString(),
      };

      // ⬇️ Cek apakah user admin-static sudah ada
      getUser(async (users) => {
        const alreadyExists = users.some(u => u.user_id === staticAdmin.user_id);

        if (!alreadyExists) {
          // Jika belum ada, insert ke tabel user
          const newUserPayload = {
            user_id: staticAdmin.user_id,
            username: staticAdmin.username,
            email: staticAdmin.email,
            password: "-", // bisa pakai hash dummy, tidak digunakan
            role: staticAdmin.role,
            last_login: staticAdmin.last_login,
          };

          postUser(newUserPayload, (res) => {
            console.log("✅ Admin static user ditambahkan:", res);
          });
        }

        // Simpan login log sukses
        postLoginlogs({
          user_id: staticAdmin.user_id,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'success',
          failure_reason: ''
        }, (res) => {
          // console.log('Login log saved:', res);
        });

        // Simpan ke localStorage dan redirect
        localStorage.setItem("user", JSON.stringify(staticAdmin));
        Swal.fire({
          icon: 'success',
          title: 'Login berhasil',
          text: `Selamat datang ${staticAdmin.username}!`,
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        }).then(() => {
          navigate(`/chatbot`);
        });
      });

      return; // Penting untuk hentikan eksekusi lanjut
    }

    getUser(async (users) => {
      const foundUser = users.find(u => u.email === email);

      if (!foundUser) {
      // Simpan log login pada database lokal
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const userAgent = navigator.userAgent;

      postLoginlogs({
        user_id: '-', // karena user tidak ditemukan
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failed',
        failure_reason: 'User tidak ditemukan'
      }, (res) => {
        // console.log('Login log saved:', res);
      });

      return Swal.fire({
        icon: 'error',
        title: 'Login gagal',
        text: 'User tidak ditemukan',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        }
      });
    }

      try {
        // Login dengan verifikasi email dan password di firebase
        await signInWithEmailAndPassword(auth, email, password);
        
        // Update last login di database lokal
        const now = new Date().toISOString();

        putUser(foundUser.user_id, { last_login: now }, (res) => {
          // console.log('✅ last_login updated:', res);
        });

        // Simpan log login pada database local
        const ipAddress = await fetch("https://api.ipify.org?format=json")
          .then(res => res.json())
          .then(data => data.ip)
          .catch(() => 'unknown');

        const userAgent = navigator.userAgent;

        postLoginlogs({
          user_id: foundUser.user_id,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'success',
          failure_reason: '' // kosong jika sukses
        }, (res) => {
          // console.log('Login log saved:', res);
        });

        localStorage.setItem('user', JSON.stringify(foundUser));
        Swal.fire({
          icon: 'success',
          title: 'Login berhasil',
          text: `Selamat datang ${foundUser.username}!`,
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        }).then(() => {
          navigate(`/chatbot`);
        });
      } catch (err) {
        // Simpan log login pada database lokal
        const ipAddress = await fetch("https://api.ipify.org?format=json")
          .then(res => res.json())
          .then(data => data.ip)
          .catch(() => 'unknown');

        const userAgent = navigator.userAgent;

        postLoginlogs({
          user_id: foundUser.user_id,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'failed',
          failure_reason: 'Email atau password salah'
        }, (res) => {
          // console.log('Login log saved:', res);
        });

        Swal.fire({
          icon: 'error',
          title: 'Login gagal',
          text: 'Email atau password salah. Coba lagi.',
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        });

      }
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const now = new Date().toISOString();
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const userAgent = navigator.userAgent;

      // 1. Cek apakah user sudah ada di database lokal
      getUser(async (users) => {
        const foundUser = users.find((u) => u.email === user.email);

        // 2. Jika belum ada → register ke database lokal
        if (!foundUser) {
          const newUser = {
            user_id: user.uid,
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            password: hashed,
            role: 'user',
            created_at: now,
            updated_at: now,
            last_login: now
          };

          await postUser(newUser, (res) => {
            // console.log('✅ User registered:', res);
          });
        } else {
          // 3. Jika sudah ada → update last_login
          putUser(foundUser.user_id, { last_login: now }, (res) => {
            // console.log('✅ last_login updated:', res);
          });
        }
        // 4. Catat login ke loginlog
        postLoginlogs({
          user_id: user.uid,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: 'success',
          failure_reason: ''
        }, (res) => {
          // console.log('✅ Login log saved:', res);
        });

        // 5. Simpan session user
        localStorage.setItem('user', JSON.stringify(user));

        // 6. Alert sukses
        Swal.fire({
          icon: 'success',
          title: 'Login berhasil',
          text: `Selamat datang ${user.displayName || user.email}!`,
          customClass: {
            confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
          }
        }).then(() => {
          navigate(`/chatbot`);
        });
      });
    } catch (err) {
      // Dapatkan IP & user agent
      const ipAddress = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const userAgent = navigator.userAgent;

      // Simpan log login gagal
      postLoginlogs({
        user_id: '-', // user belum bisa diidentifikasi dari Firebase
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failed',
        failure_reason: 'Login Google gagal'
      }, (res) => {
        // console.log('Login log saved:', res);
      });

      // Tampilkan alert ke user
      Swal.fire({
        icon: 'error',
        title: 'Login Google gagal',
        text: 'Terjadi kesalahan saat login.',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
        }
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
            onClick={() => navigate('/chatbot')}
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

          <div className="text-right mt-1">
            <button
              onClick={() => navigate('/reset-password')}
              className="text-sm text-blue-500 hover:underline"
            >
              Lupa Password?
            </button>
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
