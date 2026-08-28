const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';

// Derive 32-byte key from CREDENTIAL_ENCRYPTION_KEY
const getKey = () => {
  return crypto.createHash('sha256').update(env.CREDENTIAL_ENCRYPTION_KEY).digest();
};

/**
 * Encrypt sensitive plain text object or string
 */
const encrypt = (data) => {
  if (!data) return null;
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypt cipher string back to original format
 */
const decrypt = (encryptedString) => {
  if (!encryptedString) return null;
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('Decryption failed:', err.message);
    throw new Error('AUTH_DECRYPTION_FAILED');
  }
};

module.exports = {
  encrypt,
  decrypt,
};
