const { body } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Input validation middleware
const validateEventInput = [
  body('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),

  body('dateTime')
    .isISO8601()
    .withMessage('Invalid date format (use ISO 8601)')
    .custom(value => new Date(value) > new Date())
    .withMessage('Event date must be in the future'),

  body('location')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters'),

  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be an integer between 1 and 1000')
];

// User creation validation
const validateUserInput = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async email => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) throw new Error('Email already in use');
    })
];

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  }
  next();
};

module.exports = { validateEventInput, validateUserInput, sanitizeInput };