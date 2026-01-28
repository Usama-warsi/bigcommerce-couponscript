const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

const STORE_HASH = process.env.BC_STORE_HASH;
const ACCESS_TOKEN = process.env.BC_ACCESS_TOKEN;

// Generate timestamped filename to avoid file locking issues
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + Date.now();
const OUTPUT_FILE = `all-coupons-export-${timestamp}.csv`;

const api = axios.create({
    baseURL: `https://api.bigcommerce.com/stores/${STORE_HASH}`,
    headers: {
        'X-Auth-Token': ACCESS_TOKEN,
        'Accept': 'application/json'
    }
});

// Small delay to avoid rate limits
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ------------------ Fetch All Coupons with Pagination ------------------ */
async function fetchAllCoupons() {
    const allCoupons = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`→ Fetching coupons page ${page}...`);
            const res = await api.get('/v2/coupons', {
                params: {
                    page: page,
                    limit: 250
                }
            });

            if (res.data && res.data.length > 0) {
                allCoupons.push(...res.data);
                console.log(`✔ Loaded ${res.data.length} coupons from page ${page}`);
                page++;
            } else {
                hasMore = false;
            }

            await sleep(150); // avoid rate limits
        } catch (err) {
            console.error(`❌ API error on page ${page}:`, err.response?.data || err.message);
            hasMore = false;
        }
    }

    return allCoupons;
}

/* ------------------ Format Coupon Data for Export ------------------ */
function formatCouponsForExport(coupons) {
    return coupons.map(coupon => {
        return {
            'id': coupon.id,
            'code': coupon.code,
            'name': coupon.name || '',
            'type': coupon.type || '',
            'amount': coupon.amount || '',
            'min_purchase': coupon.min_purchase || '',
            'max_uses': coupon.max_uses || '',
            'max_uses_per_customer': coupon.max_uses_per_customer || '',
            'num_uses': coupon.num_uses || 0,
            'enabled': coupon.enabled,
            'expires': coupon.expires || '',
            'date_created': coupon.date_created || '',
            'applies_to_entity': coupon.applies_to?.entity || '',
            'applies_to_ids': coupon.applies_to?.ids?.join('; ') || '',
            'restricted_to': coupon.restricted_to?.join('; ') || '',
            'shipping_methods': coupon.shipping_methods?.join('; ') || ''
        };
    });
}

/* ------------------ Main Script ------------------ */
async function run() {
    try {
        console.log('🔄 Starting coupon export...\n');

        const coupons = await fetchAllCoupons();
        console.log(`\n✔ Total coupons fetched: ${coupons.length}\n`);

        if (coupons.length === 0) {
            console.log('⚠️  No coupons found in the store');
            return;
        }

        const formattedData = formatCouponsForExport(coupons);

        // Export to CSV
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, 'All Coupons');
        XLSX.writeFile(wb, OUTPUT_FILE);

        console.log(`✅ Export complete! File: ${OUTPUT_FILE}`);
        console.log(`📊 Total coupons exported: ${coupons.length}`);
    } catch (err) {
        console.error('❌ Fatal error:', err.message);
    }
}

run();
