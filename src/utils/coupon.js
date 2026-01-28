/**
 * Generate unique coupon code with prefix
 * @param {string} prefix - Coupon code prefix (e.g., "GETLINKED")
 * @returns {string} - Generated code (e.g., "GETLINKED993JTO")
 */
function generateCouponCode(prefix) {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const numberPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${prefix}${numberPart}${randomPart}`;
}

/**
 * Generate coupon name with iteration
 * @param {string} namePrefix - Name prefix (e.g., "SHOPIFY 100 OFF")
 * @param {number} iteration - Current iteration (1-based)
 * @param {number} total - Total number of coupons
 * @returns {string} - Generated name (e.g., "SHOPIFY 100 OFF 2 of 500")
 */
function generateCouponName(namePrefix, iteration, total) {
    return `${namePrefix} ${iteration} of ${total}`;
}

/**
 * Create coupon data object
 */
function createCouponData(code, name, options) {
    return {
        code,
        name,
        type: 'percentage_discount',
        amount: options.discount,
        enabled: true,
        max_uses_per_customer: options.maxUsesPerCustomer,
        min_purchase: options.minPurchase,
        expires: options.expiresDate,
        applies_to: {
            entity: 'products',
            ids: options.productIds
        }
    };
}

module.exports = {
    generateCouponCode,
    generateCouponName,
    createCouponData
};
