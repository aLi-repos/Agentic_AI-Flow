import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes/CustomNodes';
import { useWorkflowStore } from '../../store/workflowStore';

const CanvasInner = ({ readonly = false, onExecute }) => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    addNode,
  } = useWorkflowStore();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (readonly) return;

      const type = event.dataTransfer.getData('application/agentflow-node-type');
      const label = event.dataTransfer.getData('application/agentflow-node-label');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}_${Date.now().toString(36)}`,
        type,
        position,
        data: {
          label: label || `New ${type}`,
          type,
          description: `Configured ${type} step`,
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode, readonly]
  );

  const handleNodeClick = useCallback(
    (event, node) => {
      selectNode(node);
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onConnect={readonly ? undefined : onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#608bf9', strokeWidth: 2 },
        }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-surface-100 !border-white/10 !shadow-xl" />
        <MiniMap
          nodeStrokeColor="#3b66f5"
          nodeColor="#1e293b"
          nodeBorderRadius={8}
          maskColor="rgba(6, 9, 17, 0.75)"
          className="!bg-surface-900 !border-white/10 !rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvas = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;
