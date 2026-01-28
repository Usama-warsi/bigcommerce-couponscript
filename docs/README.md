| [⚙️ Setup Guide](SETUP.md) | [📖 README](README.md) | [🚀 Quick Start](QUICKSTART.md) | [📁 Project Structure](STRUCTURE.md) |
|---|---|---|---|

# 🎟️ BigCommerce Coupon Management System

A comprehensive suite of tools for creating, managing, and exporting coupons on BigCommerce. Generate up to 800 unique coupons with custom prefixes, bulk creation, and web-based management interface.

## 📋 Features

✅ **Bulk Coupon Generation** - Create up to 800 unique coupons at once  
✅ **Custom Coupon Codes** - Set prefix and auto-generate unique suffixes (e.g., GETLINKED993JTO)  
✅ **Product Selection** - Select specific products or apply to all products  
✅ **Flexible Discounts** - Percentage discounts with customizable amounts  
✅ **Usage Controls** - Set max uses per customer and minimum purchase amounts  
✅ **Web Interface** - Beautiful HTML dashboard for easy management  
✅ **Excel Export** - Automatic export of generated coupons  
✅ **Duplicate Prevention** - Automatically skip existing coupon codes  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- BigCommerce API credentials (.env file configured)

### 2. Installation

```bash
cd c:\Users\SAAD\bigcommerce-couponscript
npm install
```

### 3. Run the Application

#### Option A: Web Interface (Recommended)

```bash
node server.js
```

Then open in your browser:
```
http://localhost:3000/coupon-manager.html
```

#### Option B: Command Line - Bulk Generation

```bash
node bulk-generate-coupons.js
```

Edit the parameters in the script (quantity, prefix, productIds, discount, etc.)

#### Option C: Command Line - Single Coupon

```bash
node create-coupon.js
```

Then choose between:
- Interactive mode
- JSON file mode
- Help command

## 📖 Scripts Overview

### 1. **coupon-manager.html** - Web Dashboard
Beautiful web interface for coupon management.

**Features:**
- Load all products from store
- Search and filter products
- Configure coupon parameters
- Set custom prefix
- Preview generated codes
- View existing coupons
- Download Excel reports

**Usage:**
```bash
node server.js
# Then visit http://localhost:3000/coupon-manager.html
```

### 2. **server.js** - Express API Server
Node.js REST API that powers the web interface.

**API Endpoints:**

```
GET  /api/products              - Get all products from store
GET  /api/existing-coupons      - Get all existing coupons
POST /api/generate-coupons      - Generate bulk coupons
POST /api/create-single-coupon  - Create single coupon
GET  /api/health                - Health check
```

**Start Server:**
```bash
node server.js
```

### 3. **bulk-generate-coupons.js** - Bulk Generation Script
Command-line tool for creating multiple coupons.

**Features:**
- Generate 1-800 coupons at once
- Custom coupon code prefix
- Automatic duplicate detection
- Excel export with timestamp
- Progress tracking
- Rate limiting (avoids API throttling)

**Edit Configuration:**
Edit the `run()` function at the bottom:
```javascript
const results = await generateBulkCoupons({
    quantity: 10,              // Number of coupons
    prefix: 'GETLINKED',       // Coupon code prefix
    productIds: [111],         // Product IDs to apply to
    discount: 100,             // Discount percentage
    maxUsesPerCustomer: 1,     // Max uses per customer
    minPurchase: 0             // Minimum purchase amount
});
```

**Usage:**
```bash
node bulk-generate-coupons.js
```

### 4. **create-coupon.js** - Single Coupon Creator
Interactive tool for creating individual coupons.

**Modes:**

**Interactive Mode:**
```bash
node create-coupon.js
```
Answer prompts:
- Coupon Code
- Coupon Name
- Type (percentage or fixed)
- Amount
- Min Purchase
- Max Uses
- Max Uses Per Customer
- Expiry Date
- Enabled status

**File Mode:**
```bash
node create-coupon.js --file coupons.json
```

Example `coupons.json`:
```json
[
  {
    "code": "SUMMER20",
    "name": "Summer 20% Off",
    "type": "percentage_discount",
    "amount": 20,
    "enabled": true,
    "max_uses": 100,
    "applies_to": {
      "entity": "products",
      "ids": [111, 93]
    }
  }
]
```

**Help:**
```bash
node create-coupon.js --help
```

### 5. **export-all-coupons.js** - Export Existing Coupons
Exports all coupons from your store to a CSV file.

**Features:**
- Fetches all store coupons with pagination
- Exports to timestamped CSV
- Shows comprehensive coupon details
- Progress tracking

**Usage:**
```bash
node export-all-coupons.js
```

**Output:** `all-coupons-export-2026-01-28_1769627559073.csv`

## 🔧 Configuration

### Environment Variables (.env)

The `.env` file should contain:
```
BC_STORE_HASH=pqus2fga8h
BC_ACCESS_TOKEN=gpe4flz3dake04hvwcdir7yoxpd0yyf
```

## 📝 Coupon Parameters

