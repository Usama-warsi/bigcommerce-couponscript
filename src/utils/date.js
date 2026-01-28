/**
 * Convert YYYY-MM-DD format to RFC-2822 format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Date in RFC-2822 format
 */
function convertToRFC2822(dateString) {
    if (!dateString || dateString.trim() === '') {
        return null;
    }

    try {
        const dateObj = new Date(dateString + 'T23:59:59Z');
        return dateObj.toUTCString();
    } catch (e) {
        console.error(`Date conversion failed for ${dateString}:`, e.message);
        return null;
    }
}

/**
 * Get date 30 days from now in RFC-2822 format
 * @returns {string} - Date 30 days from now in RFC-2822 format
 */
function getDefaultExpiryDate() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    return expiry.toUTCString();
}

/**
 * Get expiry date, using provided date or default to 30 days
 * @param {string} expiryDate - Optional date in YYYY-MM-DD format
 * @returns {string} - Date in RFC-2822 format
 */
function getExpiryDate(expiryDate) {
    if (expiryDate && expiryDate.trim() !== '') {
        const converted = convertToRFC2822(expiryDate);
        if (converted) {
            return converted;
        }
    }
    return getDefaultExpiryDate();
}

module.exports = {
    convertToRFC2822,
    getDefaultExpiryDate,
    getExpiryDate
};
