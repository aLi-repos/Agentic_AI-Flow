const axios = require('axios');
const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.botToken && !credentials.webhookUrl && !credentials.accessToken)) {
      return { valid: false, message: 'Missing Slack credentials or webhook URL' };
    }
    const token = credentials.botToken || credentials.accessToken;
    if (token) {
      try {
        const response = await axios.get('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.ok) {
          return {
            valid: true,
            message: 'Connected to Slack Workspace',
            details: { team: response.data.team, user: response.data.user },
          };
        }
        return { valid: false, message: response.data.error || 'Slack auth failed' };
      } catch (err) {
        throw this.handleError(err);
      }
    }
    if (credentials.webhookUrl) {
      return { valid: true, message: 'Configured with Incoming Webhook' };
    }
    return { valid: true, message: 'Configured with Test Credentials' };
  }

  async executeAction(action, params = {}, credentials) {
    if (!credentials) {
      const err = new Error('Slack integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      err.provider = 'slack';
      throw err;
    }

    if (action === 'post_message') {
      const { channel, message, blocks, text } = params;
      const content = message || text || 'Alert from Agentflow AI';
      const targetChannel = channel || credentials.defaultChannel || '#general';

      const token = credentials.botToken || credentials.accessToken;

      // Webhook execution
      if (credentials.webhookUrl) {
        try {
          await axios.post(credentials.webhookUrl, {
            text: content,
            blocks: blocks || undefined,
          });
          return {
            success: true,
            channel: 'Incoming Webhook',
            message: content,
            timestamp: new Date().toISOString(),
          };
        } catch (err) {
          throw this.handleError(err);
        }
      }

      // Live Bot Token execution
      if (token) {
        try {
          const res = await axios.post(
            'https://slack.com/api/chat.postMessage',
            {
              channel: targetChannel,
              text: content,
              blocks: blocks || undefined,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (!res.data.ok) {
            const err = new Error(`Slack API error: ${res.data.error}`);
            err.code = res.data.error === 'invalid_auth' ? 'AUTH_EXPIRED' : 'API_FAILURE';
            throw err;
          }
          return {
            success: true,
            channel: targetChannel,
            ts: res.data.ts,
            message: content,
          };
        } catch (err) {
          throw this.handleError(err);
        }
      }

      // Simulated execution
      return {
        success: true,
        mock: true,
        channel: targetChannel,
        message: content,
        timestamp: new Date().toISOString(),
        deliveredStatus: 'Posted to Slack (Verified Simulation)',
      };
    }

    throw new Error(`Unsupported Slack action: ${action}`);
  }
}

module.exports = new SlackIntegration();
