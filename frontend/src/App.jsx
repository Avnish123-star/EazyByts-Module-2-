import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useContext } from 'react'; // Import useEffect
import { io } from 'socket.io-client'; // Import io
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS

import AuthContext from './context/AuthContext'; // Import AuthContext
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourcesPage from './pages/ResourcesPage';

function App() {
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    // This code runs when the user logs in or out
    if (userInfo) {
      // 1. Connect to the real-time server
      const socket = io('http://localhost:5000');

      // 2. Register the user with the server
      socket.emit('registerUser', userInfo._id);

      // 3. Listen for 'priceAlert' messages from the server
      socket.on('priceAlert', (data) => {
        // Show a pop-up notification
        toast.info(data.message);
      });

      // 4. Disconnect when the user logs out or closes the page
      return () => {
        socket.disconnect();
      };
    }
  }, [userInfo]); // Dependency array ensures this runs when userInfo changes

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