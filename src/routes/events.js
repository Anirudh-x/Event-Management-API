const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events');
const { validateEventInput, sanitizeInput } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');


// Rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many registration attempts, please try again later'
});

// a. Create Event
router.post('/', sanitizeInput, validateEventInput, eventController.createEvent);

// b. Get Event Details
router.get('/:id', eventController.getEventDetails);

// c. Register for Event
router.post(
  '/:eventId/register/:userId',
  registrationLimiter,
  eventController.registerForEvent
);

// d. Cancel Registration
router.delete('/:eventId/cancel/:userId', eventController.cancelRegistration);

// e. List Upcoming Events
router.get('/upcoming/list', eventController.getUpcomingEvents);

// f. Event Stats
router.get('/:id/stats', eventController.getEventStats);

module.exports = router;