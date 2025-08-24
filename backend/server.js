const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // Needed for API calls

const connectDB = require('./config/db.js');
const Portfolio = require('./models/Portfolio.js'); // Import Portfolio model
const userRoutes = require('./routes/userRoutes.js');
const portfolioRoutes = require('./routes/portfolioRoutes.js');
const stockRoutes = require('./routes/stockRoutes.js');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// --- THIS IS THE ONLY LINE THAT CHANGED ---
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

app.use(express.json());

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/stocks', stockRoutes);

// --- Real-time Socket.io Logic ---
const userSockets = {}; // Tracks online users: { userId: socketId }
let lastPrices = {}; // Stores the last known price of each stock

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When frontend connects, it sends its userId
  socket.on('registerUser', (userId) => {
    console.log(`Registering user ${userId} with socket ${socket.id}`);
    userSockets[userId] = socket.id;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from tracking on disconnect
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

// --- Background Price Checker ---
const checkPrices = async () => {
  try {
    // 1. Get all unique stock symbols from all portfolios
    const uniqueSymbols = await Portfolio.distinct('symbol');
    if (uniqueSymbols.length === 0) return;

    // 2. Fetch the current price for each symbol
    const promises = uniqueSymbols.map(symbol => 
      axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`)
    );
    const responses = await Promise.all(promises);

    for (const response of responses) {
      const data = response.data['Global Quote'];
      if (data && data['01. symbol']) {
        const symbol = data['01. symbol'];
        const currentPrice = parseFloat(data['05. price']);
        
        if (lastPrices[symbol] && lastPrices[symbol] !== currentPrice) {
          const priceChange = ((currentPrice - lastPrices[symbol]) / lastPrices[symbol]) * 100;
          
          if (Math.abs(priceChange) > 0.1) {
            console.log(`Price alert for ${symbol}: ${priceChange.toFixed(2)}%`);
            
            const usersToAlert = await Portfolio.find({ symbol: symbol }).distinct('user');

            for (const userId of usersToAlert) {
              const socketId = userSockets[userId.toString()];
              if (socketId) {
                const alertMessage = `${symbol} price has changed by ${priceChange.toFixed(2)}%! New price: $${currentPrice.toFixed(2)}`;
                io.to(socketId).emit('priceAlert', { message: alertMessage });
              }
            }
          }
        }
        lastPrices[symbol] = currentPrice;
      }
    }
  } catch (error) {
    console.error('Error in checkPrices:', error.data ? error.data.Information : error.message);
  }
};

setInterval(checkPrices, 60000);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));