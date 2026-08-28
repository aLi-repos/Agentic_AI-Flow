const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const Execution = require('../models/Execution');
const notificationService = require('../services/notificationService');

// In-memory registry to track active control flags (pause/cancel) per execution
const activeRunControls = new Map();

/**
 * Check if LangGraph is installed/available in the environment
 */
const checkLangGraphAvailability = () => {
  try {
    require.resolve('@langchain/langgraph');
    return 'available';
  } catch {
    try {
      require.resolve('langgraph');
      return 'available';
    } catch {
      return 'not-installed';
    }
  }
};

/**
 * Orchestrator
 * Coordinates the 5-agent pipeline across the full execution lifecycle
 */
class Orchestrator {
  /**
   * Pause a running execution
   */
  pauseExecution(executionId) {
    activeRunControls.set(executionId.toString(), 'PAUSED');
  }

  /**
   * Resume a paused execution
   */
  resumeExecution(executionId) {
    activeRunControls.delete(executionId.toString());
  }

  /**
   * Cancel a running execution
   */
  cancelExecution(executionId) {
    activeRunControls.set(executionId.toString(), 'CANCELLED');
  }

  /**
   * Run the full multi-agent orchestration loop
   */
  async run(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = execution.workflowSnapshot;
    const ownerId = execution.owner;
    const langGraphStatus = checkLangGraphAvailability();

    // Set status to RUNNING
    execution.status = 'RUNNING';
    execution.startTime = new Date();
    execution.orchestratorMetadata = {
      langGraph: langGraphStatus,
      confidenceScore: 1.0,
      plan: [],
    };
    await execution.save();

    monitoringAgent.emitStateChange(executionId, {
      status: 'RUNNING',
      startTime: execution.startTime,
      langGraph: langGraphStatus,
    });

    await monitoringAgent.logEvent({
      executionId,
      workflowId: workflow._id,
      agent: 'monitoring',
      level: 'info',
      message: `Orchestrator initialized. Substrate LangGraph: ${langGraphStatus}`,
      metadata: { langGraph: langGraphStatus },
    });

    const executionContext = {
      nodes: {},
      workflowInputs: execution.inputs || {},
    };

    try {
      // ----------------------------------------------------
      // Step 1: Planner Agent
      // ----------------------------------------------------
      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflow._id,
        agent: 'planner',
        level: 'info',
        message: 'Planner Agent analyzing graph topology and dependency order...',
      });

      const planResult = await plannerAgent.plan(workflow);

      execution.orchestratorMetadata.plan = planResult.plan;
      execution.orchestratorMetadata.confidenceScore = planResult.confidenceScore;
      await execution.save();

      await monitoringAgent.recordMemory({
        workflowId: workflow._id,
        executionId,
        agentId: 'planner',
        key: 'execution_plan',
        value: planResult,
        confidenceScore: planResult.confidenceScore,
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflow._id,
        agent: 'planner',
        level: 'success',
        message: `Plan generated: ${planResult.plan.length} nodes scheduled. Confidence: ${(planResult.confidenceScore * 100).toFixed(1)}%`,
        metadata: planResult,
      });

      // ----------------------------------------------------
      // Step 2-5: Execute each node in planned order
      // ----------------------------------------------------
      const nodesMap = new Map((workflow.nodes || []).map((n) => [n.id, n]));

