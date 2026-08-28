/**
 * Recovery Agent
 * Classifies failure modes and orchestrates retry or escalation strategies
 */
class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
    this.MAX_RETRIES = 3;
    this.BASE_BACKOFF_MS = 1000;
  }

  /**
   * Classify the error type
   * @param {Error|Object} error
   * @returns {'MISSING_FIELDS' | 'API_FAILURE' | 'AUTH_EXPIRED' | 'RATE_LIMIT' | 'TRANSIENT' | 'UNKNOWN'}
   */
  classifyError(error) {
    if (!error) return 'UNKNOWN';

    const msg = (error.message || String(error)).toLowerCase();
    const code = error.code || '';

    if (code === 'AUTH_EXPIRED' || msg.includes('auth') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('token expired')) {
      return 'AUTH_EXPIRED';
    }
    if (code === 'MISSING_FIELDS' || msg.includes('missing') || msg.includes('required')) {
      return 'MISSING_FIELDS';
    }
    if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
      return 'RATE_LIMIT';
    }
    if (code === 'INTEGRATION_NOT_CONNECTED' || msg.includes('not connected')) {
      return 'AUTH_EXPIRED';
    }
    if (code === 'API_FAILURE' || msg.includes('network') || msg.includes('500') || msg.includes('502') || msg.includes('503')) {
      return 'API_FAILURE';
    }
    if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('etimedout')) {
      return 'TRANSIENT';
    }

    return 'UNKNOWN';
  }

  /**
   * Determine recovery action
   * @param {Object} context { error, retryCount, node }
   * @returns {{ action: 'retry_with_backoff' | 'escalate', backoffMs: number, classification: string, reason: string }}
   */
  async handleFailure({ error, retryCount = 0, node }) {
    const classification = this.classifyError(error);

    // Non-retryable errors
    if (classification === 'AUTH_EXPIRED') {
      return {
        action: 'escalate',
        backoffMs: 0,
        classification,
        reason: `Authentication expired or missing for node "${node ? node.id : 'unknown'}". Operator action required to reconnect integration.`,
      };
    }

    if (classification === 'MISSING_FIELDS') {
      return {
        action: 'escalate',
        backoffMs: 0,
        classification,
        reason: `Configuration or payload validation failed: ${error.message}. Please check node parameter mappings.`,
      };
    }

    // Retryable errors within retry limit
    if (retryCount < this.MAX_RETRIES) {
      const backoffMs = Math.min(this.BASE_BACKOFF_MS * Math.pow(2, retryCount), 10000);
      return {
        action: 'retry_with_backoff',
        backoffMs,
        classification,
        reason: `Transient failure (${classification}). Scheduling retry ${retryCount + 1}/${this.MAX_RETRIES} in ${backoffMs}ms.`,
      };
    }

    // Exceeded max retries -> Escalate
    return {
      action: 'escalate',
      backoffMs: 0,
      classification,
      reason: `Exceeded maximum retry attempts (${this.MAX_RETRIES}) for node "${node ? node.id : 'unknown'}". Escalating to operator.`,
    };
  }
}

module.exports = new RecoveryAgent();
