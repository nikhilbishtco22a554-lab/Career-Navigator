const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const roadmapRoutes = require('./routes/roadmap');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
if (!MONGO_URI) { console.error('Missing MONGO_URI'); process.exit(1); }
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
mongoose.connect(MONGO_URI)
  .then(() => { console.log('MongoDB connected'); app.listen(PORT, () => console.log('Server on port ' + PORT)); })
  .catch((err) => { console.error(err); process.exit(1); });
