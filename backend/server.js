const express = require('express');
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

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

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

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});


// Middleware erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
