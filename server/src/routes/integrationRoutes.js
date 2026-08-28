const express = require('express');
const { body } = require('express-validator');
const integrationController = require('../controllers/integrationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// OAuth public redirects
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

// Protected endpoints
router.get('/', authenticate, integrationController.listIntegrations);
router.get('/status', authenticate, integrationController.getStatus);
router.delete('/:provider', authenticate, integrationController.disconnect);

router.post(
  '/',
  authenticate,
  [
    body('provider').isIn(['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini']).withMessage('Invalid provider'),
    body('credentials').notEmpty().withMessage('Credentials object is required'),
    validate,
  ],
  integrationController.saveManualIntegration
);

module.exports = router;
