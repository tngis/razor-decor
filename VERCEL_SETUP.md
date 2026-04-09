# Vercel Deployment Setup Guide

## ⚠️ Fix "Firebase: Error (auth/invalid-api-key)"

This error occurs when Firebase environment variables are not configured in Vercel.

## Quick Fix: Add Environment Variables to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/your-username/razor-decor/settings/environment-variables
2. Add each variable below:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDy7yHYO5LO6TbVe7hPMvUaO6f7I2Lg_Xc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=razor-decor.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=razor-decor
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=razor-decor.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=99108307938
NEXT_PUBLIC_FIREBASE_APP_ID=1:99108307938:web:b97bffe625cb9caf286fbb
NEXT_PUBLIC_ADMIN_EMAIL=admin@razordecor.mn
NEXT_PUBLIC_SITE_URL=https://your-actual-domain.vercel.app
```

3. **Important**: Select all environments (Production, Preview, Development)
4. Click "Save"
5. **Redeploy** your application

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Add each environment variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Paste the value when prompted, then repeat for other variables

# Or import from .env file (make sure .env exists locally)
vercel env pull .env.vercel
```

## Verify Configuration

After deployment, visit:
```
https://your-domain.vercel.app/api/debug-env
```

You should see:
```json
{
  "status": "ok",
  "environment": {
    "hasFirebaseApiKey": true,
    "hasFirebaseAuthDomain": true,
    ...
  },
  "message": "All Firebase environment variables are configured!"
}
```

## Update Production Site URL

Don't forget to update `NEXT_PUBLIC_SITE_URL` with your actual Vercel domain:
```bash
NEXT_PUBLIC_SITE_URL=https://razor-decor.vercel.app
```

## Troubleshooting

### Still getting auth/invalid-api-key?

1. **Clear Vercel build cache**: Settings → General → Clear Build Cache
2. **Redeploy**: Deployments → Latest → Redeploy
3. **Check console**: Look for error messages about missing variables
4. **Verify variables**: Visit `/api/debug-env` endpoint

### Variables not loading?

- Make sure variable names start with `NEXT_PUBLIC_` (required for client-side access)
- Ensure you selected the correct environment (Production/Preview/Development)
- Wait for the deployment to complete after adding variables

## Security Note

The Firebase API key in `NEXT_PUBLIC_FIREBASE_API_KEY` is safe to expose publicly. Firebase security is enforced through:
- Firebase Security Rules (firestore.rules, storage.rules)
- Firebase Authentication
- API restrictions in Firebase Console

However, **NEVER** commit `.env` files to git (they're already in `.gitignore`).
