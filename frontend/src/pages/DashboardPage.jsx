import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import StockChart from '../components/StockChart';
import PortfolioPieChart from '../components/PortfolioPieChart';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userInfo } = useContext(AuthContext);
  
  const [portfolio, setPortfolio] = useState([]);
  const [liveData, setLiveData] = useState({});
  
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchPortfolio = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data: portfolioData } = await axios.get('http://localhost:5000/api/portfolio', config);
      setPortfolio(portfolioData);
      
      // Keep this commented to avoid API limit errors during development
      fetchLivePrices(portfolioData);

    } catch (error) { console.error('Failed to fetch portfolio', error); }
  };

  const fetchLivePrices = async (portfolioStocks) => {
    const promises = portfolioStocks.map(stock =>
      axios.get(`http://localhost:5000/api/stocks/${stock.symbol}`)
    );
    try {
      const responses = await Promise.all(promises);
      const livePriceData = responses.reduce((acc, response) => {
        const { symbol } = response.data;
        if (symbol) { acc[symbol] = response.data; }
        return acc;
      }, {});
      setLiveData(livePriceData);
    } catch (error) { console.error('Failed to fetch live stock prices', error); }
  };
  
  useEffect(() => {
    fetchPortfolio();
  }, [userInfo]);

  const handleRowClick = async (stockSymbol) => {
    setSelectedStock(stockSymbol);
    setLoadingChart(true);
    setChartData(null);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/stocks/history/${stockSymbol}`);
      setChartData(data);
    } catch (error) { console.error('Failed to fetch chart data', error); alert('Could not fetch historical data.'); }
    finally { setLoadingChart(false); }
  };

  const addStockHandler = async (e) => {
    e.preventDefault();
    const newStock = { symbol, quantity: Number(quantity), purchasePrice: Number(purchasePrice) };
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/portfolio/add', newStock, config);
      fetchPortfolio();
      setSymbol('');
      setQuantity('');
      setPurchasePrice('');
      setShowAddForm(false);
    } catch (error) { console.error('Failed to add stock', error); alert('Failed to add stock'); }
  };

  const deleteStockHandler = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/portfolio/${stockId}`, config);
        fetchPortfolio();
      } catch (error) { console.error('Failed to delete stock', error); alert('Failed to delete stock.'); }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="add-stock-toggle">
        <button onClick={() => setShowAddForm(!showAddForm)} className="toggle-form-btn">
          {showAddForm ? 'Cancel' : '+ Add New Stock'}
        </button>
      </div>
      
      {showAddForm ? (
        <div className="form-container dashboard-form">
          <h2>Add New Stock</h2>
          <form onSubmit={addStockHandler}>
            <div className="form-group"><label>Stock Symbol</label><input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} required /></div>
            <div className="form-group"><label>Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
            <div className="form-group"><label>Purchase Price</label><input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required /></div>
            <button type="submit" className="submit-btn">Add Stock</button>
          </form>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="chart-container">
              {selectedStock ? (
                <>
                  <div className="chart-type-selector">
                    <button onClick={() => setChartType('line')} className={chartType === 'line' ? 'active' : ''}>Line Chart</button>
                    <button onClick={() => setChartType('bar')} className={chartType === 'bar' ? 'active' : ''}>Bar Chart</button>
                  </div>
                  {loadingChart && <p>Loading Chart...</p>}
                  {chartData && <StockChart chartData={chartData} stockSymbol={selectedStock} chartType={chartType} />}
                </>
              ) : ( <p className="chart-placeholder">Click on a stock in your portfolio to see its price history.</p> )}
            </div>
            <div className="chart-container">
              {portfolio.length > 0 ? ( <PortfolioPieChart portfolio={portfolio} liveData={liveData} /> ) : ( <p className="chart-placeholder">Add stocks to see your portfolio distribution.</p> )}
            </div>
          </div>

          <div className="portfolio-container">
            <h2>Your Portfolio</h2>
            <div className="portfolio-list">
              {portfolio.length === 0 ? <p>Your portfolio is empty.</p> : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Current Price</th>
                        <th>Total Value</th>
                        <th>Profit/Loss</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((stock) => {
                        const currentPrice = liveData[stock.symbol] ? parseFloat(liveData[stock.symbol].price) : stock.purchasePrice;
                        const totalValue = currentPrice * stock.quantity;
                        const profitLoss = totalValue - (stock.purchasePrice * stock.quantity);
                        return (
                          <tr key={stock._id}>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">{stock.symbol}</td>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">{stock.quantity}</td>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${stock.purchasePrice.toFixed(2)}</td>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${currentPrice.toFixed(2)}</td>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${totalValue.toFixed(2)}</td>
                            <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell" style={{ color: profitLoss >= 0 ? 'green' : 'red' }}>
                              ${profitLoss.toFixed(2)}
                            </td>
                            <td>
                              <button className="delete-btn" onClick={() => deleteStockHandler(stock._id)}>
                                🗑️Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;







// import { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import AuthContext from '../context/AuthContext';
// import StockChart from '../components/StockChart';
// import PortfolioPieChart from '../components/PortfolioPieChart';
// import './DashboardPage.css';

// const DashboardPage = () => {
//   const { userInfo } = useContext(AuthContext);
  
//   const [portfolio, setPortfolio] = useState([]);
//   const [liveData, setLiveData] = useState({});
  
//   const [symbol, setSymbol] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [purchasePrice, setPurchasePrice] = useState('');

//   const [selectedStock, setSelectedStock] = useState(null);
//   const [chartData, setChartData] = useState(null);
//   const [loadingChart, setLoadingChart] = useState(false);
//   const [chartType, setChartType] = useState('line');
//   const [showAddForm, setShowAddForm] = useState(false);

//   // All your functions are unchanged
//   const fetchPortfolio = async () => {
//     if (!userInfo) return;
//     try {
//       const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//       const { data: portfolioData } = await axios.get('http://localhost:5000/api/portfolio', config);
//       setPortfolio(portfolioData);
//       // fetchLivePrices(portfolioData);
//     } catch (error) { console.error('Failed to fetch portfolio', error); }
//   };

//   const fetchLivePrices = async (portfolioStocks) => {
//     const promises = portfolioStocks.map(stock =>
//       axios.get(`http://localhost:5000/api/stocks/${stock.symbol}`)
//     );
//     try {
//       const responses = await Promise.all(promises);
//       const livePriceData = responses.reduce((acc, response) => {
//         const { symbol } = response.data;
//         if (symbol) { acc[symbol] = response.data; }
//         return acc;
//       }, {});
//       setLiveData(livePriceData);
//     } catch (error) { console.error('Failed to fetch live stock prices', error); }
//   };
  
//   useEffect(() => {
//     fetchPortfolio();
//   }, [userInfo]);

//   const handleRowClick = async (stockSymbol) => {
//     setSelectedStock(stockSymbol);
//     setLoadingChart(true);
//     setChartData(null);
//     try {
//       const { data } = await axios.get(`http://localhost:5000/api/stocks/history/${stockSymbol}`);
//       setChartData(data);
//     } catch (error) { console.error('Failed to fetch chart data', error); alert('Could not fetch historical data.'); }
//     finally { setLoadingChart(false); }
//   };

//   const addStockHandler = async (e) => {
//     e.preventDefault();
//     const newStock = { symbol, quantity: Number(quantity), purchasePrice: Number(purchasePrice) };
//     try {
//       const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
//       await axios.post('http://localhost:5000/api/portfolio/add', newStock, config);
//       fetchPortfolio();
//       setSymbol('');
//       setQuantity('');
//       setPurchasePrice('');
//       setShowAddForm(false);
//     } catch (error) { console.error('Failed to add stock', error); alert('Failed to add stock'); }
//   };

//   const deleteStockHandler = async (stockId) => {
//     if (window.confirm('Are you sure you want to delete this stock?')) {
//       try {
//         const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//         await axios.delete(`http://localhost:5000/api/portfolio/${stockId}`, config);
//         fetchPortfolio();
//       } catch (error) { console.error('Failed to delete stock', error); alert('Failed to delete stock.'); }
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="add-stock-toggle">
//         <button onClick={() => setShowAddForm(!showAddForm)} className="toggle-form-btn">
//           {showAddForm ? 'View Dashboard' : '+ Add New Stock'}
//         </button>
//       </div>
      
//       {showAddForm ? (
//         // --- MODE 1: SHOW ONLY THE FORM ---
//         <div className="form-container dashboard-form">
//           <h2>Add New Stock</h2>
//           <form onSubmit={addStockHandler}>
//             <div className="form-group"><label>Stock Symbol</label><input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} required /></div>
//             <div className="form-group"><label>Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
//             <div className="form-group"><label>Purchase Price</label><input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required /></div>
//             <button type="submit" className="submit-btn">Add Stock</button>
//           </form>
//         </div>
//       ) : (
//         // --- MODE 2: SHOW CHARTS AND PORTFOLIO ---
//         <>
//           <div className="charts-grid">
//             <div className="chart-container">
//               {selectedStock ? (
//                 <>
//                   <div className="chart-type-selector">
//                     <button onClick={() => setChartType('line')} className={chartType === 'line' ? 'active' : ''}>Line Chart</button>
//                     <button onClick={() => setChartType('bar')} className={chartType === 'bar' ? 'active' : ''}>Bar Chart</button>
//                   </div>
//                   {loadingChart && <p>Loading Chart...</p>}
//                   {chartData && <StockChart chartData={chartData} stockSymbol={selectedStock} chartType={chartType} />}
//                 </>
//               ) : ( <p className="chart-placeholder">Click on a stock in your portfolio to see its price history.</p> )}
//             </div>
//             <div className="chart-container">
//               {portfolio.length > 0 ? ( <PortfolioPieChart portfolio={portfolio} liveData={liveData} /> ) : ( <p className="chart-placeholder">Add stocks to see your portfolio distribution.</p> )}
//             </div>
//           </div>

//           <div className="portfolio-container">
//             <h2>Your Portfolio</h2>
//             <div className="portfolio-list">
//               {portfolio.length === 0 ? <p>Your portfolio is empty.</p> : (
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Symbol</th>
//                       <th>Quantity</th>
//                       <th>Purchase Price</th>
//                       <th>Current Price</th>
//                       <th>Total Value</th>
//                       <th>Profit/Loss</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {portfolio.map((stock) => {
//                       const currentPrice = liveData[stock.symbol] ? parseFloat(liveData[stock.symbol].price) : stock.purchasePrice;
//                       const totalValue = currentPrice * stock.quantity;
//                       const profitLoss = totalValue - (stock.purchasePrice * stock.quantity);
//                       return (
//                         <tr key={stock._id}>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">{stock.symbol}</td>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">{stock.quantity}</td>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${stock.purchasePrice.toFixed(2)}</td>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${currentPrice.toFixed(2)}</td>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell">${totalValue.toFixed(2)}</td>
//                           <td onClick={() => handleRowClick(stock.symbol)} className="clickable-cell" style={{ color: profitLoss >= 0 ? 'green' : 'red' }}>${profitLoss.toFixed(2)}</td>
//                           <td>
//                             <button className="delete-btn" onClick={() => deleteStockHandler(stock._id)}>
//                               🗑️
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;





