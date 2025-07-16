const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createEvent = async (req, res) => {
  const { title, dateTime, location, capacity } = req.body;
  
  if (capacity > 1000 || capacity < 1) {
    return res.status(400).json({ error: 'Capacity must be between 1 and 1000' });
  }

  try {
    const event = await prisma.event.create({
      data: { title, dateTime, location, capacity }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { registrations: { include: { user: true } } 
    }});
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { registrations: { include: { user: true } }
    }})
    event ? res.json(event) : res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching event' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, dateTime, location, capacity } = req.body;
  
  if (capacity && (capacity > 1000 || capacity < 1)) {
    return res.status(400).json({ error: 'Capacity must be between 1 and 1000' });
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { title, dateTime, location, capacity }
    });
    res.json(updatedEvent);
  } catch (error) {
    res.status(404).json({ error: 'Event not found' });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Event not found' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};