import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT ADDED
import './ResourcesPage.css';

const ResourcesPage = () => {
  const navigate = useNavigate(); // <-- 2. HOOK ADDED

  return (
    <div className="login-page-wrapper">
      <div className="form-container resources-container">
        
        {/* --- 3. BACK BUTTON ADDED HERE --- */}
        <button onClick={() => navigate(-1)} className="back-btn">
          &larr; Back to Dashboard
        </button>

        <h1>Educational Resources</h1>
        <p className="intro-text">
          Here are some excellent resources to learn more about stock market investing and financial concepts.
        </p>

        <div className="resource-card">
          <h2>Investopedia</h2>
          <p>A comprehensive resource for financial terms, concepts, and tutorials. Great for beginners and experts alike.</p>
          <a href="https://www.investopedia.com" target="_blank" rel="noopener noreferrer">Visit Investopedia</a>
        </div>

        <div className="resource-card">
          <h2>Zerodha Varsity</h2>
          <p>An easy-to-understand collection of stock market lessons with in-depth coverage and illustrations.</p>
          <a href="https://zerodha.com/varsity/" target="_blank" rel="noopener noreferrer">Visit Varsity</a>
        </div>

        <div className="resource-card">
          <h2>Moneycontrol</h2>
          <p>A leading source for business and financial news in India, including market analysis and expert opinions.</p>
          <a href="https://www.moneycontrol.com/" target="_blank" rel="noopener noreferrer">Visit Moneycontrol</a>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;