# 🚀 BigCommerce Coupon Manager - Quick Start Guide

## 💻 Start Using the System

### Step 1: Start the Server
Open a terminal and run:
```bash
node server.js
```

You should see:
```
✅ Server running on http://localhost:3000
🌐 Index ROute: http://localhost:3000/
```

### Step 2: Open the Web Dashboard
Open your browser and go to:
```
http://localhost:3000/
```

### Step 3: Create Coupons

#### Basic Flow:
1. **Set Parameters**
   - Coupon Code Prefix: `GETLINKED` (or any custom prefix)
   - Quantity: `10` (1-800 coupons)
   - Discount: `100` (percentage)
   - Max Uses Per Customer: `1`

2. **Select Products**
   - Click "Load Products"
   - Search for specific products (optional)
   - Check boxes next to products you want
   - View selection at the bottom

3. **Generate**
   - Review the stats
   - Click "✨ Generate Coupons"
   - System automatically checks for duplicates
   - Excel file downloads automatically

4. **Download & Track**
   - Excel file with all generated coupons
   - View existing coupons in the table
   - Monitor success/skip/fail counts

---

## 📚 Alternative Methods

### Method 1: Command Line (Bulk Generation)

Edit `bulk-generate-coupons.js` and change parameters:
```javascript
const results = await generateBulkCoupons({
    quantity: 100,           // 1-800 coupons
    prefix: 'GETLINKED',     // Your coupon prefix
    productIds: [111, 93],   // Product IDs
    discount: 100,           // 100% off
    maxUsesPerCustomer: 1,   // One-time use
    minPurchase: 0           // No minimum
});
```

Then run:
```bash
node bulk-generate-coupons.js
```

### Method 2: Interactive Mode (Single Coupon)

Run:
```bash
node create-coupon.js
```

Answer prompts for coupon details.

### Method 3: From JSON File

Create `my-coupons.json`:
```json
[
  {
    "code": "GETLINKED001ABC",
    "name": "Test Coupon",
    "type": "percentage_discount",
    "amount": 100,
    "enabled": true,
    "max_uses_per_customer": 1,
    "applies_to": {
      "entity": "products",
      "ids": [111]
    }
  }
]
```

Run:
```bash
node create-coupon.js --file my-coupons.json
```

---

## 🎯 Common Use Cases

### Use Case 1: Generate 500 Coupons for Specific Product

**Web Interface:**
1. Prefix: `LAUNCH2026`
2. Quantity: `500`
3. Product: Select product ID `111`
4. Discount: `100%`
5. Max Uses Per Customer: `1`
6. Click Generate

**Excel Export:** Automatically includes all 500 codes

### Use Case 2: Create Different Coupon Batches

**Batch 1 - Valentine's Day:**
```bash
# Edit bulk-generate-coupons.js
prefix: 'VALENTINE'
quantity: 200
productIds: [111]
```

**Batch 2 - Easter:**
```bash
# Edit bulk-generate-coupons.js
prefix: 'EASTER'
quantity: 300
productIds: [93, 111]
```

Run each separately:
```bash
node bulk-generate-coupons.js
```

### Use Case 3: Restrict to Certain Products

**Method 1 (Web):**
- Load Products
- Select only products you want
- Generate coupons

**Method 2 (Script):**
Edit `productIds` array with specific IDs:
```javascript
productIds: [111, 93, 456, 789]  // Only these products
```

---

## ✅ Generated Coupon Format

All generated coupons follow this pattern:

```
PREFIX + 3-DIGIT NUMBER + 6-CHARACTER CODE
```

Examples with prefix `GETLINKED`:
- GETLINKED123ABC
- GETLINKED456DEF
- GETLINKED789GHI
- GETLINKED001XYZ

Each code is **100% unique** - system prevents duplicates.

---

## 📊 Excel Export Contains

When coupons are generated, Excel file includes:

| Column | Value |
|--------|-------|
| code | GETLINKED123ABC |
| id | 3 (BigCommerce ID) |
| status | Created |
| created_at | 2026-01-28T18:45:00 |

---

## 🔍 Checking Existing Coupons

### From Web Dashboard:
- Click "📋 Refresh Existing" button
- View table of existing coupons
- System automatically skips duplicates

### From Command Line:
```bash
node export-all-coupons.js
```

Output: CSV file with all store coupons

---

## ⚙️ Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
# Option 1: Kill process on port 3000
# Option 2: Edit server.js and change PORT = 3001
```

### Products not loading in web interface
- Check your `.env` credentials
- Verify store has products
- Check browser console (F12) for errors

### Coupons say "already exists"
- System detected duplicate codes
- Regenerate with different quantity
- Or check existing coupons first

### File download not working
- Coupons are still created even if download fails
- Check browser downloads folder
- Check browser console for errors

---

## 📞 Quick Reference

### Files You'll Use:
- **coupon-manager.html** - Web interface (open in browser)
- **server.js** - Start this to run the system
- **bulk-generate-coupons.js** - Edit and run for bulk coupons
- **coupons.json** - Example template for JSON mode

### Key Commands:
```bash
# Start web interface
node server.js

# Generate bulk coupons (CLI)
node bulk-generate-coupons.js

# Create single coupon (interactive)
node create-coupon.js

# Create from JSON file
node create-coupon.js --file coupons.json

# Export all store coupons
node export-all-coupons.js
```

---

## 🎓 Learning Path

**Day 1:** Get familiar with web interface
- Open coupon-manager.html
- Load products
- Generate 10 test coupons
- Download Excel file

**Day 2:** Experiment with parameters
- Try different prefixes
- Select specific products
- Change discount amounts
- Generate different quantities

**Day 3:** Advanced usage
- Create multiple batches
- Use command-line scripts
- Bulk generate hundreds of coupons
- Analyze exported data

---

## 📝 Notes

- Coupons are **100% off** by default (change if needed)
- **One-time use per customer** by default (change if needed)
- Each coupon **applies to specific products** you select
- System **prevents duplicate codes** automatically
- All operations are **logged to console** for tracking

---

**You're all set! Start with the web interface for easiest usage, or use command-line scripts for advanced automation.**

Happy coupon creating! 🎉
