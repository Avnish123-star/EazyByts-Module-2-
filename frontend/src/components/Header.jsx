import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // 2. Initialize navigate

  const logoutHandler = () => {
    logout();
    navigate('/login'); // 3. Add this line to redirect to the login page
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">StockDashboard</Link>
      </div>
      <nav>
        <ul>
          {userInfo ? (
            // If user is logged in
            <>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
              <li>
                <span className="user-name">Hello, {userInfo.name}</span>
              </li>
              <li>
                <a href="#!" onClick={logoutHandler} className="logout-link">
                  Logout
                </a>
              </li>
            </>
          ) : (
            // If user is logged out
            <>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;