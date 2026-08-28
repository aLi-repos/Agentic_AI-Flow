const integrationService = require('../services/integrationService');

const listIntegrations = async (req, res, next) => {
  try {
    const integrations = await integrationService.getAllIntegrations(req.user.id);
    return res.status(200).json({
      success: true,
      data: integrations,
    });
  } catch (err) {
    next(err);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const { provider } = req.query;
    if (provider) {
      const status = await integrationService.testConnection(req.user.id, provider);
      return res.status(200).json({
        success: true,
        data: status,
      });
    }

    const all = await integrationService.getAllIntegrations(req.user.id);
    return res.status(200).json({
      success: true,
      data: all,
    });
  } catch (err) {
    next(err);
  }
};

const saveManualIntegration = async (req, res, next) => {
  try {
    const { provider, credentials, metadata, scopes } = req.body;
    const result = await integrationService.saveIntegration(req.user.id, {
      provider,
      credentials,
      metadata,
      scopes,
    });

    return res.status(200).json({
      success: true,
      message: `${provider} credentials saved and encrypted successfully`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const disconnect = async (req, res, next) => {
  try {
    const { provider } = req.params;
    await integrationService.disconnectIntegration(req.user.id, provider);
    return res.status(200).json({
      success: true,
      message: `${provider} disconnected successfully`,
    });
  } catch (err) {
    next(err);
  }
};

const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    // Build standard OAuth authorization redirect URL or mock auth response
    const redirectUri = `${req.protocol}://${req.get('host')}/api/integrations/oauth/${provider}/callback`;
    
    let authUrl = '';
    if (provider === 'gmail' || provider === 'google-sheets') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=agentflow_client_id&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/spreadsheets&access_type=offline&prompt=consent`;
    } else if (provider === 'slack') {
      authUrl = `https://slack.com/oauth/v2/authorize?client_id=agentflow_client_id&scope=chat:write,channels:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
    } else if (provider === 'discord') {
      authUrl = `https://discord.com/api/oauth2/authorize?client_id=agentflow_client_id&permissions=2048&scope=bot%20applications.commands&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }

    return res.status(200).json({
      success: true,
      provider,
      authUrl,
      redirectUri,
    });
  } catch (err) {
    next(err);
  }
};

const handleOAuthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    // Simulate/Exchange OAuth token
    const credentials = {
      accessToken: `mock_oauth_access_token_${Date.now()}`,
      refreshToken: `mock_oauth_refresh_token_${Date.now()}`,
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
      codeProvided: code || 'auto_granted',
    };

    // If req.user is set or session state decoded
    const userId = req.user ? req.user.id : req.query.state;
    if (userId) {
      await integrationService.saveIntegration(userId, {
        provider,
        credentials,
        metadata: { connectedVia: 'OAuth 2.0 Flow', connectedAt: new Date().toISOString() },
        scopes: ['default'],
      });
    }

    return res.redirect(`/integrations?connected=${provider}`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listIntegrations,
  getStatus,
  saveManualIntegration,
  disconnect,
  startOAuth,
  handleOAuthCallback,
};
