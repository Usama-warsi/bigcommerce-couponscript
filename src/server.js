const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');

// Import utilities
const { getExistingCoupons, getAllProducts, getAllCategories, createCoupon, sleep, getCouponsCount } = require('./utils/api');
const { generateCouponCode, generateCouponName, createCouponData } = require('./utils/coupon');
const { getExpiryDate } = require('./utils/date');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Define routes BEFORE static file serving to ensure they take priority
// Serve coupon-manager.html as the main entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/coupon-manager.html'));
});

app.get('/coupon-manager.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/coupon-manager.html'));
});

// Now serve static files (but index.html won't be served by default anymore)
app.use(express.static(path.join(__dirname, '../public')));

/* ==================== API ROUTES ==================== */

/**
 * GET /api/products - Get all products and categories from store
 */
app.get('/api/products', async (req, res) => {
    try {
        console.log('Fetching products and categories...');
        const [products, categories] = await Promise.all([
            getAllProducts(),
            getAllCategories()
        ]);

        res.json({
            success: true,
            products: products.map(p => ({
                id: p.id,
                name: p.name
            })),
            categories: categories.map(c => ({
                id: c.id,
                name: c.name
            }))
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * GET /api/existing-coupons - Get all existing coupons
 */
app.get('/api/existing-coupons', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || null;
        const limit = parseInt(req.query.limit) || 250;

        console.log(`Fetching existing coupons (page: ${page || 'all'}, limit: ${limit})...`);
        const coupons = await getExistingCoupons(page, limit);
        const totalCount = await getCouponsCount();

        res.json({
            success: true,
            totalCount,
            coupons: coupons.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                type: c.type,
                amount: c.amount,
                enabled: c.enabled,
                date_created: c.date_created
            }))
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * GET /api/coupons - Get all coupons (alias for existing-coupons)
 */
app.get('/api/coupons', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || null;
        const limit = parseInt(req.query.limit) || 250;

        console.log(`Fetching coupons (page: ${page || 'all'}, limit: ${limit})...`);
        const coupons = await getExistingCoupons(page, limit);
        const totalCount = await getCouponsCount();

        res.json({
            success: true,
            totalCount,
            coupons: coupons.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                type: c.type,
                amount: c.amount,
                enabled: c.enabled,
                date_created: c.date_created
            }))
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * POST /api/generate-coupons - Generate bulk coupons
 */
app.post('/api/generate-coupons', async (req, res) => {
    try {
        const {
            quantity,
            codePrefix,
            namePrefix,
            productIds,
            targeting = 'products',
            discount = 100,
            discountType = 'percentage_discount',
            maxUsesPerCustomer = 1,
            totalUses = 0,
            minPurchase = 0,
            expiryDate = null
        } = req.body;

        console.log(`\n📋 Generating ${quantity} coupons with code prefix: ${codePrefix} and name prefix: ${namePrefix}`);
        console.log(`   Targeting: ${targeting}`);
        console.log(`   IDs: ${productIds.join(', ')}`);

        // Validate inputs
        if (!codePrefix || !namePrefix || quantity < 1 || quantity > 800 || !productIds || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters'
            });
        }

        // Set up streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Note: For large stores (150k+), we skip pre-fetching all codes
        // and rely on BigCommerce API to return 'conflict' for duplicates.
        const existingCodes = new Set(); // Local cache for this generation session only

        const results = [];
        let successCount = 0;
        let skipCount = 0;
        const generatedCodes = new Set();

        for (let i = 0; i < quantity; i++) {
            let code;
            let attempts = 0;
            let created = false;
            let apiAttempts = 0;
            const timestamp = Date.now() % 10000; // Use last 4 digits of timestamp

            // Generate unique code
            do {
                code = generateCouponCode(codePrefix);
                attempts++;
            } while ((existingCodes.has(code) || generatedCodes.has(code)) && attempts < 100);

            if (attempts >= 100) {
                console.log(`❌ Failed: Could not generate unique code after 100 attempts`);
                continue;
            }

            // Keep trying to create coupon until successful (retry if it exists)
            while (!created && apiAttempts < 10) {
                apiAttempts++;

                // Generate coupon name with iteration
                const couponName = `${namePrefix} ${i + 1} of ${quantity}`;

                // Get expiry date (with proper conversion)
                const expiresDate = getExpiryDate(expiryDate);

                const couponData = {
                    code,
                    name: couponName,
                    type: discountType,
                    amount: discount,
                    enabled: true,
                    max_uses: totalUses,
                    max_uses_per_customer: maxUsesPerCustomer,
                    min_purchase: minPurchase,
                    expires: expiresDate,
                    applies_to: {
                        entity: targeting,
                        ids: productIds
                    }
                };

                const result = await createCoupon(couponData);

                if (result.success) {
                    const couponResult = {
                        code,
                        name: couponName,
                        id: result.data.id,
                        status: 'Created',
                        created_at: new Date().toISOString()
                    };
                    results.push(couponResult);
                    successCount++;
                    generatedCodes.add(code);
                    existingCodes.add(code);
                    console.log(`✅ Created: ${code} (${couponName}) - ID: ${result.data.id}`);
                    created = true;

                    // Send result in real-time
                    res.write(`data: ${JSON.stringify({ type: 'result', data: couponResult })}\n\n`);
                } else {
                    if (result.error.includes('already exists') || result.error.includes('conflict')) {
                        // Generate a new code with appended attempt number for guaranteed uniqueness
                        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
                        code = `${codePrefix}${timestamp}${apiAttempts}${randomPart}`;

                        // If still exists, add more entropy
                        if (existingCodes.has(code) || generatedCodes.has(code)) {
                            code = `${codePrefix}X${timestamp}${apiAttempts}${randomPart}`;
                        }
                        console.log(`   ⏭️  Retry ${apiAttempts}/10: Trying ${code}`);
                    } else {
                        console.log(`❌ Failed: ${code} - ${result.error}`);
                        skipCount++;
                        created = true;

                        // Send failed result in real-time
                        const failedResult = {
                            code,
                            name: couponName,
                            status: 'Failed',
                            error: result.error,
                            created_at: new Date().toISOString()
                        };
                        res.write(`data: ${JSON.stringify({ type: 'result', data: failedResult })}\n\n`);
                    }
                }

                // Rate limiting
                await sleep(200);
            }

            if (!created && apiAttempts >= 10) {
                console.log(`❌ Failed: Could not create coupon after 10 attempts`);
                skipCount++;

                const failedResult = {
                    code,
                    name: `${namePrefix} ${i + 1} of ${quantity}`,
                    status: 'Failed',
                    error: 'Max retries exceeded',
                    created_at: new Date().toISOString()
                };
                res.write(`data: ${JSON.stringify({ type: 'result', data: failedResult })}\n\n`);
            }
        }

        // Export to Excel
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `generated-coupons-${timestamp}-${Date.now()}.xlsx`;
        const filepath = path.join(__dirname, filename);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(results);
        XLSX.utils.book_append_sheet(wb, ws, 'Generated Coupons');
        XLSX.writeFile(wb, filepath);

        console.log(`\n📊 Results:`);
        console.log(`   ✅ Created: ${successCount}`);
        console.log(`   📁 File: ${filename}`);

        // Send final summary
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            stats: {
                created: successCount,
                failed: skipCount,
                total: results.length,
                filename,
                downloadUrl: `/${filename}`
            }
        })}\n\n`);

        res.end();
    } catch (err) {
        console.error('Generation error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * POST /api/create-single-coupon - Create a single coupon
 */
app.post('/api/create-single-coupon', async (req, res) => {
    try {
        const { code, name, discount, discountType = 'percentage_discount', productIds, maxUsesPerCustomer = 1, totalUses = 0, minPurchase = 0, expiryDate = null } = req.body;

        // Create RFC-2822 date format (30 days from now if not specified)
        let expiresDate = expiryDate;
        if (!expiresDate) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            expiresDate = expiry.toUTCString();
        }

        const couponData = {
            code,
            name: name || code,
            type: discountType,
            amount: discount,
            enabled: true,
            max_uses: totalUses,
            max_uses_per_customer: maxUsesPerCustomer,
            min_purchase: minPurchase,
            expires: expiresDate,
            applies_to: {
                entity: 'products',
                ids: productIds
            }
        };

        const result = await createCoupon(couponData);

        if (result.success) {
            res.json({
                success: true,
                coupon: result.data,
                message: 'Coupon created successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BigCommerce Coupon Manager API' });
});

/**
 * GET download exported file
 */
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, filename);

    if (fs.existsSync(filepath) && filename.endsWith('.xlsx')) {
        res.download(filepath, filename, (err) => {
            if (!err) {
                // Delete file after download
                setTimeout(() => fs.unlink(filepath, () => { }), 1000);
            }
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

/* ==================== SERVER START ==================== */

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║     BigCommerce Coupon Manager API Server                      ║
╠════════════════════════════════════════════════════════════════╣
║  ✅ Server running on http://localhost:${PORT}                    ║
║  🌐 Index: http://localhost:${PORT}/          ║
║  📚 API Docs:                                                  ║
║     GET  /api/products                                         ║
║     GET  /api/existing-coupons                                 ║
║     POST /api/generate-coupons                                 ║
║     POST /api/create-single-coupon                             ║
║     GET  /api/health                                           ║
╚════════════════════════════════════════════════════════════════╝
    `);
});
