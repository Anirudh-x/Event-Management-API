const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const user = await prisma.user.create({ 
      data: { name, email } 
    });
    res.status(201).json({ id: user.id });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Error creating user' });
    }
  }
};

module.exports = { createUser };