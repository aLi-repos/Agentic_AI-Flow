const express = require('express');
const executionController = require('../controllers/executionController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/timeline', executionController.getExecutionTimeline);
router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;
