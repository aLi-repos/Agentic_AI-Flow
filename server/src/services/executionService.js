const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const { addExecutionJob } = require('../queues/executionQueue');
const orchestrator = require('../agents/orchestrator');

const listExecutions = async (ownerId, { workflowId, status, page = 1, limit = 20 } = {}) => {
  const query = { owner: ownerId };
  if (workflowId) query.workflowId = workflowId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [executions, total] = await Promise.all([
    Execution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('workflowId', 'name tags')
      .lean(),
    Execution.countDocuments(query),
  ]);

  return {
    executions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getExecutionById = async (id, ownerId) => {
  const execution = await Execution.findOne({ _id: id, owner: ownerId })
    .populate('workflowId', 'name description tags')
    .lean();

  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  return execution;
};

const getExecutionTimeline = async (id, ownerId) => {
  const execution = await Execution.findOne({ _id: id, owner: ownerId }).select('_id');
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  const logs = await ExecutionLog.find({ executionId: id }).sort({ timestamp: 1 }).lean();
  return logs;
};

const triggerExecution = async (workflowId, ownerId, inputs = {}) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: ownerId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  // Create immutable snapshot of workflow
  const execution = await Execution.create({
    workflowId: workflow._id,
    workflowSnapshot: workflow.toObject(),
    status: 'PENDING',
    inputs,
    owner: ownerId,
    startTime: new Date(),
  });

  // Enqueue execution in BullMQ / memory queue
  await addExecutionJob(execution._id, { ownerId });

  return execution;
};

const pauseExecution = async (id, ownerId) => {
  const execution = await Execution.findOne({ _id: id, owner: ownerId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  if (execution.status !== 'RUNNING' && execution.status !== 'RETRYING') {
    const err = new Error(`Cannot pause execution with status ${execution.status}`);
    err.statusCode = 400;
    throw err;
  }

  orchestrator.pauseExecution(id);
  execution.status = 'PAUSED';
  await execution.save();

  return { success: true, status: 'PAUSED', executionId: id };
};

const resumeExecution = async (id, ownerId) => {
  const execution = await Execution.findOne({ _id: id, owner: ownerId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  if (execution.status !== 'PAUSED') {
    const err = new Error(`Cannot resume execution with status ${execution.status}`);
    err.statusCode = 400;
    throw err;
  }

  orchestrator.resumeExecution(id);
  // Re-enqueue or re-trigger the execution loop
  await addExecutionJob(execution._id, { ownerId });

  return { success: true, status: 'RESUMED', executionId: id };
};

const cancelExecution = async (id, ownerId) => {
  const execution = await Execution.findOne({ _id: id, owner: ownerId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  if (execution.status === 'COMPLETED' || execution.status === 'FAILED' || execution.status === 'CANCELLED') {
    const err = new Error(`Execution is already terminated with status ${execution.status}`);
    err.statusCode = 400;
    throw err;
  }

  orchestrator.cancelExecution(id);
  execution.status = 'CANCELLED';
  execution.endTime = new Date();
  execution.duration = execution.endTime - execution.startTime;
  await execution.save();

  return { success: true, status: 'CANCELLED', executionId: id };
};

module.exports = {
  listExecutions,
  getExecutionById,
  getExecutionTimeline,
  triggerExecution,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
