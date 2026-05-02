const ActivationCode = require('../models/ActivationCode');
const { logAction } = require('../utils/logger');

/**
 * Validate Activation Code
 * POST /api/activation/validate
 *
 * Checks: not used, not expired, not locked.
 * Progressive lockout after 3 failures.
 */
const validateCode = async (req, res) => {
    try {
        const { code } = req.body;
        const clientIp = req.ip || req.connection.remoteAddress;

        if (!code || code.length !== 16) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activation code format.',
            });
        }

        const upperCode = code.toUpperCase().trim();
        const activationCode = await ActivationCode.findOne({ code: upperCode });

        if (!activationCode) {
            return res.status(404).json({
                success: false,
                message: 'Activation code not found.',
            });
        }

        // Check if used
        if (activationCode.isUsed) {
            return res.status(400).json({
                success: false,
                message: 'This activation code has already been used.',
            });
        }

        // Check if expired
        if (new Date() > activationCode.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'This activation code has expired.',
            });
        }

        // Check if locked
        if (activationCode.lockedUntil && new Date() < activationCode.lockedUntil) {
            const remainingMs = activationCode.lockedUntil - new Date();
            const remainingMinutes = Math.ceil(remainingMs / 60000);
            return res.status(429).json({
                success: false,
                message: `Code is temporarily locked. Try again in ${remainingMinutes} minute(s).`,
                lockedUntil: activationCode.lockedUntil,
            });
        }

        // Code is valid — return success but DON'T mark as used yet
        // The code will be consumed during registration
        res.json({
            success: true,
            message: 'Activation code is valid.',
            codeId: activationCode._id,
        });
    } catch (error) {
        console.error('Validate code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Record Failed Attempt
 * POST /api/activation/failed
 *
 * Called when code validation fails — tracks attempts and applies lockout.
 */
const recordFailedAttempt = async (req, res) => {
    try {
        const { code } = req.body;
        const clientIp = req.ip || req.connection.remoteAddress;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Code is required.',
            });
        }

        const upperCode = code.toUpperCase().trim();
        const activationCode = await ActivationCode.findOne({ code: upperCode });

        if (!activationCode) {
            // Don't reveal if code exists or not for failed attempts
            logAction('ACTIVATION_FAILED', { ip: clientIp, codeAttempt: upperCode, reason: 'not_found' });
            return res.status(400).json({
                success: false,
                message: 'Invalid activation code.',
            });
        }

        // Increment failed attempts
        activationCode.failedAttempts += 1;
        activationCode.attemptLogs.push({
            ip: clientIp,
            timestamp: new Date(),
        });

        // Apply progressive lockout
        const lockDuration = activationCode.getLockDuration();
        if (lockDuration > 0) {
            activationCode.lockedUntil = new Date(Date.now() + lockDuration);
        }

        await activationCode.save();

        logAction('ACTIVATION_FAILED', {
            ip: clientIp,
            code: upperCode,
            failedAttempts: activationCode.failedAttempts,
            lockedUntil: activationCode.lockedUntil,
        });

        const response = {
            success: false,
            message: 'Invalid activation code.',
        };

        if (activationCode.lockedUntil && new Date() < activationCode.lockedUntil) {
            const remainingMinutes = Math.ceil((activationCode.lockedUntil - new Date()) / 60000);
            response.message = `Too many failed attempts. Code locked for ${remainingMinutes} minute(s).`;
            response.lockedUntil = activationCode.lockedUntil;
        }

        res.status(400).json(response);
    } catch (error) {
        console.error('Record failed attempt error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

module.exports = {
    validateCode,
    recordFailedAttempt,
};
