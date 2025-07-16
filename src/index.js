require('dotenv').config();
const express = require('express');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

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