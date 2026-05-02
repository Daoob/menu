/**
 * Simple action logger utility.
 * Logs admin and security-related actions with timestamps.
 */
const logAction = (action, details = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        ...details,
    };
    console.log(`[ACTION LOG] ${JSON.stringify(logEntry)}`);
};

module.exports = { logAction };
