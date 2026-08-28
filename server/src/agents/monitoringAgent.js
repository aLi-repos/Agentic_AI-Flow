const ExecutionLog = require('../models/ExecutionLog');
const AgentMemory = require('../models/AgentMemory');
const { emitExecutionEvent } = require('../config/socket');

/**
 * Monitoring Agent
 * Emits real-time execution events, records audit logs, and preserves agent memory
 */
class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  /**
   * Log an agent event, persist to database and broadcast to Socket.IO room
   */
  async logEvent({
    executionId,
    workflowId,
    nodeId = null,
    agent,
    level = 'info',
    message,
    metadata = {},
  }) {
    try {
      const logEntry = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: new Date(),
      });

      // Broadcast real-time log event to subscribed execution room
      emitExecutionEvent(executionId.toString(), 'execution:log', {
        id: logEntry._id,
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp: logEntry.timestamp,
      });

      return logEntry;
    } catch (err) {
      console.error('Monitoring Agent failed to persist log:', err.message);
    }
  }

  /**
   * Record agent cross-step memory
   */
  async recordMemory({ workflowId, executionId, agentId, key, value, confidenceScore = 1.0 }) {
    try {
      return await AgentMemory.findOneAndUpdate(
        { executionId, agentId, key },
        { workflowId, value, confidenceScore, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Monitoring Agent failed to record memory:', err.message);
    }
  }

  /**
   * Broadcast state changes (e.g. status transition, current node change)
   */
  emitStateChange(executionId, payload) {
    emitExecutionEvent(executionId.toString(), 'execution:state', payload);
  }
}

module.exports = new MonitoringAgent();
