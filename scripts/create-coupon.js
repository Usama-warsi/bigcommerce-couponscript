const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

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

// Small delay to avoid rate limits
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ------------------ Create Single Coupon ------------------ */
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

/* ------------------ Create from JSON File ------------------ */
async function createFromJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return;
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const coupons = JSON.parse(rawData);
        const couponArray = Array.isArray(coupons) ? coupons : [coupons];

        console.log(`\n🔄 Creating ${couponArray.length} coupon(s)...\n`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < couponArray.length; i++) {
            const coupon = couponArray[i];
            console.log(`→ [${i + 1}/${couponArray.length}] Creating: ${coupon.code}`);

            const result = await createCoupon(coupon);

            if (result.success) {
                console.log(`✅ Created successfully (ID: ${result.data.id})`);
                successCount++;
            } else {
                console.log(`❌ Failed: ${result.error}`);
                failCount++;
            }

            await sleep(200);
        }

        console.log(`\n📊 Results: ${successCount} created, ${failCount} failed`);
    } catch (err) {
        console.error('❌ Error parsing JSON:', err.message);
    }
}

/* ------------------ Interactive Mode ------------------ */
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    console.log('\n📝 Interactive Coupon Creator\n');

    try {
        const code = await question('Coupon Code: ');
        const name = await question('Coupon Name: ');
        const type = await question('Type (percentage or fixed): ');
        const amount = await question('Amount: ');
        const minPurchase = await question('Min Purchase (or leave blank): ');
        const maxUses = await question('Max Uses (or leave blank for unlimited): ');
        const maxUsesPerCustomer = await question('Max Uses Per Customer (or leave blank): ');
        const expiryDate = await question('Expiry Date (YYYY-MM-DD or leave blank): ');
        const enabled = await question('Enabled (yes/no): ');

        const couponData = {
            code,
            name,
            type,
            amount: parseFloat(amount),
            enabled: enabled.toLowerCase() === 'yes'
        };

        if (minPurchase) couponData.min_purchase = parseFloat(minPurchase);
        if (maxUses) couponData.max_uses = parseInt(maxUses);
        if (maxUsesPerCustomer) couponData.max_uses_per_customer = parseInt(maxUsesPerCustomer);
        if (expiryDate) couponData.expires = expiryDate;

        console.log('\n📋 Coupon Data:');
        console.log(JSON.stringify(couponData, null, 2));

        const confirm = await question('\nCreate this coupon? (yes/no): ');

        if (confirm.toLowerCase() === 'yes') {
            const result = await createCoupon(couponData);
            if (result.success) {
                console.log(`\n✅ Coupon created successfully!`);
                console.log(`ID: ${result.data.id}`);
                console.log(`Code: ${result.data.code}`);
            } else {
                console.log(`\n❌ Error: ${result.error}`);
            }
        } else {
            console.log('\n⚠️  Cancelled');
        }
    } finally {
        rl.close();
    }
}

/* ------------------ Main Script ------------------ */
async function run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Interactive mode
        await interactiveMode();
    } else if (args[0] === '--file' && args[1]) {
        // File mode
        await createFromJSON(args[1]);
    } else if (args[0] === '--help') {
        console.log(`
📖 Coupon Creator Script

Usage:
  node create-coupon.js              - Interactive mode
  node create-coupon.js --file <file> - Create from JSON file
  node create-coupon.js --help       - Show this help

JSON File Format (single coupon):
{
  "code": "SUMMER20",
  "name": "Summer 20% Off",
  "type": "percentage",
  "amount": 20,
  "enabled": true,
  "max_uses": 100,
  "expires": "2026-12-31"
}

JSON File Format (multiple coupons):
[
  { "code": "COUPON1", "name": "First", "type": "fixed", "amount": 10 },
  { "code": "COUPON2", "name": "Second", "type": "percentage", "amount": 15 }
]
        `);
    } else {
        console.log('❌ Invalid arguments. Use --help for usage info');
    }
}

run().catch(err => {
    console.error('❌ Fatal error:', err.message);
});