### Required Fields
- **code** - Unique coupon code (e.g., "GETLINKED993JTO")
- **name** - Coupon name
- **type** - Must be `percentage_discount`
- **amount** - Discount amount (0-100 for percentage)
- **enabled** - true/false
- **max_uses_per_customer** - Integer (1+ for limited, leave empty for unlimited)
- **applies_to** - Object with entity and ids

### Optional Fields
- **min_purchase** - Minimum purchase amount required
- **max_uses** - Total uses allowed
- **expires** - Expiry date (YYYY-MM-DD)
- **restricted_to** - Restrict to specific shipping methods

### applies_to Object
```javascript
{
  "entity": "products",           // or "categories"
  "ids": [111, 93]               // Product/Category IDs, or [0] for all
}
```

## 📊 Coupon Code Generation

The system generates unique codes using this pattern:
```
PREFIX + 3-digit number + 6-character random alphanumeric
Example: GETLINKED993JTO
```

**Pattern:**
- Prefix: User-defined (e.g., "GETLINKED")
- Numbers: 000-999
- Letters: A-Z (6 characters)

## 🎨 Web Interface Usage

### Step 1: Configure Parameters
1. Set Coupon Code Prefix (e.g., "GETLINKED")
2. Set Number of Coupons (1-800)
3. Set Discount Amount (0-100%)
4. Optional: Set Min Purchase, Max Uses, Expiry Date

### Step 2: Select Products
1. Click "Load Products" to fetch from store
2. Search for specific products (optional)
3. Check boxes for products you want
4. Selected products appear at the bottom

### Step 3: Generate Coupons
1. Review stats on the right
2. Click "Generate Coupons"
3. System checks for duplicates
4. Creates unique coupons
5. Exports to Excel automatically

### Step 4: Download & Monitor
1. Excel file downloads automatically
2. View "Recent Coupons" table
3. Check success/skip/fail counts
4. Refresh to see new coupons

## 📊 Output Files

### Excel Export Format
```
| Code          | ID  | Status  | Created At          |
|---------------|-----|---------|---------------------|
| GETLINKED123A | 456 | Created | 2026-01-28T...      |
| GETLINKED456B | 457 | Created | 2026-01-28T...      |
```

### CSV Format (from export-all-coupons.js)
```
id, code, name, type, amount, min_purchase, max_uses, enabled, expires, ...
```

## 🐛 Troubleshooting

### Error: "Port 3000 already in use"
```bash
# Change port in server.js
# Look for: app.listen(PORT, ...)
```

### Error: "EBUSY: resource busy or locked"
This happens when Excel is open. The script uses timestamped filenames to avoid this.

### Error: "applies_to field is invalid"
Make sure `applies_to.ids` is:
- Not empty
- Use `[0]` for all products
- Or specify product IDs like `[111, 93]`

### Error: "Type field is invalid"
Only use `percentage_discount` (not "percentage" or "fixed")

### Products not loading
1. Check your API credentials in .env
2. Make sure store has products
3. Check browser console for errors

## 📈 Advanced Usage

### Generate 500 Coupons Programmatically
```bash
# Edit bulk-generate-coupons.js
# Change quantity: 500
# Run the script
node bulk-generate-coupons.js
```

### Custom Coupon Prefixes
```bash
# Create multiple coupon batches
# GETLINKED, SUMMER, BLACKFRIDAY, etc.
# Just update the prefix in the script
```

### Specific Product Selection
Edit the `productIds` array:
```javascript
productIds: [111, 93, 45, 89]  // Your product IDs
```

## 🔐 Security Notes

- Keep `.env` file private
- Don't commit `.env` to version control
- Use environment variables in production
- Limit API token permissions to coupon management
- Review generated coupons before distribution

## 📞 Support

For issues with:
- **API Credentials**: Check BigCommerce admin panel
- **Products**: Verify product IDs in BigCommerce
- **Scripts**: Check error messages and .env configuration
- **Web Interface**: Check browser console (F12)

## 📄 File Structure

```
bigcommerce-couponscript/
├── .env                            # API credentials
├── package.json                    # Dependencies
├── package-lock.json
├── coupon-manager.html             # Web dashboard
├── server.js                       # Express API server
├── bulk-generate-coupons.js        # Bulk generation script
├── create-coupon.js                # Single coupon creator
├── export-all-coupons.js           # Export existing coupons
├── fetch-coupon-data.js            # Fetch coupon details
├── coupons.json                    # Coupon template file
├── generated-coupons-*.xlsx        # Generated coupon files
└── README.md                       # This file
```

## 🎯 Next Steps

1. **Configure API Credentials**
   ```bash
   # Edit .env file with your BigCommerce credentials
   ```

2. **Test with Single Coupon**
   ```bash
   node create-coupon.js
   ```

3. **Generate Bulk Coupons**
   - Use web interface OR
   - Edit bulk-generate-coupons.js and run it

4. **Monitor & Export**
   ```bash
   node export-all-coupons.js
   ```

## 📝 License

This tool is for BigCommerce API integration. Ensure you have proper permissions and follow BigCommerce's terms of service.

---

**Created:** January 2026  
**Version:** 1.0.0  
**Author:** BigCommerce Coupon Manager System
