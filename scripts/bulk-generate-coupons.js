const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

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

/* ==================== UTILITY FUNCTIONS ==================== */

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
 * Get all existing coupons from store
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
            await sleep(100);
        }

        return allCoupons;
    } catch (err) {
        console.error('Error fetching existing coupons:', err.message);
        return [];
    }
}

/**
 * Get all products from store
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
            await sleep(100);
        }

        return allProducts;
    } catch (err) {
        console.error('Error fetching products:', err.message);
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

/* ==================== BULK COUPON GENERATION ==================== */

/**
 * Generate multiple unique coupons
 * @param {Object} options - Generation options
 */
async function generateBulkCoupons(options) {
    const {
        quantity,
        codePrefix,           // Code prefix (e.g., "GETLINKED")
        namePrefix,           // Name prefix (e.g., "SHOPIFY 100 OFF")
        productIds,
        discount = 100,
        maxUsesPerCustomer = 1,
        minPurchase = 0
    } = options;

    console.log(`\n📋 Coupon Generation Options:`);
    console.log(`   Quantity: ${quantity}`);
    console.log(`   Code Prefix: ${codePrefix}`);
    console.log(`   Name Prefix: ${namePrefix}`);
    console.log(`   Products: ${productIds.join(', ')}`);
    console.log(`   Discount: ${discount}%`);
    console.log(`   Max Uses Per Customer: ${maxUsesPerCustomer}`);
    console.log(`   Min Purchase: $${minPurchase}\n`);

    // Get existing coupon codes to avoid duplicates
    console.log('🔄 Checking existing coupons...');
    const existingCoupons = await getExistingCoupons();
    const existingCodes = new Set(existingCoupons.map(c => c.code));
    console.log(`✔ Found ${existingCodes.size} existing coupons\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    const generatedCodes = new Set();

    console.log(`🔄 Generating ${quantity} coupons...\n`);

    for (let i = 0; i < quantity; i++) {
        let code;
        let attempts = 0;
        let created = false;
        let apiAttempts = 0;

        // Generate unique code
        do {
            code = generateCouponCode(codePrefix);
            attempts++;
            if (attempts > 100) {
                console.log(`⚠️  Could not generate unique code after 100 attempts`);
                break;
            }
        } while (existingCodes.has(code) || generatedCodes.has(code));

        if (attempts > 100) {
            failCount++;
            continue;
        }

        // Keep trying to create coupon until successful (retry if it exists)
        while (!created && apiAttempts < 10) {
            apiAttempts++;

            console.log(`→ [${i + 1}/${quantity}] Creating: ${code}`);

            // Create RFC-2822 date format for 30 days from now
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            const rfc2822Date = expiryDate.toUTCString();

            // Generate coupon name with iteration
            const couponName = generateCouponName(namePrefix, i + 1, quantity);

            const couponData = {
                code,
                name: couponName,
                type: 'percentage_discount',
                amount: discount,
                enabled: true,
                max_uses_per_customer: maxUsesPerCustomer,
                min_purchase: minPurchase,
                expires: rfc2822Date,
                applies_to: {
                    entity: 'products',
                    ids: productIds
                }
            };

            const result = await createCoupon(couponData);

            if (result.success) {
                console.log(`   ✅ Success (ID: ${result.data.id})`);
                results.push({
                    code,
                    id: result.data.id,
                    status: 'Created',
                    created_at: new Date().toISOString()
                });
                successCount++;
                generatedCodes.add(code);
                existingCodes.add(code);
                created = true;
            } else {
                // Check if it's a duplicate
                if (result.error.includes('already exists') || result.error.includes('conflict')) {
                    console.log(`   ⏭️  Code exists, generating new code...`);
                    // Generate a new code and retry
                    code = generateCouponCode(codePrefix);
                    attempts = 0;
                    while ((existingCodes.has(code) || generatedCodes.has(code)) && attempts < 100) {
                        code = generateCouponCode(codePrefix);
                        attempts++;
                    }
                } else {
                    console.log(`   ❌ Failed: ${result.error}`);
                    failCount++;
                    created = true;
                }
            }

            await sleep(200);
        }

        if (!created && apiAttempts >= 10) {
            console.log(`   ❌ Failed: Could not create coupon after 10 attempts`);
            failCount++;
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Created: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    return results;
}

/* ==================== EXPORT FUNCTIONS ==================== */

async function exportCouponsToExcel(results, filename) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Generated Coupons');
    XLSX.writeFile(wb, filename);
    console.log(`\n✅ Exported to: ${filename}`);
}

/* ==================== MAIN SCRIPT ==================== */

async function run() {
    try {
        // Example: Generate 4 coupons
        // Code format: GETLINKED993JTO, GETLINKED251GKHF, etc.
        // Name format: SHOPIFY 100 OFF 1 of 4, SHOPIFY 100 OFF 2 of 4, etc.
        const results = await generateBulkCoupons({
            quantity: 4,
            codePrefix: 'GETLINKED',      // Code prefix - unique random after this
            namePrefix: 'SHOPIFY 100 OFF', // Name prefix - will add iteration
            productIds: [111],
            discount: 100,
            maxUsesPerCustomer: 1,
            minPurchase: 0
        });

        if (results.length > 0) {
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `generated-coupons-${timestamp}-${Date.now()}.xlsx`;
            await exportCouponsToExcel(results, filename);
        }
    } catch (err) {
        console.error('❌ Fatal error:', err.message);
    }
}

run();
