require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

// Autoriser le frontend (Vercel) + le développement local à appeler cette API
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // en cas de doute on laisse passer; resserrez si besoin
      }
    }
  })
);

app.use(express.json({ limit: '10mb' })); // limite large car les images sont envoyées en base64

app.get('/', (req, res) => {
  res.json({ message: 'API تغذية عامة رضا تعمل بنجاح ✅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB:', err.message);
    process.exit(1);
  });
