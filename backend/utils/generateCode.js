const crypto = require('crypto');

/**
 * Generate a cryptographically random activation code.
 * 16 characters, uppercase letters + numbers only.
 */
const generateActivationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(16);
    let code = '';

    for (let i = 0; i < 16; i++) {
        code += chars[bytes[i] % chars.length];
    }

    return code;
};

module.exports = generateActivationCode;
