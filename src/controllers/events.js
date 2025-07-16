const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateStats } = require('../utils/eventUtils');

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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get event with lock
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { id: true, dateTime: true, capacity: true }
      });

      if (!event) throw new Error('EVENT_NOT_FOUND');
      
      // 2. Check date
      if (new Date(event.dateTime) < new Date()) {
        throw new Error('PAST_EVENT');
      }

      // 3. Check existing registration
      const existing = await tx.eventRegistration.findFirst({
        where: { eventId, userId }
      });
      if (existing) throw new Error('DUPLICATE_REGISTRATION');

      // 4. Check capacity with atomic count
      const regCount = await tx.eventRegistration.count({ where: { eventId } });
      if (regCount >= event.capacity) throw new Error('FULL_CAPACITY');

      // 5. Create registration
      return tx.eventRegistration.create({
        data: { eventId, userId }
      });
    });

    res.status(201).json({ 
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    // Error handling with standardized format
    const errors = {
      EVENT_NOT_FOUND: { 
        status: 404, 
        message: 'Event not found' 
      },
      PAST_EVENT: { 
        status: 400, 
        message: 'Cannot register for past events' 
      },
      DUPLICATE_REGISTRATION: { 
        status: 409, 
        message: 'User already registered for this event' 
      },
      FULL_CAPACITY: { 
        status: 400, 
        message: 'Event has reached maximum capacity' 
      }
    };

    const errorInfo = errors[error.message] || { 
      status: 500, 
      message: 'Registration failed' 
    };

    res.status(errorInfo.status).json({
      error: {
        code: error.message,
        message: errorInfo.message
      }
    });
  }
};

// d. Cancel Registration
const cancelRegistration = async (req, res) => {
  const { eventId, userId } = req.params;
  
  try {
    const { count } = await prisma.eventRegistration.deleteMany({
      where: { eventId, userId }
    });
    
    if (count === 0) {
      return res.status(404).json({
        error: {
          code: 'REGISTRATION_NOT_FOUND',
          message: 'No registration found for this user and event'
        }
      });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'CANCELLATION_FAILED',
        message: 'Failed to cancel registration'
      }
    });
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
    const [event, regCount] = await Promise.all([
      prisma.event.findUnique({ where: { id } }),
      prisma.eventRegistration.count({ where: { eventId: id } })
    ]);
    
    if (!event) {
      return res.status(404).json({
        error: {
          code: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        }
      });
    }
    
    res.json(calculateStats(event, regCount));
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve event statistics'
      }
    });
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