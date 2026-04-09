# Getting Started - Quick Guide

This is the fastest way to get Razor Decor running locally.

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create Firebase project: https://console.firebase.google.com
2. Enable Phone Authentication
3. Create Firestore Database (production mode)
4. Create Storage bucket
5. Copy your Firebase config

### 3. Create Environment File

Create `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAIL=admin@razordecor.mn
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 What Works Out of the Box

✅ Homepage with product catalog (empty initially)
✅ User registration & login (SMS-based)
✅ Shopping cart functionality
✅ Checkout flow with QR payment
✅ User profile management
✅ Admin panel for order management
✅ Bilingual support (English/Mongolian)

## 📝 Next Steps

### Add Your First Product

1. Register a user account
2. Go to Firestore Console
3. Update user document: set `role: "admin"`
4. Login as admin
5. Go to Firestore > Create collection "products"
6. Add product document:

```json
{
  "name": {
    "en": "Metal Wall Art - Dragon",
    "mn": "Төмөр хананы урлаг - Луу"
  },
  "description": {
    "en": "Custom laser-cut metal dragon wall art, perfect for home decoration",
    "mn": "Захиалгат лазер зүссэн төмөр луу хананы урлаг, гэрийн чимэглэлд тохиромжтой"
  },
  "price": 150000,
  "category": "Wall Art",
  "images": [],
  "inStock": true,
  "createdAt": [Current Timestamp],
  "updatedAt": [Current Timestamp]
}
```

### Add Payment QR Code

1. Create/get your payment QR code image
2. Save as: `public/qr/payment-qr.png`
3. Customers will see this QR when checking out

### Set Up Email Notifications

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions

# Configure email
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.admin="admin@razordecor.mn"
```

## 🧪 Testing Locally

### Test Phone Authentication

Firebase provides test numbers for development:

1. Firebase Console > Authentication > Sign-in method > Phone
2. Add test phone numbers:
   - Phone: +97688887777
   - Code: 123456
3. Use these in your app (no SMS sent)

### Test Order Flow

1. Add products to Firestore (see above)
2. Browse products as customer
3. Add to cart
4. Proceed to checkout
5. Enter delivery address
6. View QR code
7. Click "I have paid"
8. Switch to admin panel
9. Verify payment & update order status

## 📁 Key Files to Understand

- `app/[locale]/page.tsx` - Homepage with product list
- `app/[locale]/auth/login/page.tsx` - Login page
- `app/[locale]/cart/page.tsx` - Shopping cart
- `app/[locale]/checkout/page.tsx` - Checkout & payment
- `app/[locale]/admin/page.tsx` - Admin dashboard
- `lib/firebase/` - Firebase configuration & helpers
- `lib/store/` - State management (Zustand)
- `messages/` - Translations (en.json, mn.json)

## 🐛 Common Issues

### "Module not found" errors

```bash
npm install
```

### Firebase initialization error

Check your `.env.local` file has all required variables

### Phone authentication not working

1. Enable Phone provider in Firebase Console
2. Add test phone numbers for development
3. Format: +976XXXXXXXX (Mongolia country code)

### Products not showing

1. Go to Firestore Console
2. Create "products" collection
3. Add at least one product document

### Admin panel access denied

1. Go to Firestore > users collection
2. Find your user document
3. Edit: set `role: "admin"`

## 📚 Documentation

- **README.md** - Full project documentation
- **DEPLOYMENT.md** - Step-by-step deployment guide
- **ARCHITECTURE.md** - Technical architecture & data flow

## 🚀 Ready to Deploy?

See **DEPLOYMENT.md** for complete deployment instructions to:
- ✅ Vercel (Frontend)
- ✅ Firebase (Backend)
- ✅ Custom domain setup

## 💡 Tips

1. **Use test phone numbers** in development to avoid SMS costs
2. **Hash PINs** before deploying to production (currently stored plain text)
3. **Create admin user** first thing after deployment
4. **Upload product images** to Firebase Storage for better performance
5. **Test the entire flow** locally before deploying

## 🤝 Need Help?

1. Check the error in browser console
2. Review Firebase logs: `firebase functions:log`
3. Verify Firestore security rules allow your operation
4. Check README.md troubleshooting section

---

**You're all set!** 🎉 Start by running `npm run dev` and visiting http://localhost:3000
