require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const eventRoutes = require('./routes/events.js');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/events', eventRoutes);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}/`);
});