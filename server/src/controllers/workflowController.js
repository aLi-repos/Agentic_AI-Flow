const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');
const executionService = require('../services/executionService');

const listWorkflows = async (req, res, next) => {
  try {
    const { search, status, tag, page, limit } = req.query;
    const result = await workflowService.listWorkflows(req.user.id, { search, status, tag, page, limit });
    return res.status(200).json({
      success: true,
      data: result.workflows,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

const getWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (err) {
    next(err);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: workflow,
    });
  } catch (err) {
    next(err);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflow,
    });
  } catch (err) {
    next(err);
  }
};

const duplicateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
    return res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      data: workflow,
    });
  } catch (err) {
    next(err);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const result = await workflowService.deleteWorkflow(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

const generateWorkflow = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const generated = await aiService.generateWorkflowFromPrompt(prompt);
    return res.status(200).json({
      success: true,
      message: 'Workflow generated successfully from AI prompt',
      data: generated,
    });
  } catch (err) {
    next(err);
  }
};

const executeWorkflow = async (req, res, next) => {
  try {
    const { inputs } = req.body;
    const execution = await executionService.triggerExecution(req.params.id, req.user.id, inputs);
    return res.status(202).json({
      success: true,
      message: 'Workflow execution triggered',
      data: execution,
    });
  } catch (err) {
    next(err);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const stats = await workflowService.getDashboardStats(req.user.id);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateWorkflow,
  executeWorkflow,
  getDashboard,
};
