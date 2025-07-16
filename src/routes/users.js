const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { sanitizeInput } = require('../middleware/validation');

router.post('/', sanitizeInput, userController.createUser);
module.exports = router;