import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage'; // pastikan file ini ada
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadDokumen from './pages/UploadDokumen';
import FAQManagement from './pages/FAQManagement';
import StatistikChatbot from './pages/StatistikChatbot';
import DokumenDetail from './pages/DokumenDetail';
import NotFound from './pages/NotFound';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ManagementUser from './pages/ManagementUser';
import LoginLogs from './pages/LoginLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
         <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Halaman Dashboard/Admin */}
        <Route path="/upload" element={<UploadDokumen />} />
        <Route path="/faq" element={<FAQManagement />} />
        <Route path="/statistik" element={<StatistikChatbot />} />
        <Route path="/dokumen/:id" element={<DokumenDetail />} />
        <Route path="/user-management" element={<ManagementUser />} /> 
        <Route path="/login-logs" element={<LoginLogs />} />

        {/* Fallback untuk semua route yang tidak ditemukan */}
        <Route path="*" element={<NotFound />} />

        {/* Optional: redirect halaman tidak ditemukan ke landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
