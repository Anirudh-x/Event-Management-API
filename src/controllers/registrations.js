const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { eventId, userId } = req.params;
  
  try {
    // Check event capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true }
    });
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ error: 'Event at full capacity' });
    }
    
    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId }
    });
    
    if (existingRegistration) {
      return res.status(400).json({ error: 'User already registered' });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: { eventId, userId }
    });
    
    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User or event not found' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

const deregisterUser = async (req, res) => {
  const { eventId, userId } = req.params;
  
  try {
    await prisma.eventRegistration.deleteMany({
      where: { eventId, userId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Deregistration failed' });
  }
};

module.exports = {
  registerUser,
  deregisterUser
};