require('dotenv').config();
const express = require('express');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}/`);
});