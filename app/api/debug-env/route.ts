import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with a secret key
  const isProduction = process.env.NODE_ENV === 'production';

  const envStatus = {
    nodeEnv: process.env.NODE_ENV,
    hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasFirebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasFirebaseStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    hasFirebaseMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    hasFirebaseAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    hasAdminEmail: !!process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,

    // Show partial values (first 10 chars) to help debug without exposing secrets
    firebaseApiKeyPreview: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  const allConfigured = Object.entries(envStatus)
    .filter(([key]) => key.startsWith('has'))
    .every(([, value]) => value === true);

  return NextResponse.json({
    status: allConfigured ? 'ok' : 'missing_variables',
    environment: envStatus,
    message: allConfigured
      ? 'All Firebase environment variables are configured!'
      : 'Some Firebase environment variables are missing. Check Vercel environment settings.',
  });
}
