import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types';

// Store confirmation result globally
let confirmationResult: ConfirmationResult | null = null;

// Initialize reCAPTCHA verifier
export const initRecaptcha = (elementId: string) => {
  if (typeof window !== 'undefined') {
    // Clear any existing reCAPTCHA widget
    const existingWidget = document.getElementById(elementId);
    if (existingWidget) {
      existingWidget.innerHTML = '';
    }

    return new RecaptchaVerifier(auth, elementId, {
      size: 'normal', // Use visible reCAPTCHA for better reliability
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return null;
};

// Send SMS verification code
export const sendVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier | null = null
): Promise<void> => {
  try {
    // Ensure phone number has country code (+976 for Mongolia)
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+976${phoneNumber}`;

    console.log('📱 Sending SMS to:', formattedPhone);

    // When app verification is disabled (development), we still need a verifier
    // but Firebase will skip the actual verification
    if (!recaptchaVerifier) {
      // Create a container for reCAPTCHA if it doesn't exist
      let container = document.getElementById('hidden-recaptcha');
      if (!container) {
        container = document.createElement('div');
        container.id = 'hidden-recaptcha';
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      recaptchaVerifier = new RecaptchaVerifier(auth, 'hidden-recaptcha', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        }
      });
    }

    confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      recaptchaVerifier
    );

    console.log('✅ SMS sent successfully!');
  } catch (error) {
    console.error('❌ Error sending verification code:', error);
    throw error;
  }
};

// Verify SMS code and create/login user
export const verifyCode = async (
  code: string,
  pin: string,
  isRegistering: boolean
): Promise<User> => {
  if (!confirmationResult) {
    throw new Error('No confirmation result found. Please request a new code.');
  }

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (isRegistering || !userDoc.exists()) {
      // Create new user document
      const newUser: User = {
        id: user.uid,
        phoneNumber: user.phoneNumber || '',
        role: 'customer',
        createdAt: new Date(),
      };

      await setDoc(userDocRef, {
        ...newUser,
        pin: pin, // In production, hash this!
      });

      return newUser;
    } else {
      // Verify PIN for existing user
      const userData = userDoc.data();
      if (userData.pin !== pin) {
        throw new Error('Invalid PIN');
      }

      return {
        id: user.uid,
        phoneNumber: userData.phoneNumber,
        displayName: userData.displayName,
        email: userData.email,
        role: userData.role,
        address: userData.address,
        createdAt: userData.createdAt?.toDate(),
      };
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    confirmationResult = null;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user from Firestore
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  // Refresh token to get latest custom claims
  await user.getIdToken(true);

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) return null;

  const userData = userDoc.data();
  return {
    id: user.uid,
    phoneNumber: userData.phoneNumber,
    displayName: userData.displayName,
    email: userData.email,
    role: userData.role,
    address: userData.address,
    createdAt: userData.createdAt?.toDate(),
  };
};
