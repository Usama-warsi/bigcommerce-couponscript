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

# Getting Started

## 1. Setup

### Prerequisites
- Node.js (v14 or higher)
- BigCommerce store with API access

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp config/.env.example config/.env

# Edit config/.env with your BigCommerce credentials
# BC_STORE_HASH=your_store_hash
# BC_ACCESS_TOKEN=your_access_token
```

## 2. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 3. Using the Coupon Manager

### Main Interface
The Coupon Manager is your primary tool for managing coupons. It features multiple tabs:

**📝 Coupon Details Tab**
   - Code Prefix: Unique prefix for generated coupon codes (e.g., "GETLINKED")
   - Name Prefix: Prefix for coupon names (e.g., "SHOPIFY 100 OFF")
   - Quantity: Number of coupons to generate (1-800)
   - Discount Type: Percentage, Fixed Amount, or Shipping
   - Discount Amount: The value of the discount

**🎯 Targeting Tab**
   - Choose to apply coupons to **Specific Products** or **Specific Categories**
   - Load products/categories from your store
   - Multi-select your desired targets

**🔒 Restrictions Tab**
   - Set minimum/maximum purchase amounts
   - Configure usage limits per customer
   - Configure total usage limits
   - Enable/disable coupons

**⚙️ Advanced Tab**
   - Set expiry dates
   - Configure customer groups
   - Additional options

**👁️ Preview Tab**
   - View your coupon configuration
   - See sample coupon JSON
   - Statistics summary

**📊 Results Tab**
   - Real-time coupon generation status
   - See each coupon as it's created (✅ or ❌)
   - Generation statistics
   - Download Excel file

**📋 All Coupons Tab**
   - View all existing coupons in your store
   - Click "🔄 Refresh Coupons" to load the latest list
   - Sortable table with code, name, type, amount, status, and creation date

### Generate Coupons
1. Fill in Coupon Details (code prefix, name prefix, quantity)
2. Select Targeting (products or categories)
3. Configure Restrictions (optional)
4. Review in Preview tab
5. Click "✨ Generate All Coupons"
6. Watch real-time progress in Results tab
7. Download Excel file when complete

## 4. CLI Scripts (Optional)

### Generate Bulk Coupons
```bash
npm run generate
# Runs: scripts/bulk-generate-coupons.js
# Edit the script to customize bulk generation options
```

### Export All Coupons
```bash
npm run export
# Generates timestamped CSV with all store coupons
```

### Create Single Coupon
```bash
npm run create
# Interactive mode for creating one coupon
```

### Fetch & Enrich Data
```bash
npm run fetch
# Reads Klaviyo-Coupon-Report.csv
# Enriches with BigCommerce data
# Exports to Excel
```

## 5. Configuration Files

### config/.env
Your BigCommerce API credentials:
```
BC_STORE_HASH=your_store_hash
BC_ACCESS_TOKEN=your_access_token
```

### config/coupons.json
Template for bulk coupon creation via CLI:
```json
[
  {
    "code": "TEST_COUPON_1",
    "name": "Test Coupon 1",
    "type": "percentage_discount",
    "amount": 10,
    "enabled": true,
    "applies_to": {
      "entity": "products",
      "ids": [0]
    }
  }
```
]
```

## 6. Features

✅ Web-based Coupon Manager (primary interface)
✅ Real-time coupon generation with live progress
✅ Bulk generate 1-800 coupons with unique codes
✅ Support for both product and category targeting
✅ Separate control for coupon code and name prefixes
✅ Flexible discount options (percentage, fixed, shipping)
✅ Auto-export to Excel with timestamps
✅ Check for duplicate coupons before creating
✅ View all store coupons with refresh capability
✅ Configurable usage limits and restrictions
✅ CLI tools for automation (optional)

## 7. Troubleshooting

### Server won't start
- Check if port 3000 is in use
- Verify Node.js is installed: `node --version`
- Check config/.env has valid credentials

### Coupons not creating
- Verify products/categories are selected
- Check API credentials in config/.env
- Look at console errors for API response messages

### No products/categories loading
- Click "🔄 Load Products" or "🔄 Load Categories" button
- Check that your API token has proper permissions
- Verify your store has products/categories

### Port 3000 already in use
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 8. Next Steps

- Review `README.md` for full documentation
- Check `docs/STRUCTURE.md` for file organization
- For CLI usage, refer to CLI Scripts section above
- For advanced features, check the Coupon Manager tabs


## 📝 License

This tool is for BigCommerce API integration. Ensure you have proper permissions and follow BigCommerce's terms of service.

---

**Created:** January 2026  
**Version:** 1.0.0  
**Author:** BigCommerce Coupon Manager System
