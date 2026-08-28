import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

export const useWorkflowStore = create((set, get) => ({
  workflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isSaving: false,
  isExecuting: false,
  activeExecutionId: null,

  setWorkflow: (workflow) => {
    set({
      workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
      isDirty: false,
    });
  },

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      animated: true,
      style: { stroke: '#608bf9', strokeWidth: 2 },
    };
    set({
      edges: addEdge(newEdge, get().edges),
      isDirty: true,
    });
  },

  selectNode: (node) => {
    set({ selectedNode: node });
  },

  updateNodeData: (nodeId, newData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = { ...node, data: { ...node.data, ...newData } };
          if (state.selectedNode && state.selectedNode.id === nodeId) {
            return updated;
          }
          return updated;
        }
        return node;
      }),
      selectedNode:
        state.selectedNode && state.selectedNode.id === nodeId
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...newData } }
          : state.selectedNode,
      isDirty: true,
    }));
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNode: node,
      isDirty: true,
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      isDirty: true,
    }));
  },

  setSaving: (isSaving) => set({ isSaving }),
  setExecuting: (isExecuting, activeExecutionId = null) => set({ isExecuting, activeExecutionId }),
  resetDirty: () => set({ isDirty: false }),
}));
