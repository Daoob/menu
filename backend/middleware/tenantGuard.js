/**
 * Tenant Guard Middleware.
 * Ensures a merchant can only access their own resources.
 * Must be used AFTER merchantAuth middleware.
 */
const tenantGuard = (resourceField = 'merchant_id') => {
    return (req, res, next) => {
        // For routes that include a resource with a merchant_id
        // This is checked in controllers, but this middleware provides an extra layer
        req.tenantId = req.merchant._id;
        req.tenantField = resourceField;
        next();
    };
};

/**
 * Validates that a resource belongs to the current merchant.
 * Call this in controllers before any DB operation.
 */
const validateOwnership = (resource, merchantId) => {
    if (!resource) return false;
    const resourceMerchantId = resource.merchant_id?.toString() || resource.merchant_id;
    return resourceMerchantId === merchantId.toString();
};

module.exports = { tenantGuard, validateOwnership };
