const executionService = require('../services/executionService');

const listExecutions = async (req, res, next) => {
  try {
    const { workflowId, status, page, limit } = req.query;
    const result = await executionService.listExecutions(req.user.id, { workflowId, status, page, limit });
    return res.status(200).json({
      success: true,
      data: result.executions,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getExecution = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (err) {
    next(err);
  }
};

const getExecutionTimeline = async (req, res, next) => {
  try {
    const timeline = await executionService.getExecutionTimeline(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (err) {
    next(err);
  }
};

const pauseExecution = async (req, res, next) => {
  try {
    const result = await executionService.pauseExecution(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Execution paused successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const resumeExecution = async (req, res, next) => {
  try {
    const result = await executionService.resumeExecution(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Execution resumed successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const cancelExecution = async (req, res, next) => {
  try {
    const result = await executionService.cancelExecution(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Execution cancelled',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listExecutions,
  getExecution,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
