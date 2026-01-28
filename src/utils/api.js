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
 * Get all existing coupons from store with pagination
 */
async function getExistingCoupons() {
    try {
        const allCoupons = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const res = await api.get('/v2/coupons', {
                params: { page, limit: 250 }
            });

            if (res.data && res.data.length > 0) {
                allCoupons.push(...res.data);
                page++;
            } else {
                hasMore = false;
            }
            await sleep(50);
        }

        return allCoupons;
    } catch (err) {
        console.error('Error fetching existing coupons:', err.message);
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
    getExistingCoupons,
    getAllProducts,
    getAllCategories,
    createCoupon
};
