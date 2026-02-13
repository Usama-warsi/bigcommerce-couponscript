const axios = require('axios');

const STORE_HASH = process.env.BC_STORE_HASH;
const ACCESS_TOKEN = process.env.BC_ACCESS_TOKEN;

const api = axios.create({
    baseURL: `https://api.bigcommerce.com/stores/${STORE_HASH}`,
    headers: {
        'X-Auth-Token': ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Get total number of coupons in store
 */
async function getCouponsCount() {
    try {
        const res = await api.get('/v2/coupons/count');
        return res.data.count || 0;
    } catch (err) {
        console.error('Error fetching coupon count:', err.message);
        return 0;
    }
}

/**
 * Get existing coupons from store (paginated or all)
 * @param {number} page - Page number (optional)
 * @param {number} limit - Limit per page (optional)
 */
async function getExistingCoupons(page = null, limit = 250) {
    try {
        if (page !== null) {
            // Get single page
            const res = await api.get('/v2/coupons', {
                params: { page, limit }
            });
            return res.data || [];
        }

        // Get all coupons (legacy behavior / for small stores)
        const allCoupons = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
            const res = await api.get('/v2/coupons', {
                params: { page: currentPage, limit: 250 }
            });

            if (res.data && res.data.length > 0) {
                allCoupons.push(...res.data);
                currentPage++;

                // If we got fewer than 250, we've reached the end
                if (res.data.length < 250) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }

            // Safety break if store has too many coupons (150k+ is too much for this function)
            if (currentPage > 20) {
                console.warn('⚠️ Large store detected. Pagination is recommended.');
                break;
            }

            await sleep(50);
        }

        return allCoupons;
    } catch (err) {
        const errorDetails = err.response?.data || err.message;
        console.error('Error fetching existing coupons:', typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails);
        return [];
    }
}

/**
 * Get all products from store with pagination
 */
async function getAllProducts() {
    try {
        const allProducts = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const res = await api.get('/v3/catalog/products', {
                params: { page, limit: 250 }
            });

            if (res.data?.data && res.data.data.length > 0) {
                allProducts.push(...res.data.data);
                page++;
            } else {
                hasMore = false;
            }
            await sleep(50);
        }

        return allProducts;
    } catch (err) {
        console.error('Error fetching products:', err.message);
        return [];
    }
}

/**
 * Get all categories from store with pagination
 */
async function getAllCategories() {
    try {
        const allCategories = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const res = await api.get('/v3/catalog/categories', {
                params: { page, limit: 250 }
            });

            if (res.data?.data && res.data.data.length > 0) {
                allCategories.push(...res.data.data);
                page++;
            } else {
                hasMore = false;
            }
            await sleep(50);
        }

        return allCategories;
    } catch (err) {
        console.error('Error fetching categories:', err.message);
        return [];
    }
}

/**
 * Create a single coupon
 */
async function createCoupon(couponData) {
    try {
        const res = await api.post('/v2/coupons', couponData);
        return { success: true, data: res.data };
    } catch (err) {
        const errorDetails = err.response?.data?.errors || err.response?.data || err.message;
        return {
            success: false,
            error: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)
        };
    }
}

module.exports = {
    api,
    sleep,
    getCouponsCount,
    getExistingCoupons,
    getAllProducts,
    getAllCategories,
    createCoupon
};
