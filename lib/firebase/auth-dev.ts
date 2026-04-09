/**
 * Development-friendly authentication helpers
 * Use this for testing with real phone numbers in development
 */

import { auth } from './config';

/**
 * Enable App Check debug mode for development
 * This allows reCAPTCHA to work on localhost
 */
export const enableDevMode = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Enable Firebase Auth debugging
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;

    console.log('🔧 Firebase Auth: Development mode enabled');
    console.log('📱 You can now use real phone numbers for testing');
  }
};

/**
 * Disable reCAPTCHA for development (NOT RECOMMENDED for production)
 * Only use this if you're having persistent issues with reCAPTCHA
 */
export const disableAppVerification = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // @ts-ignore
    auth.settings.appVerificationDisabledForTesting = true;
    console.warn('⚠️ App verification disabled - FOR DEVELOPMENT ONLY');
  }
};
