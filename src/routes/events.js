const express = require('express');
const router = express.Router();
const eventController = require('../controllers/events');

// a. Create Event
router.post('/', eventController.createEvent);

// b. Get Event Details
router.get('/:id', eventController.getEventDetails);

// c. Register for Event
router.post('/:eventId/register/:userId', eventController.registerForEvent);

// d. Cancel Registration
router.delete('/:eventId/cancel/:userId', eventController.cancelRegistration);

// e. List Upcoming Events
router.get('/upcoming/list', eventController.getUpcomingEvents);

// f. Event Stats
router.get('/:id/stats', eventController.getEventStats);

module.exports = router;