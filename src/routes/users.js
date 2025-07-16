const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const { validateUserInput } = require('../middleware/validation');

router.post('/', validateUserInput, userController.createUser);
module.exports = router;