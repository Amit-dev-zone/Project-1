const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/openapi.json');
const routes = require('./interfaces/routes');
const errorHandler = require('./interfaces/middleware/errorHandler');

const app = express();

// Security headers (relaxed CSP for Swagger UI explorer compatibility)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Interactive Swagger/OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));

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
