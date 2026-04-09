# Razor Decor eCommerce Platform

A modern, minimalist eCommerce website for Razor Decor - a Mongolian custom metal art company specializing in CNC laser cutting services.

## 🌟 Features

### Customer Features
- **Phone Authentication**: SMS-based registration and login with 4-digit PIN
- **Product Catalog**: Browse products with category filtering
- **Shopping Cart**: Add, update, and remove items
- **QR Payment**: Simple payment via QR code scanning
- **Order Tracking**: View order history and status
- **Bilingual Support**: Full Mongolian and English translations
- **Responsive Design**: Works seamlessly on mobile and desktop

### Admin Features
- **Order Management**: View all orders with detailed information
- **Order Status Tracking**: Update orders through production pipeline
  - Payment Verification
  - In Production
  - Out for Delivery
  - Delivered
- **Email Notifications**: Automatic admin notifications for new orders
- **Customer Management**: View customer information and delivery addresses

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Zustand** (state management)
- **next-intl** (internationalization)

### Backend & Infrastructure
- **Firebase Authentication** (Phone SMS)
- **Cloud Firestore** (database)
- **Firebase Storage** (images)
- **Firebase Cloud Functions** (email notifications)
- **Vercel** (deployment)

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Vercel account (for deployment)
- Gmail or email service for notifications

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd razor-decor
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Phone Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Phone" provider
   - Add test phone numbers for development (optional)

3. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Deploy security rules: `firebase deploy --only firestore:rules`

4. Create **Storage Bucket**:
   - Go to Storage
   - Get started
   - Deploy storage rules: `firebase deploy --only storage`

5. Get Firebase Configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" > Add web app
   - Copy the config object

### 3. Environment Variables

Create `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL=admin@razordecor.mn

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Firebase Cloud Functions Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Functions, Firestore, Storage)
firebase init

# Install function dependencies
cd functions
npm install
cd ..

# Configure email credentials (for Gmail)
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
firebase functions:config:set email.admin="admin@razordecor.mn"

# Deploy functions
firebase deploy --only functions
```

**Note**: For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833):
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account > Security > 2-Step Verification > App passwords
3. Generate an app password for "Mail"

### 5. Add QR Payment Code

Place your payment QR code image at:
```
public/qr/payment-qr.png
```

### 6. Create Admin User

After registering a user, manually update their role in Firestore:

1. Go to Firestore Database
2. Find the user document in `users` collection
3. Edit the document and set `role: "admin"`

### 7. Add Sample Products (Optional)

Create products in Firestore manually or via Firebase Console:

```javascript
// Example product document in 'products' collection
{
  name: {
    en: "Metal Wall Art - Dragon",
    mn: "Төмөр хананы урлаг - Луу"
  },
  description: {
    en: "Custom laser-cut metal dragon wall art",
    mn: "Захиалгат лазер зүссэн төмөр луу хананы урлаг"
  },
  price: 150000,
  category: "Wall Art",
  images: ["https://firebasestorage.googleapis.com/..."],
  inStock: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

### 8. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub

2. Import project to Vercel:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add all variables from `.env.local`

4. Deploy:
   ```bash
   vercel --prod
   ```

### Deploy Firebase Functions

```bash
firebase deploy --only functions
```

## 📱 Testing Phone Authentication

### Development Testing

Firebase provides test phone numbers for development:

1. Go to Firebase Console > Authentication > Sign-in method > Phone
2. Add test phone numbers (e.g., +97688887777 with code 123456)
3. Use these in development without sending actual SMS

### Production

For production, Firebase Phone Authentication has a free tier:
- **Free**: 10K verifications/month
- SMS charges apply for real phone numbers (varies by country)

## 💰 Cost Estimation

With Firebase Spark (Free) Plan:
- ✅ **Firestore**: 50K reads, 20K writes/day
- ✅ **Storage**: 1GB storage, 10GB transfer/month
- ✅ **Functions**: 125K invocations/month
- ✅ **Authentication**: 10K phone auth/month

**Estimated monthly cost for ~100 orders/month**: **$0 - $5**

To reduce SMS costs:
- Use test numbers in development
- Consider alternative payment verification (manual bank transfer check)

## 📂 Project Structure

```
razor-decor/
├── app/
│   ├── [locale]/           # Localized routes
│   │   ├── page.tsx        # Homepage
│   │   ├── auth/           # Login/Register
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── profile/        # User profile
│   │   ├── admin/          # Admin dashboard
│   │   └── layout.tsx      # Layout with header
│   ├── api/                # API routes
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── auth/               # Auth components
│   ├── cart/               # Cart components
│   ├── product/            # Product components
│   ├── admin/              # Admin components
│   └── layout/             # Layout components
├── lib/
│   ├── firebase/           # Firebase config & helpers
│   ├── store/              # Zustand stores
│   └── utils/              # Utility functions
├── functions/              # Firebase Cloud Functions
│   └── src/
│       └── index.ts        # Email notification functions
├── messages/               # i18n translations
│   ├── en.json
│   └── mn.json
├── public/
│   ├── images/             # Product images
│   └── qr/                 # Payment QR code
└── types/                  # TypeScript type definitions
```

## 🔐 Security Notes

⚠️ **Important**: In production, you should:

1. **Hash PINs**: Currently PINs are stored in plain text. Implement bcrypt hashing:
   ```typescript
   import bcrypt from 'bcryptjs';
   const hashedPin = await bcrypt.hash(pin, 10);
   ```

2. **Rate Limiting**: Add rate limiting for login attempts

3. **HTTPS Only**: Ensure site runs on HTTPS in production

4. **Environment Variables**: Never commit `.env.local` to git

5. **Firebase Rules**: Review and test Firestore security rules

## 🐛 Troubleshooting

### Phone Authentication Issues

**Problem**: SMS not received
- **Solution**: Check Firebase quota limits, verify phone number format (+976XXXXXXXX)
- Use test phone numbers in development

**Problem**: reCAPTCHA issues
- **Solution**: Add your domain to authorized domains in Firebase Console

### Build Errors

**Problem**: `next-intl` configuration error
- **Solution**: Ensure `middleware.ts` is at project root
- Check `next.config.js` has `withNextIntl` wrapper

**Problem**: Firebase initialization error
- **Solution**: Verify all environment variables are set correctly
- Check `.env.local` file exists and has correct format

### Email Notifications Not Sending

**Problem**: Cloud Functions email failing
- **Solution**: 
  - Verify email credentials: `firebase functions:config:get`
  - Check Gmail App Password is correct
  - Review Cloud Functions logs: `firebase functions:log`

## 📈 Future Enhancements

- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filters
- [ ] Bulk order discounts
- [ ] Real-time order tracking map
- [ ] Customer chat support
- [ ] Custom design upload (for laser cutting)
- [ ] Payment gateway integration (QPay, SocialPay)
- [ ] Inventory management
- [ ] Analytics dashboard

## 🤝 Support

For issues or questions:
- Email: support@razordecor.mn
- Phone: +976 XXXX XXXX

## 📄 License

Private - © 2026 Razor Decor

---

Built with ❤️ for Razor Decor
