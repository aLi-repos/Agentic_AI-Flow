/**
 * Base Integration Class
 * Standardizes lifecycle, execution, and error surface across all external providers
 */
class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  /**
   * Test connection health and token validity
   * @param {Object} credentials Decrypted credentials object
   * @returns {Promise<{valid: boolean, message: string, details?: any}>}
   */
  async testConnection(credentials) {
    throw new Error(`testConnection not implemented for ${this.providerName}`);
  }

  /**
   * Execute an integration action
   * @param {string} action Action identifier (e.g. 'send_email', 'post_message')
   * @param {Object} params Parameters for the action
   * @param {Object} credentials Decrypted credentials
   * @returns {Promise<any>}
   */
  async executeAction(action, params, credentials) {
    throw new Error(`executeAction not implemented for ${this.providerName}`);
  }

  /**
   * Format provider-specific errors into standardized exceptions
   */
  handleError(error) {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const err = new Error(`Authentication expired or invalid for ${this.providerName}`);
      err.code = 'AUTH_EXPIRED';
      err.provider = this.providerName;
      return err;
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      const err = new Error(`Network failure reaching ${this.providerName}`);
      err.code = 'API_FAILURE';
      err.provider = this.providerName;
      return err;
    }
    return error;
  }
}

module.exports = BaseIntegration;
