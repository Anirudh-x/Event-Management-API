const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const HelloRoute = async (req, res) => {
  res.status(201).json("Hello");
};


module.exports = {
  HelloRoute
};