const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');

const listWorkflows = async (ownerId, { search, status, tag, page = 1, limit = 20 } = {}) => {
  const query = { owner: ownerId };

  if (status) {
    query.status = status;
  }
  if (tag) {
    query.tags = tag;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [workflows, total] = await Promise.all([
    Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Workflow.countDocuments(query),
  ]);

  return {
    workflows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getWorkflowById = async (id, ownerId) => {
  const workflow = await Workflow.findOne({ _id: id, owner: ownerId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }
  return workflow;
};

const createWorkflow = async (ownerId, data) => {
  const workflow = await Workflow.create({
    ...data,
    owner: ownerId,
    version: 1,
  });
  return workflow;
};

const updateWorkflow = async (id, ownerId, data) => {
  const workflow = await Workflow.findOne({ _id: id, owner: ownerId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.name !== undefined) workflow.name = data.name;
  if (data.description !== undefined) workflow.description = data.description;
  if (data.status !== undefined) workflow.status = data.status;
  if (data.triggerConfig !== undefined) workflow.triggerConfig = data.triggerConfig;
  if (data.nodes !== undefined) workflow.nodes = data.nodes;
  if (data.edges !== undefined) workflow.edges = data.edges;
  if (data.tags !== undefined) workflow.tags = data.tags;

  workflow.version = (workflow.version || 1) + 1;

  await workflow.save();
  return workflow;
};

const duplicateWorkflow = async (id, ownerId) => {
  const source = await Workflow.findOne({ _id: id, owner: ownerId });
  if (!source) {
    const err = new Error('Source workflow not found');
    err.statusCode = 404;
    throw err;
  }

  const clone = await Workflow.create({
    name: `${source.name} (Copy)`,
    description: source.description,
    owner: ownerId,
    status: 'draft',
    triggerConfig: source.triggerConfig,
    nodes: source.nodes,
    edges: source.edges,
    tags: [...source.tags, 'Cloned'],
    version: 1,
  });

  return clone;
};

const deleteWorkflow = async (id, ownerId) => {
  const result = await Workflow.findOneAndDelete({ _id: id, owner: ownerId });
  if (!result) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }
  return { success: true, message: 'Workflow deleted successfully' };
};

const getDashboardStats = async (ownerId) => {
  const [totalWorkflows, activeWorkflows, executions, recentExecutions] = await Promise.all([
    Workflow.countDocuments({ owner: ownerId }),
    Workflow.countDocuments({ owner: ownerId, status: 'active' }),
    Execution.find({ owner: ownerId }).select('status duration createdAt').lean(),
    Execution.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('workflowId', 'name tags')
      .lean(),
  ]);

  const totalRuns = executions.length;
  const completedRuns = executions.filter((e) => e.status === 'COMPLETED').length;
  const failedRuns = executions.filter((e) => e.status === 'FAILED').length;
  const activeRuns = executions.filter((e) => e.status === 'RUNNING' || e.status === 'RETRYING').length;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;

  const totalDuration = executions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const avgDuration = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;

  return {
    metrics: {
      totalWorkflows,
      activeWorkflows,
      totalRuns,
      completedRuns,
      failedRuns,
      activeRuns,
      successRate,
      avgDuration,
    },
    recentExecutions,
  };
};

module.exports = {
  listWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  getDashboardStats,
};
