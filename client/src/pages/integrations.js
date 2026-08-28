import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import {
  Mail,
  MessageSquare,
  Flame,
  Table,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Shield,
  Loader2,
  Key,
  RefreshCw,
  X,
} from 'lucide-react';

const PROVIDER_METADATA = {
  gmail: {
    name: 'Gmail & Google Workspace',
    description: 'Dispatch automated operational emails, alerts, and read unread messages.',
    icon: Mail,
    color: 'from-red-500 to-rose-600',
    fields: [
      { key: 'accessToken', label: 'OAuth Access Token (or App Password)', type: 'password' },
      { key: 'email', label: 'Sender Email Address', type: 'text', placeholder: 'ops@enterprise.com' },
    ],
  },
  slack: {
    name: 'Slack Workspace',
    description: 'Post real-time incident notifications, messages, and alerts to channels.',
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-600',
    fields: [
      { key: 'webhookUrl', label: 'Incoming Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
      { key: 'botToken', label: 'Bot User OAuth Token (xoxb-...)', type: 'password' },
      { key: 'defaultChannel', label: 'Default Channel', type: 'text', placeholder: '#ops-alerts' },
    ],
  },
  discord: {
    name: 'Discord Webhook & Bot',
    description: 'Send high-visibility operational embeds and messages to Discord channels.',
    icon: Flame,
    color: 'from-blue-500 to-indigo-600',
    fields: [
      { key: 'webhookUrl', label: 'Discord Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
      { key: 'botToken', label: 'Bot Token (Optional)', type: 'password' },
    ],
  },
  'google-sheets': {
    name: 'Google Sheets',
    description: 'Log audit rows, sync databases, and append structured operational reports.',
    icon: Table,
    color: 'from-green-500 to-emerald-700',
    fields: [
      { key: 'accessToken', label: 'Google OAuth Token / Service Key', type: 'password' },
      { key: 'spreadsheetId', label: 'Default Spreadsheet ID', type: 'text', placeholder: '1BxiMVs0XRA5...' },
    ],
  },
  openrouter: {
    name: 'OpenRouter AI Models',
    description: 'LLaMA 3.3, Claude 3.5, and open-source models for agentic reasoning.',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
    fields: [
      { key: 'apiKey', label: 'OpenRouter API Key', type: 'password', placeholder: 'sk-or-v1-...' },
    ],
  },
  gemini: {
    name: 'Google Gemini API',
    description: 'High-speed Gemini 1.5 Flash intelligence for workflow graph compilation.',
    icon: Cpu,
    color: 'from-sky-500 to-blue-600',
    fields: [
      { key: 'apiKey', label: 'Google AI Studio API Key', type: 'password', placeholder: 'AIzaSy...' },
    ],
  },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations');
      setIntegrations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestConnection = async (provider) => {
    try {
      setTestingProvider(provider);
      setTestResult(null);
      const res = await api.get(`/integrations/status?provider=${provider}`);
      setTestResult({ provider, success: res.data.data.valid, message: res.data.data.message });
    } catch (err) {
      setTestResult({ provider, success: false, message: err.response?.data?.message || err.message });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Disconnect ${provider}?`)) return;
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;

    try {
      setSaving(true);
      await api.post('/integrations', {
        provider: selectedProvider,
        credentials: formData,
        metadata: { configuredManually: true, updatedAt: new Date().toISOString() },
      });
      setSelectedProvider(null);
      setFormData({});
      fetchIntegrations();
    } catch (err) {
      alert(`Failed to save credentials: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Third-Party Integrations & Security
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect external services. Credentials are encrypted at rest with AES-256-GCM.
            </p>
          </div>

          <button
            onClick={fetchIntegrations}
            className="p-2 rounded-xl border border-white/10 bg-surface-900 hover:bg-surface-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

        {/* Security Banner */}
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl flex items-center gap-3 text-xs text-emerald-300">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Application-Level Credential Protection:</strong> All OAuth tokens and webhooks are encrypted using your secret key before MongoDB storage and never exposed in plaintext logs.
          </span>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(PROVIDER_METADATA).map(([key, meta]) => {
            const current = integrations.find((i) => i.provider === key);
            const isConnected = current?.isConnected;
            const Icon = meta.icon;
            const isTesting = testingProvider === key;

            return (
              <div
                key={key}
                className="p-6 rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5">{meta.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{meta.description}</p>
                </div>

                {/* Test Result Message */}
                {testResult && testResult.provider === key && (
                  <div
                    className={`mt-4 p-2.5 rounded-lg border text-[11px] ${
                      testResult.success
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-red-500/30 bg-red-500/10 text-red-300'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(key)}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-surface-100 hover:bg-surface-200 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test Health'}
                  </button>

                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <button
                        onClick={() => handleDisconnect(key)}
                        className="px-3 py-1.5 rounded-xl text-red-400 hover:bg-red-500/10 text-[11px] font-medium transition-colors"
                      >
                        Disconnect
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProvider(key);
                        setFormData({});
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                    >
                      {isConnected ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configure Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-3xl border border-white/10 bg-surface-900 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-400" />
                  Configure {PROVIDER_METADATA[selectedProvider]?.name}
                </h3>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
                {PROVIDER_METADATA[selectedProvider]?.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder || ''}
                      value={formData[field.key] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                      className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Encrypt & Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
