require('dotenv').config();
const express = require('express');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pipeline
app.use(express.json());
app.use(sanitizeInput);

// Routes
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'Requested endpoint does not exist'
    }
  });
});

// Error handler
app.use(errorHandler);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Prisma error handling
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

function handlePrismaError(err, res) {
  switch (err.code) {
    case 'P2002':
      return res.status(409).json({
        error: `Unique constraint failed on ${err.meta.target}`
      });
    case 'P2025':
      return res.status(404).json({ error: 'Resource not found' });
    case 'P2003':
      return res.status(400).json({
        error: `Foreign key constraint failed: ${err.meta.field_name}`
      });
    default:
      return res.status(500).json({
        error: `Database error: ${err.code}`
      });
  }
}
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}/`);
});