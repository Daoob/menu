/**
 * Check Subscription Middleware.
 * Attaches subscription info to req.subscription.
 * NEVER blocks dashboard access — only computes status.
 * Must be used AFTER merchantAuth middleware.
 */
const GRACE_DAYS = 15;

const checkSubscription = (req, res, next) => {
    const merchant = req.merchant;
    if (!merchant) return next();

    const now = new Date();
    const endsAt = merchant.subscriptionEndsAt;

    let status = 'expired';
    let daysRemaining = null;
    let graceDaysRemaining = null;

    if (endsAt) {
        const diffMs = endsAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            status = 'active';
            daysRemaining = diffDays;
        } else {
            const graceEnd = new Date(
                endsAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000
            );
            const graceMs = graceEnd.getTime() - now.getTime();
            if (graceMs > 0) {
                status = 'grace';
                graceDaysRemaining = Math.ceil(graceMs / (1000 * 60 * 60 * 24));
            }
        }
    }

    req.subscription = { status, endsAt, daysRemaining, graceDaysRemaining };
    next();
};

module.exports = checkSubscription;
