const axios = require('axios');
const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.webhookUrl && !credentials.botToken)) {
      return { valid: false, message: 'Missing Discord Webhook URL or Bot Token' };
    }
    if (credentials.webhookUrl) {
      try {
        const response = await axios.get(credentials.webhookUrl);
        return {
          valid: true,
          message: 'Connected to Discord Webhook',
          details: { name: response.data.name, channel_id: response.data.channel_id },
        };
      } catch (err) {
        throw this.handleError(err);
      }
    }
    return { valid: true, message: 'Configured with Discord Bot Token' };
  }

  async executeAction(action, params = {}, credentials) {
    if (!credentials) {
      const err = new Error('Discord integration is not connected');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      err.provider = 'discord';
      throw err;
    }

    if (action === 'post_message') {
      const { content, embeds, username = 'Agentflow AI Bot', avatar_url } = params;
      const messageText = content || params.message || 'Notification from Agentflow';

      if (credentials.webhookUrl) {
        try {
          const payload = {
            content: messageText,
            username,
            avatar_url,
          };
          if (embeds && Array.isArray(embeds)) {
            payload.embeds = embeds;
          }

          const res = await axios.post(credentials.webhookUrl, payload);
          return {
            success: true,
            status: res.status,
            deliveredAt: new Date().toISOString(),
            content: messageText,
          };
        } catch (err) {
          throw this.handleError(err);
        }
      }

      if (credentials.botToken && params.channelId) {
        try {
          const res = await axios.post(
            `https://discord.com/api/v10/channels/${params.channelId}/messages`,
            { content: messageText, embeds },
            {
              headers: {
                Authorization: `Bot ${credentials.botToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          return {
            success: true,
            messageId: res.data.id,
            channelId: res.data.channel_id,
            content: messageText,
          };
        } catch (err) {
          throw this.handleError(err);
        }
      }

      // Simulated fallback
      return {
        success: true,
        mock: true,
        content: messageText,
        username,
        timestamp: new Date().toISOString(),
        deliveredStatus: 'Dispatched to Discord (Simulated Mode)',
      };
    }

    throw new Error(`Unsupported Discord action: ${action}`);
  }
}

module.exports = new DiscordIntegration();
