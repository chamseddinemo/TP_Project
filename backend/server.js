const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const hrRoutes = require('./routes/hrRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const financeRoutes = require('./routes/financeRoutes');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }
});

// Passer io aux routes
app.set('io', io);

// Middleware pour passer io aux controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Configuration CORS pour permettre les connexions depuis d'autres machines
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Permettre toutes les origines en développement (pour faciliter les tests réseau)
    // En production, utilisez uniquement les origines spécifiques
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware de logging pour debug (optionnel, à retirer en production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth/login')) {
      console.log(`\n🔐 [LOGIN REQUEST] ${req.method} ${req.path}`);
      console.log('   Body:', { email: req.body.email, password: req.body.password ? '***' : 'missing' });
    }
    next();
  });
}

// ✅ route de test
app.get("/", (req, res) => {
  res.send("🚀 Backend connecté !");
});
app.use('/api/admin', adminRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/vente', saleRoutes);
app.use('/api/achat', purchaseRoutes);
app.use('/api/rh', hrRoutes);
app.use('/api/equipements', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/finance', financeRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connecté:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté:', socket.id);
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
