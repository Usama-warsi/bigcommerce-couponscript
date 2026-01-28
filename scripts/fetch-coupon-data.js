const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');

const STORE_HASH = process.env.BC_STORE_HASH;
const ACCESS_TOKEN = process.env.BC_ACCESS_TOKEN;

const INPUT_FILE = 'Klaviyo-Coupon-Report.csv'; // Excel with column "Coupon Code"
const OUTPUT_FILE = 'klaviyo-report-v2.xlsx';

const api = axios.create({
    baseURL: `https://api.bigcommerce.com/stores/${STORE_HASH}`,
    headers: {
        'X-Auth-Token': ACCESS_TOKEN,
        'Accept': 'application/json'
    }
});

// Small delay to avoid rate limits
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ------------------ Read Excel ------------------ */
function readExcelCoupons() {
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error('❌ coupons.xlsx not found');
    }
    const workbook = XLSX.readFile(INPUT_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    const codes = rows
        .map(r => String(r['Coupon Code'] || '').trim())
        .filter(Boolean);
    console.log(`✔ Loaded ${codes.length} coupon codes from Excel`);
    return codes;
}

/* ------------------ Fetch Coupon Details ------------------ */
async function fetchCoupon(code) {
    try {
        const res = await api.get('/v2/coupons', { params: { code } });
        return res.data.length ? res.data[0] : null;
    } catch (err) {
        console.error(`❌ Coupon API error for ${code}:`, err.response?.data || err.message);
        return null;
    }
}

/* ------------------ Main Script ------------------ */
async function run() {
    const codes = readExcelCoupons();
    const results = [];

    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        console.log(`→ [${i + 1}/${codes.length}] Processing ${code}`);

        const coupon = await fetchCoupon(code);
        const now = new Date();

        if (!coupon) {
            results.push({
                'Coupon Code': code,
                'Exists': 'No',
                'Status': 'Not Found'
            });
        } else {
            const expiresAt = coupon.expires ? new Date(coupon.expires) : null;
            results.push({
                'Coupon Code': coupon.code,
                'ID': coupon.id,
                'Name': coupon.name,
                'Type': coupon.type,
                'Amount': coupon.amount,
                'Min Purchase': coupon.min_purchase,
                'Max Uses': coupon.max_uses || 'Unlimited',
                'Max Uses Per Customer': coupon.max_uses_per_customer || 'Unlimited',
                'Times Used': coupon.num_uses,
                'Used': coupon.num_uses > 0 ? 'Yes' : 'No',
                'Expires': coupon.expires || 'No Expiry',
                'Status': expiresAt && expiresAt < now ? 'Expired' : coupon.enabled ? 'Active' : 'Disabled',
                'Applies To Entity': coupon.applies_to?.entity || 'All',
                'Applies To IDs': coupon.applies_to?.ids?.join(', ') || 'All',
                'Restricted To': coupon.restricted_to?.join(', ') || 'None',
                'Shipping Methods': coupon.shipping_methods?.join(', ') || 'All',
                'Date Created': coupon.date_created
            });
        }

        await sleep(150); // avoid rate limits
    }

    // Export Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Coupon Report');
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`\n✅ Report generated: ${OUTPUT_FILE}`);
}

run().catch(err => {
    console.error('❌ Fatal error:', err.message);
});
