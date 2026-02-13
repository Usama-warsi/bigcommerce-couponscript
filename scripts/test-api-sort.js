const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });
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

async function testSort(params) {
    console.log(`Testing with params: ${JSON.stringify(params)}`);
    try {
        const res = await api.get('/v2/coupons', { params });
        console.log(`✅ Success! Received ${res.data.length} items`);
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
        return false;
    }
}

async function runTests() {
    console.log('--- BigCommerce Coupons Sort Test ---');

    // Default
    await testSort({ limit: 5 });

    // sort=id:desc
    await testSort({ limit: 5, sort: 'id:desc' });

    // sort=id&direction=desc
    await testSort({ limit: 5, sort: 'id', direction: 'desc' });

    // sort=created_date:desc
    await testSort({ limit: 5, sort: 'created_date:desc' });
}

runTests();