      for (let i = 0; i < planResult.plan.length; i++) {
        const nodeId = planResult.plan[i];
        const node = nodesMap.get(nodeId);

        if (!node) continue;

        // Check for pause / cancel signals
        const controlSignal = activeRunControls.get(executionId.toString());
        if (controlSignal === 'CANCELLED') {
          execution.status = 'CANCELLED';
          execution.endTime = new Date();
          execution.duration = execution.endTime - execution.startTime;
          await execution.save();

          monitoringAgent.emitStateChange(executionId, { status: 'CANCELLED' });
          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflow._id,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: 'Execution was cancelled by operator.',
          });
          return;
        }

        if (controlSignal === 'PAUSED') {
          execution.status = 'PAUSED';
          execution.currentNode = nodeId;
          await execution.save();

          monitoringAgent.emitStateChange(executionId, { status: 'PAUSED', currentNode: nodeId });
          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflow._id,
            nodeId,
            agent: 'monitoring',
            level: 'warning',
            message: `Execution paused at node "${node.data?.label || nodeId}". Waiting for operator resume.`,
          });
          return;
        }

        // Update current node
        execution.currentNode = nodeId;
        await execution.save();
        monitoringAgent.emitStateChange(executionId, { currentNode: nodeId });

        // Node Execution with Recovery Agent loop
        let nodeSuccess = false;
        let attempt = 0;
        let nodeOutput = null;

        while (!nodeSuccess && attempt <= 3) {
          try {
            await monitoringAgent.logEvent({
              executionId,
              workflowId: workflow._id,
              nodeId,
              agent: 'execution',
              level: 'info',
              message: `Execution Agent running node "${node.data?.label || nodeId}" (${node.type})...`,
              metadata: { attempt: attempt + 1 },
            });

            // Run Node
            nodeOutput = await executionAgent.executeNode(node, executionContext, ownerId);

            // Step 3: Validation Agent
            const validation = await validationAgent.validate(node, nodeOutput);
            if (!validation.isValid) {
              const valError = new Error(validation.message);
              valError.code = 'MISSING_FIELDS';
              throw valError;
            }

            await monitoringAgent.logEvent({
              executionId,
              workflowId: workflow._id,
              nodeId,
              agent: 'validation',
              level: 'success',
              message: validation.message,
              metadata: { outputPreview: nodeOutput },
            });

            // Save to execution context
            executionContext.nodes[nodeId] = { output: nodeOutput };
            if (!execution.nodeOutputs) execution.nodeOutputs = {};
            execution.nodeOutputs[nodeId] = nodeOutput;
            nodeSuccess = true;

          } catch (nodeError) {
            attempt++;
            execution.retryCount = (execution.retryCount || 0) + 1;

            // Step 4: Recovery Agent
            const recoveryDecision = await recoveryAgent.handleFailure({
              error: nodeError,
              retryCount: attempt - 1,
              node,
            });

            await monitoringAgent.logEvent({
              executionId,
              workflowId: workflow._id,
              nodeId,
              agent: 'recovery',
              level: recoveryDecision.action === 'escalate' ? 'error' : 'warning',
              message: `Recovery Agent: [${recoveryDecision.classification}] ${recoveryDecision.reason}`,
              metadata: recoveryDecision,
            });

            if (recoveryDecision.action === 'retry_with_backoff') {
              execution.status = 'RETRYING';
              await execution.save();
              monitoringAgent.emitStateChange(executionId, { status: 'RETRYING' });

              await new Promise((r) => setTimeout(r, recoveryDecision.backoffMs));
            } else {
              // Escalate and fail
              throw nodeError;
            }
          }
        }
      }

      // ----------------------------------------------------
      // Execution Completed Successfully
      // ----------------------------------------------------
      execution.status = 'COMPLETED';
      execution.currentNode = null;
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.outputs = executionContext.nodes;
      await execution.save();

      monitoringAgent.emitStateChange(executionId, {
        status: 'COMPLETED',
        endTime: execution.endTime,
        duration: execution.duration,
        outputs: execution.outputs,
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflow._id,
        agent: 'monitoring',
        level: 'success',
        message: `Execution completed successfully in ${execution.duration}ms.`,
      });

      // Send user notification
      await notificationService.createNotification({
        owner: ownerId,
        workflowId: workflow._id,
        executionId,
        type: 'success',
        title: `Workflow "${workflow.name}" Succeeded`,
        message: `Finished executing ${planResult.plan.length} nodes in ${(execution.duration / 1000).toFixed(2)}s.`,
      });

    } catch (finalError) {
      // ----------------------------------------------------
      // Execution Failed / Escalated
      // ----------------------------------------------------
      execution.status = 'FAILED';
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.error = {
        message: finalError.message,
        code: finalError.code || 'EXECUTION_FAILED',
        nodeId: execution.currentNode,
      };
      await execution.save();

      monitoringAgent.emitStateChange(executionId, {
        status: 'FAILED',
        error: execution.error,
        duration: execution.duration,
      });

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflow._id,
        nodeId: execution.currentNode,
        agent: 'monitoring',
        level: 'error',
        message: `Execution terminated with error: ${finalError.message}`,
        metadata: execution.error,
      });

      await notificationService.createNotification({
        owner: ownerId,
        workflowId: workflow._id,
        executionId,
        type: 'escalation',
        title: `Workflow "${workflow.name}" Escalation`,
        message: `Failed at node "${execution.currentNode}": ${finalError.message}`,
      });
    } finally {
      activeRunControls.delete(executionId.toString());
    }
  }
}

module.exports = new Orchestrator();
