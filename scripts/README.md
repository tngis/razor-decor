# Database Setup Scripts

Scripts to automate Firebase database setup and management.

## Prerequisites

### 1. Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **razor-decor**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **"Generate new private key"**
6. Save the file as `firebase-service-account.json` in the project root

```bash
# Your file should be at:
razor-decor/firebase-service-account.json
```

⚠️ **Important**: This file contains sensitive credentials. Never commit it to git (already in .gitignore)

### 2. Install Dependencies

```bash
cd scripts
npm install
```

## Available Scripts

### 1. Setup Database (Recommended First)

Creates collections and adds sample products:

```bash
node setup-database.js
```

**What it does**:
- ✅ Creates 10 sample products (wall art, signs, services)
- ✅ Creates product categories
- ✅ Initializes users and orders collections
- ✅ Optionally creates admin user

**Output**:
```
🚀 Starting database setup...
📦 Creating products...
   ✓ Added product: Metal Wall Art - Dragon
   ✓ Added product: Geometric Wall Panel
   ...
✅ Created 10 products
```

### 2. Create Admin User

Creates a new admin user with authentication:

```bash
node create-admin.js
```

**Interactive prompts**:
```
Enter phone number (e.g., +97688887777): +97699999999
Enter PIN (4 digits): 1234
Enter display name (optional): Admin User
Enter email (optional): admin@razordecor.mn
```

**Output**:
```
✅ Admin user created successfully!
   UID: abc123...
   Phone: +97699999999
   Role: admin
```

### 3. Update User Role

Update an existing user's role to admin:

```bash
node update-user-role.js
```

**Interactive prompts**:
```
Search by (1) Phone Number or (2) User ID? Enter 1 or 2: 1
Enter phone number (e.g., +97688887777): +97688887777
Enter new role (admin/customer): admin
```

## Quick Start Guide

### Option 1: Full Setup (Automated)

```bash
# 1. Download service account key (see Prerequisites)

# 2. Install dependencies
cd scripts
npm install

# 3. Run setup script
node setup-database.js

# 4. When prompted, create admin user:
#    Phone: +97699999999
#    PIN: 1234
#    Name: Admin User

# 5. Done! Your database is ready
```

### Option 2: Manual Setup

```bash
# 1. Create database structure and products
node setup-database.js
# Answer "n" when asked about admin user

# 2. Register a user via the web app
npm run dev
# Go to http://localhost:3000/en/auth/register

# 3. Make that user an admin
node update-user-role.js
# Enter the user's phone number
# Set role to "admin"
```

## NPM Scripts

You can also use npm scripts:

```bash
cd scripts

# Full database setup
npm run setup

# Create admin user
npm run create-admin

# Update user role
npm run update-role
```

## Troubleshooting

### "Cannot find module 'firebase-service-account.json'"

**Solution**: Download the service account key from Firebase Console and place it in project root.

### "Permission denied" error

**Solution**: Make sure your service account has proper permissions:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Manage service account permissions"
3. Ensure it has "Firebase Admin SDK Administrator Service Agent" role

### "Phone number already exists"

**Solution**: The phone number is already registered. Use a different number or update the existing user's role with `update-user-role.js`

### "Invalid phone number format"

**Solution**: Phone numbers must include country code (e.g., +976 for Mongolia)

## Sample Data Structure

### Products
```javascript
{
  name: { en: "Product Name", mn: "Бүтээгдэхүүний нэр" },
  description: { en: "Description", mn: "Тайлбар" },
  price: 50000,
  category: "Wall Art",
  images: [],
  inStock: true,
  featured: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Categories
```javascript
{
  name: { en: "Wall Art", mn: "Хананы урлаг" },
  slug: "wall-art",
  description: { en: "...", mn: "..." }
}
```

### Users
```javascript
{
  phoneNumber: "+97699999999",
  displayName: "Admin User",
  email: "admin@razordecor.mn",
  pin: "1234", // Should be hashed in production!
  role: "admin", // or "customer"
  createdAt: Timestamp
}
```

## Security Notes

⚠️ **Important**:
- Keep `firebase-service-account.json` secure and private
- Never commit service account keys to version control
- PINs are stored in plain text - implement hashing before production
- Use test phone numbers during development to avoid SMS costs

## Next Steps After Setup

1. **Add Product Images**:
   - Upload images to Firebase Storage (`products/` folder)
   - Update product documents with image URLs

2. **Customize Products**:
   - Edit sample products in Firestore
   - Add your actual product catalog

3. **Test Admin Panel**:
   - Login with admin credentials
   - Test order management workflow

4. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

## Additional Scripts

Want more scripts? You can create:
- `delete-all-products.js` - Clear all products
- `import-products-csv.js` - Bulk import from CSV
- `backup-database.js` - Backup Firestore data
- `generate-test-orders.js` - Create test orders

Let me know if you need any of these!
