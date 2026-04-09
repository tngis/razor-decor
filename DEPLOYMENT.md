# Deployment Guide

Complete step-by-step deployment guide for Razor Decor eCommerce platform.

## 📋 Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] All environment variables ready
- [ ] Payment QR code image prepared
- [ ] Admin user account created
- [ ] Sample products added to Firestore
- [ ] Email notification tested
- [ ] All features tested locally

## 🔥 Firebase Deployment

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase --version
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not done)

```bash
firebase init

# Select:
# - Firestore
# - Functions
# - Storage
# - Choose existing project
# - Accept defaults
```

### 4. Configure Cloud Functions

Set up email configuration:

```bash
# For Gmail
firebase functions:config:set \
  email.user="your-email@gmail.com" \
  email.password="your-app-password" \
  email.admin="admin@razordecor.mn"

# Verify configuration
firebase functions:config:get
```

**Gmail App Password Setup**:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this password (not your regular Gmail password)

**Alternative Email Services**:

```typescript
// SendGrid (functions/src/index.ts)
import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(functions.config().sendgrid.key);

// Mailgun
import * as mailgun from 'mailgun-js';
const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain
});
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 7. Deploy Cloud Functions

```bash
# Install dependencies
cd functions
npm install
cd ..

# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:sendOrderNotification
```

### 8. Verify Deployment

```bash
# Check function logs
firebase functions:log --only sendOrderNotification

# Test function locally
cd functions
npm run serve
```

## ▲ Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/razor-decor.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Add Environment Variables**:
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_ADMIN_EMAIL
   NEXT_PUBLIC_SITE_URL
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Visit your site at `https://your-project.vercel.app`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Configure Custom Domain (Optional)

1. Go to Vercel Dashboard > Settings > Domains
2. Add your custom domain (e.g., razordecor.mn)
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (up to 48 hours)

## 🔒 Security Setup

### 1. Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Add your Vercel domain to authorized domains:
   - `your-project.vercel.app`
   - `razordecor.mn` (if using custom domain)

### 2. Update CORS Settings (if needed)

In `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "https://your-project.vercel.app"
          }
        ]
      }
    ]
  }
}
```

### 3. Enable App Check (Optional but Recommended)

1. Go to Firebase Console > App Check
2. Enable App Check for your web app
3. Use reCAPTCHA v3 provider
4. Add to `lib/firebase/config.ts`:
```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

## 📊 Post-Deployment Tasks

### 1. Create Admin User

1. Register a user through the app
2. Go to Firestore Database
3. Find user in `users` collection
4. Edit document: set `role: "admin"`

### 2. Upload Products

**Option A: Firebase Console**
1. Go to Firestore Database
2. Create documents in `products` collection

**Option B: Bulk Import Script**
```typescript
// scripts/import-products.ts
import { db } from './lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const products = [
  {
    name: { en: "Product 1", mn: "Бүтээгдэхүүн 1" },
    description: { en: "Description", mn: "Тайлбар" },
    price: 50000,
    category: "Wall Art",
    images: [],
    inStock: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  // ... more products
];

async function importProducts() {
  for (const product of products) {
    await addDoc(collection(db, 'products'), product);
    console.log('Added:', product.name.en);
  }
}

importProducts();
```

### 3. Upload Product Images

1. Go to Firebase Console > Storage
2. Create folder: `products/`
3. Upload images
4. Get public URLs
5. Add URLs to product documents

### 4. Test Payment Flow

1. Add test product to cart
2. Complete checkout
3. Verify:
   - Order created in Firestore
   - Email notification received
   - Order appears in admin panel
   - Status updates work

### 5. Set Up Monitoring

**Vercel Analytics**:
1. Go to Vercel Dashboard > Analytics
2. Enable Analytics (free tier available)

**Firebase Monitoring**:
1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. Add to `app/layout.tsx`:
```typescript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

### 6. Configure Backup

**Firestore Backup**:
```bash
# Manual backup
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Automated daily backup (set up in GCP Console)
```

## 🔍 Monitoring & Logs

### View Deployment Logs

**Vercel**:
```bash
vercel logs
vercel logs --follow  # Real-time
```

**Firebase Functions**:
```bash
firebase functions:log
firebase functions:log --only sendOrderNotification
```

### Error Tracking

Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## 🚀 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 💵 Cost Optimization

### Free Tier Limits

**Vercel**:
- ✅ 100GB bandwidth/month
- ✅ Unlimited requests
- ✅ Automatic HTTPS

**Firebase Spark Plan**:
- ✅ 1GB storage
- ✅ 10GB/month transfer
- ✅ 50K reads, 20K writes/day (Firestore)
- ✅ 125K/month function invocations
- ⚠️ 10K/month phone auth (then $0.01-0.06/verification)

### Upgrade Triggers

Upgrade to paid plan when:
- > 100 orders/day (Firestore writes)
- > 500 phone registrations/month (phone auth)
- Need custom domain with Firebase Hosting
- Want longer function execution time

## ✅ Launch Checklist

- [ ] All environment variables set in Vercel
- [ ] Firebase project configured correctly
- [ ] Cloud Functions deployed and tested
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Admin user created
- [ ] Products uploaded
- [ ] Payment QR code uploaded
- [ ] Email notifications working
- [ ] SMS authentication working
- [ ] Custom domain configured (optional)
- [ ] Analytics set up
- [ ] Backup strategy in place
- [ ] Team members have access
- [ ] Documentation shared with client

## 🆘 Troubleshooting

### Build Fails on Vercel

**Error**: Module not found
```bash
# Clear Vercel cache
vercel --force

# Check package.json has all dependencies
npm install
```

**Error**: Environment variables not found
- Double-check all variables in Vercel dashboard
- Redeploy after adding variables

### Functions Not Triggering

```bash
# Check function deployment
firebase functions:list

# View logs
firebase functions:log

# Test locally
firebase emulators:start --only functions
```

### Phone Auth Not Working

1. Check authorized domains in Firebase Console
2. Verify phone number format: +976XXXXXXXX
3. Use test numbers in development
4. Check Firebase quota limits

---

## 📞 Support

If you encounter issues:
1. Check Firebase logs: `firebase functions:log`
2. Check Vercel logs: `vercel logs`
3. Review Firebase Console > Usage
4. Contact support

Happy Deploying! 🚀
