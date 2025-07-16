const express = require('express');
const router = express.Router();
const { HelloRoute } = require('../controllers/hello');

router.get('/', HelloRoute);

module.exports = router;