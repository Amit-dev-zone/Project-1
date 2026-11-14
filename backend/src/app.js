const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./interfaces/routes');
const errorHandler = require('./interfaces/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API v1 root router
app.use('/api/v1', routes);

// 404 Route Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
