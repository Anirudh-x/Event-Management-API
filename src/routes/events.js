const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events');
const { validateEventInput, sanitizeInput } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');


// Rate limiter for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many registration attempts. Please try again later.'
      }
    });
  }
});

// a. Create Event
router.post('/', validateEventInput, eventController.createEvent);
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