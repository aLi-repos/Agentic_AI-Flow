const axios = require('axios');
const env = require('../config/env');

/**
 * Deterministic Rule-Based Graph Builder
 * Converts plain natural language into valid DAG nodes and edges with coordinates
 */
const buildDeterministicWorkflow = (prompt) => {
  const p = (prompt || '').toLowerCase();
  const nodes = [];
  const edges = [];
  let currentX = 100;
  const currentY = 200;
  const stepX = 320;

  // 1. Initial Trigger Node
  const triggerId = 'trigger_1';
  nodes.push({
    id: triggerId,
    type: 'trigger',
    position: { x: currentX, y: currentY },
    data: {
      label: 'Webhook Trigger',
      triggerType: p.includes('schedule') || p.includes('daily') || p.includes('hourly') ? 'schedule' : 'webhook',
      description: 'Captures incoming operations events and initiates the agentic pipeline.',
      config: {
        eventType: 'operations_event',
        schedule: p.includes('daily') ? '0 9 * * *' : 'manual',
      },
    },
  });
  currentX += stepX;

  let lastNodeId = triggerId;

  // 2. AI Reasoning / Analysis Node
  const aiId = 'ai_task_1';
  let aiModel = 'gemini-1.5-flash';
  let systemPrompt = 'Analyze incoming payload, extract key entities, classify urgency, and generate formatted summary.';
  
  if (p.includes('invoice') || p.includes('bill') || p.includes('receipt')) {
    systemPrompt = 'Extract invoice number, total amount, vendor name, line items, and due date from the document.';
  } else if (p.includes('support') || p.includes('ticket') || p.includes('triage')) {
    systemPrompt = 'Classify customer support ticket priority (P1/P2/P3), detect sentiment, and draft recommended response.';
  } else if (p.includes('alert') || p.includes('monitor') || p.includes('error')) {
    systemPrompt = 'Analyze system error log, diagnose root cause, and determine incident severity level.';
  }

  nodes.push({
    id: aiId,
    type: 'aiTask',
    position: { x: currentX, y: currentY },
    data: {
      label: 'AI Reasoner & Classifier',
      model: aiModel,
      prompt: systemPrompt,
      temperature: 0.2,
      inputMapping: '{{nodes.trigger_1.output}}',
    },
  });
  edges.push({
    id: `e-${lastNodeId}-${aiId}`,
    source: lastNodeId,
    target: aiId,
    animated: true,
  });
  lastNodeId = aiId;
  currentX += stepX;

  // 3. Condition / Filter if prompt mentions "if", "urgent", "priority", "filter"
  if (p.includes('if') || p.includes('urgent') || p.includes('priority') || p.includes('route') || p.includes('filter')) {
    const conditionId = 'condition_1';
    nodes.push({
      id: conditionId,
      type: 'condition',
      position: { x: currentX, y: currentY },
      data: {
        label: 'Priority Evaluator',
        field: 'priority',
        operator: 'equals',
        value: 'URGENT',
        description: 'Branch execution based on AI severity classification.',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${conditionId}`,
      source: lastNodeId,
      target: conditionId,
      animated: true,
    });
    lastNodeId = conditionId;
    currentX += stepX;
  }

  // 4. Slack or Discord Integration
  if (p.includes('slack') || (!p.includes('discord') && !p.includes('email') && !p.includes('sheet'))) {
    const slackId = 'slack_1';
    nodes.push({
      id: slackId,
      type: 'slack',
      position: { x: currentX, y: currentY - 60 },
      data: {
        label: 'Post to Slack',
        channel: '#ops-alerts',
        message: '🚨 *Automated Alert*: {{nodes.ai_task_1.output.summary}}',
        action: 'post_message',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${slackId}`,
      source: lastNodeId,
      target: slackId,
      animated: true,
    });
  }

  if (p.includes('discord')) {
    const discordId = 'discord_1';
    nodes.push({
      id: discordId,
      type: 'discord',
      position: { x: currentX, y: currentY + 60 },
      data: {
        label: 'Notify Discord',
        channelId: 'general',
        message: '📢 **Operations Update**: {{nodes.ai_task_1.output.summary}}',
        action: 'post_message',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${discordId}`,
      source: lastNodeId,
      target: discordId,
      animated: true,
    });
  }

  // 5. Gmail / Email Integration
  if (p.includes('email') || p.includes('mail') || p.includes('gmail') || p.includes('notify')) {
    const emailX = currentX + (nodes.some(n => n.type === 'slack' || n.type === 'discord') ? stepX : 0);
    const emailId = 'gmail_1';
    nodes.push({
      id: emailId,
      type: 'gmail',
      position: { x: emailX, y: currentY - 60 },
      data: {
        label: 'Dispatch Gmail',
        to: 'team-leads@enterprise.internal',
        subject: 'Automated Operations Report: {{nodes.ai_task_1.output.title}}',
        body: '<p>Workflow completed successfully.</p><p>Summary: {{nodes.ai_task_1.output.summary}}</p>',
        action: 'send_email',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${emailId}`,
      source: lastNodeId,
      target: emailId,
      animated: true,
    });
  }

  // 6. Google Sheets Integration
  if (p.includes('sheet') || p.includes('table') || p.includes('spreadsheet') || p.includes('log') || p.includes('record')) {
    const sheetX = currentX + stepX;
    const sheetId = 'sheets_1';
    nodes.push({
      id: sheetId,
      type: 'googleSheets',
      position: { x: sheetX, y: currentY + 60 },
      data: {
        label: 'Log to Google Sheets',
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetName: 'AuditLogs',
        action: 'append_row',
        values: '["{{timestamp}}", "{{nodes.ai_task_1.output.category}}", "{{nodes.ai_task_1.output.score}}"]',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${sheetId}`,
      source: lastNodeId,
      target: sheetId,
      animated: true,
    });
  }

  // Fallback if only trigger & AI were created
  if (nodes.length === 2) {
    const defaultNotifyId = 'slack_1';
    nodes.push({
      id: defaultNotifyId,
      type: 'slack',
      position: { x: currentX, y: currentY },
      data: {
        label: 'Send Team Notification',
        channel: '#general',
        message: 'Workflow Result: {{nodes.ai_task_1.output.summary}}',
        action: 'post_message',
      },
    });
    edges.push({
      id: `e-${lastNodeId}-${defaultNotifyId}`,
      source: lastNodeId,
      target: defaultNotifyId,
      animated: true,
    });
  }

  return {
    name: prompt ? prompt.slice(0, 50).trim() : 'AI Generated Workflow',
    description: `Automated agentic workflow generated from prompt: "${prompt}"`,
    triggerConfig: { type: 'manual' },
    nodes,
    edges,
    tags: ['AI Generated', 'Automation'],
    generatorUsed: 'deterministic-rule-engine',
  };
};

/**
 * Generate complete workflow using OpenRouter, Gemini, or Deterministic fallback
 */
const generateWorkflowFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Please provide a valid natural language prompt');
  }

  // 1. Try OpenRouter if API key is provided
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log('🤖 Generating workflow with OpenRouter API...');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI workflow architect for Agentflow_AI. Convert the user prompt into a structured JSON workflow graph with nodes and edges.
Available node types: trigger, aiTask, gmail, slack, discord, googleSheets, condition.
Return ONLY valid JSON matching this structure:
{
  "name": "Short descriptive workflow name",
  "description": "Workflow summary",
  "nodes": [
    {
      "id": "trigger_1",
      "type": "trigger",
      "position": { "x": 100, "y": 200 },
      "data": { "label": "Webhook Trigger", "triggerType": "webhook", "config": {} }
    },
    ...
  ],
  "edges": [
    { "id": "e1-2", "source": "trigger_1", "target": "ai_task_1", "animated": true }
  ],
  "tags": ["Ops", "Automated"]
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const parsed = JSON.parse(response.data.choices[0].message.content);
      if (parsed.nodes && parsed.nodes.length > 0) {
        parsed.generatorUsed = 'openrouter-llama-3.3';
        return parsed;
      }
    } catch (err) {
      console.warn('⚠️ OpenRouter generation failed, falling back to Gemini:', err.message);
    }
  }

  // 2. Try Google Gemini if API key is provided
  if (env.GEMINI_API_KEY) {
    try {
      console.log('🤖 Generating workflow with Google Gemini API...');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Convert this prompt into a structured JSON workflow graph with nodes and edges for Agentflow_AI:
Prompt: "${prompt}"
Return ONLY valid JSON with keys: name, description, nodes (with id, type, position {x, y}, data {label, ...}), edges (with id, source, target, animated: true), tags.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          }
        },
        { timeout: 15000 }
      );

      const rawJson = response.data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawJson);
      if (parsed.nodes && parsed.nodes.length > 0) {
        parsed.generatorUsed = 'google-gemini-1.5-flash';
        return parsed;
      }
    } catch (err) {
      console.warn('⚠️ Gemini generation failed, falling back to Deterministic Engine:', err.message);
    }
  }

  // 3. High-Quality Deterministic Rule-Based Fallback
  console.log('⚡ Generating workflow via Deterministic Rule Engine...');
  return buildDeterministicWorkflow(prompt);
};

module.exports = {
  generateWorkflowFromPrompt,
  buildDeterministicWorkflow,
};
