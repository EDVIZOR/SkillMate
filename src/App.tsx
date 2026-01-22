import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import Roadmaps from './pages/Roadmaps/Roadmaps';
import Chatbot from './pages/Chatbot/Chatbot';
import SharedChat from './pages/Chatbot/SharedChat';
import SkillGapAnalysis from './pages/SkillGapAnalysis/SkillGapAnalysis';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/skill-gap-analysis" element={<SkillGapAnalysis />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chatbot/share/:shareId" element={<SharedChat />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

