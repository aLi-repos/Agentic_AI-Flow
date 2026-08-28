/**
 * Validation Agent
 * Verifies node output schemas, integrity, and required fields
 */
class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  /**
   * Validate the output of an executed node
   * @param {Object} node
   * @param {Object} output
   * @returns {{isValid: boolean, missingFields: Array<string>, score: number, message: string}}
   */
  async validate(node, output) {
    if (!output) {
      return {
        isValid: false,
        missingFields: ['output_payload'],
        score: 0.0,
        message: `Node ${node.id} produced null or empty output.`,
      };
    }

    const { type } = node;
    const missingFields = [];

    switch (type) {
      case 'trigger':
        if (output.triggered === undefined) missingFields.push('triggered');
        break;

      case 'aiTask':
        if (!output.summary && !output.fullText) missingFields.push('summary');
        break;

      case 'gmail':
        if (output.success === undefined) missingFields.push('success');
        break;

      case 'slack':
        if (output.success === undefined) missingFields.push('success');
        break;

      case 'discord':
        if (output.success === undefined) missingFields.push('success');
        break;

      case 'googleSheets':
        if (!output.spreadsheetId && output.success === undefined) missingFields.push('spreadsheetId');
        break;

      default:
        break;
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        score: 0.4,
        message: `Output failed validation: missing fields [${missingFields.join(', ')}]`,
      };
    }

    return {
      isValid: true,
      missingFields: [],
      score: 1.0,
      message: `Node ${node.id} output successfully validated.`,
    };
  }
}

module.exports = new ValidationAgent();
