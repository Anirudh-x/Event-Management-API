const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrations');

router.post('/:eventId/register/:userId', registrationController.registerUser);
router.delete('/:eventId/deregister/:userId', registrationController.deregisterUser);

module.exports = router;