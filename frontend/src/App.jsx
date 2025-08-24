import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthContext from './context/AuthContext';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourcesPage from './pages/ResourcesPage';

// --- 1. DEFINE THE BACKEND URL FROM THE ENVIRONMENT VARIABLE ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo) {
      // --- 2. USE THE API_URL VARIABLE FOR THE CONNECTION ---
      const socket = io(API_URL);

      socket.emit('registerUser', userInfo._id);

      socket.on('priceAlert', (data) => {
        toast.info(data.message);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <Router>
      <Header />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;