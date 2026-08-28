const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Protected routes
router.use(authenticate);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    validate,
  ],
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt string is required'),
    validate,
  ],
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
