const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// a. Create Event
const createEvent = async (req, res) => {
  const { title, dateTime, location, capacity } = req.body;
  
  // Capacity validation
  if (!capacity || capacity < 1 || capacity > 1000) {
    return res.status(400).json({ error: 'Capacity must be between 1-1000' });
  }

  try {
    const event = await prisma.event.create({
      data: { title, dateTime, location, capacity }
    });
    res.status(201).json({ id: event.id });  // Return only ID
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
};

// b. Get Event Details
const getEventDetails = async (req, res) => {
  const { id } = req.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    res.json({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity,
      registrations: event.registrations.map(reg => ({
        userId: reg.user.id,
        name: reg.user.name,
        email: reg.user.email
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching event' });
  }
};

// c. Register for Event
const registerForEvent = async (req, res) => {
  const { eventId, userId } = req.params;

  try {
    // Get event with registration count
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } }
    });

    // Validate event
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    // Check capacity
    if (event._count.registrations >= event.capacity) {
      return res.status(400).json({ error: 'Event at full capacity' });
    }
    
    // Check date
    if (new Date(event.dateTime) < new Date()) {
      return res.status(400).json({ error: 'Cannot register for past events' });
    }

    // Check existing registration
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId }
    });
    
    if (existingRegistration) {
      return res.status(409).json({ error: 'User already registered' });
    }

    // Create registration
    await prisma.eventRegistration.create({
      data: { eventId, userId }
    });
    
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// d. Cancel Registration
const cancelRegistration = async (req, res) => {
  const { eventId, userId } = req.params;
  
  try {
    // Find registration
    const registration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId }
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    // Delete registration
    await prisma.eventRegistration.delete({
      where: { id: registration.id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};

// e. List Upcoming Events
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { dateTime: { gt: new Date() } },
      orderBy: [
        { dateTime: 'asc' },
        { location: 'asc' }
      ]
    });
    
    res.json(events.map(event => ({
      id: event.id,
      title: event.title,
      dateTime: event.dateTime,
      location: event.location,
      capacity: event.capacity
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
};

// f. Event Stats
const getEventStats = async (req, res) => {
  const { id } = req.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } }
    });
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const stats = {
      total_registrations: event._count.registrations,
      remaining_capacity: event.capacity - event._count.registrations,
      percentage_used: Math.round(
        (event._count.registrations / event.capacity) * 100
      )
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

module.exports = {
  createEvent,
  getEventDetails,
  registerForEvent,
  cancelRegistration,
  getUpcomingEvents,
  getEventStats
};