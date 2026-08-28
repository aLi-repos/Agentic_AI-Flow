/**
 * Planner Agent
 * Decides node ordering, resolves dependencies, and calculates a confidence score
 */
class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  /**
   * Plans the execution order of nodes given the workflow graph topology
   * @param {Object} workflow
   * @returns {{plan: Array<string>, confidenceScore: number, stages: Array<any>}}
   */
  async plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      return {
        plan: [],
        confidenceScore: 0.0,
        stages: [],
        reasoning: 'Workflow contains no nodes.',
      };
    }

    // Build in-degree map and adjacency list
    const inDegree = {};
    const adj = {};
    nodes.forEach((node) => {
      inDegree[node.id] = 0;
      adj[node.id] = [];
    });

    edges.forEach((edge) => {
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
      }
      if (adj[edge.source]) {
        adj[edge.source].push(edge.target);
      }
    });

    // Topological Sort (Kahn's Algorithm)
    const queue = [];
    nodes.forEach((node) => {
      if (inDegree[node.id] === 0) {
        queue.push(node.id);
      }
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const current = queue.shift();
      executionPlan.push(current);

      if (adj[current]) {
        adj[current].forEach((neighbor) => {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        });
      }
    }

    // If topological sort missed nodes (cycle detected), append remaining
    if (executionPlan.length < nodes.length) {
      const visited = new Set(executionPlan);
      nodes.forEach((n) => {
        if (!visited.has(n.id)) {
          executionPlan.push(n.id);
        }
      });
    }

    // Calculate confidence score
    let confidence = 0.95;
    if (nodes.some((n) => !n.data || !n.type)) {
      confidence -= 0.15;
    }
    if (executionPlan.length < nodes.length) {
      confidence -= 0.25; // cycle penalty
    }

    const stages = executionPlan.map((nodeId, idx) => {
      const node = nodes.find((n) => n.id === nodeId);
      return {
        step: idx + 1,
        nodeId,
        type: node ? node.type : 'unknown',
        label: node && node.data ? node.data.label : nodeId,
      };
    });

    return {
      plan: executionPlan,
      confidenceScore: Math.max(0.1, Math.min(1.0, confidence)),
      stages,
      reasoning: `Planned ${executionPlan.length} sequential execution stages based on graph dependencies.`,
    };
  }
}

module.exports = new PlannerAgent();
