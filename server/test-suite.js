const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Agentflow_AI Full-Stack Sanity Test Suite...\n');
  let token = '';
  let workflowId = '';
  let executionId = '';

  // 1. Health Check
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 1. Health Check Passed:', health.data.platform);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    process.exit(1);
  }

  // 2. Operator Registration
  try {
    const reg = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Lead Operator',
      email: 'operator@agentflow.io',
      password: 'Password123!',
      role: 'operator',
    });
    token = reg.data.data.token;
    console.log('✅ 2. Registration Passed: Created user', reg.data.data.user.email);
  } catch (err) {
    if (err.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding to login...');
    } else {
      console.error('❌ Registration failed:', err.response?.data || err.message);
      process.exit(1);
    }
  }

  // 3. Operator Login
  try {
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'operator@agentflow.io',
      password: 'Password123!',
    });
    token = login.data.data.token;
    console.log('✅ 3. Login Passed: Token issued successfully');
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 4. Prompt-to-Workflow AI Compiler
  try {
    const gen = await axios.post(
      `${BASE_URL}/workflows/generate`,
      { prompt: 'When an incoming error webhook arrives, analyze urgency with AI, branch if priority is urgent, and post to Slack and Gmail.' },
      { headers: authHeaders }
    );
    console.log('✅ 4. AI Workflow Compiler Passed:');
    console.log(`   - Generated ${gen.data.data.nodes.length} nodes and ${gen.data.data.edges.length} edges`);
    console.log(`   - Compiler engine: ${gen.data.data.generatorUsed}`);
  } catch (err) {
    console.error('❌ Workflow generation failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 5. Create Workflow
  try {
    const wf = await axios.post(
      `${BASE_URL}/workflows`,
      {
        name: 'Automated Support & Slack Dispatch',
        description: 'Autonomously triages tickets and notifies channel',
        status: 'active',
        nodes: [
          {
            id: 'trigger_1',
            type: 'trigger',
            position: { x: 100, y: 200 },
            data: { label: 'Ticket Webhook', triggerType: 'webhook' },
          },
          {
            id: 'ai_task_1',
            type: 'aiTask',
            position: { x: 420, y: 200 },
            data: {
              label: 'AI Classifier',
              prompt: 'Analyze support ticket severity and extract key customer intent',
            },
          },
          {
            id: 'slack_1',
            type: 'slack',
            position: { x: 740, y: 200 },
            data: {
              label: 'Slack Notification',
              channel: '#ops-triage',
              message: '🔔 *New Triage Event*: {{nodes.ai_task_1.output.summary}}',
            },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger_1', target: 'ai_task_1', animated: true },
          { id: 'e2', source: 'ai_task_1', target: 'slack_1', animated: true },
        ],
        tags: ['Support', 'Operations', 'AI'],
      },
      { headers: authHeaders }
    );
    workflowId = wf.data.data._id;
    console.log('✅ 5. Workflow Creation Passed: Workflow ID', workflowId);
  } catch (err) {
    console.error('❌ Workflow creation failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 6. Execute Workflow through 5-Agent Pipeline
  try {
    const exec = await axios.post(
      `${BASE_URL}/workflows/${workflowId}/execute`,
      { inputs: { ticketId: 'TCK-8941', customer: 'Acme Corp' } },
      { headers: authHeaders }
    );
    executionId = exec.data.data._id;
    console.log('✅ 6. Workflow Execution Triggered: Run ID', executionId);

    // Wait 2 seconds for in-memory queue & multi-agent chain to complete
    console.log('   ⏳ Waiting for 5-agent pipeline to process...');
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err) {
    console.error('❌ Execution trigger failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 7. Verify Execution Snapshot & Timeline Logs
  try {
    const execDetail = await axios.get(`${BASE_URL}/executions/${executionId}`, { headers: authHeaders });
    const timeline = await axios.get(`${BASE_URL}/executions/${executionId}/timeline`, { headers: authHeaders });

    console.log('✅ 7. Execution Run Finished:');
    console.log(`   - Final Status: ${execDetail.data.data.status}`);
    console.log(`   - Duration: ${execDetail.data.data.duration}ms`);
    console.log(`   - Substrate: ${execDetail.data.data.orchestratorMetadata.langGraph}`);
    console.log(`   - Multi-Agent Confidence: ${(execDetail.data.data.orchestratorMetadata.confidenceScore * 100).toFixed(0)}%`);
    console.log(`   - Total Granular Timeline Events: ${timeline.data.data.length}`);
    timeline.data.data.forEach((log) => {
      console.log(`     [${log.agent.toUpperCase()}] ${log.message}`);
    });
  } catch (err) {
    console.error('❌ Execution detail fetch failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 8. Dashboard Aggregation
  try {
    const dash = await axios.get(`${BASE_URL}/workflows/dashboard`, { headers: authHeaders });
    console.log('✅ 8. Dashboard Metrics Passed:');
    console.log(`   - Total Workflows: ${dash.data.data.metrics.totalWorkflows}`);
    console.log(`   - Total Runs: ${dash.data.data.metrics.totalRuns}`);
    console.log(`   - Success Rate: ${dash.data.data.metrics.successRate}%`);
  } catch (err) {
    console.error('❌ Dashboard metrics failed:', err.response?.data || err.message);
    process.exit(1);
  }

  // 9. Integrations Status
  try {
    const integrations = await axios.get(`${BASE_URL}/integrations`, { headers: authHeaders });
    console.log('✅ 9. Integrations Status Passed:');
    console.log(`   - Providers: ${integrations.data.data.map((i) => i.provider).join(', ')}`);
  } catch (err) {
    console.error('❌ Integrations check failed:', err.response?.data || err.message);
    process.exit(1);
  }

  console.log('\n🎉 ALL FULL-STACK SANITY TESTS PASSED WITH 100% SUCCESS!\n');
}

runTests();
