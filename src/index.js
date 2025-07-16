require('dotenv').config();
const express = require('express');
const HelloRoute = require('./routes/hello.js');

const app = express();
const port = process.env.PORT || 5001;


app.use(express.json());

app.use("/", HelloRoute);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}/`);
});