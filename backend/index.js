const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const citizenRoutes = require('./routes/citizens');
const deptRoutes = require('./routes/departments');
const servicesRoutes = require('./routes/services');
const applicationsRoutes = require('./routes/applications');
const grievancesRoutes = require('./routes/grievances');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/citizens', citizenRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/services', servicesRoutes); // Fixed typo: was /api/sercices
app.use('/api/applications', applicationsRoutes);
app.use('/api/grievances', grievancesRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});