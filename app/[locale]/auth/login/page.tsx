'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { sendVerificationCode, verifyCode } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Smartphone, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('auth');
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push(`/${locale}`);
    }
  }, [user, authLoading, router, locale]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (phoneNumber.length !== 8) {
        throw new Error(t('invalidPhone'));
      }

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error(t('invalidPin'));
      }

      await sendVerificationCode(phoneNumber);
      setStep('code');
      toast.success('SMS code sent! Check your phone.');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyCode(verificationCode, pin, false);
      toast.success(t('loginSuccess'));
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-platinum-300 border-t-platinum-900 rounded-full"
        />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="card-premium p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-platinum-900 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-platinum-900 mb-2">
              {t('loginTitle')}
            </h1>
            <div className="w-12 h-px bg-platinum-400 mx-auto mt-4" />
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-platinum-700 mb-2">
                  <Smartphone className="w-4 h-4" strokeWidth={2} />
                  <span>{t('phoneNumber')}</span>
                </label>
                <input
                  type="tel"
                  placeholder="88887777"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={8}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all text-center text-lg tracking-wider"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-platinum-700 mb-2">
                  <Lock className="w-4 h-4" strokeWidth={2} />
                  <span>{t('pin')}</span>
                </label>
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all text-center text-lg tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                    : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                }`}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-platinum-400 border-t-platinum-600 rounded-full"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>{t('sendCode')}</span>
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-platinum-600">
                {t('noAccount')}{' '}
                <a
                  href={`/${locale}/auth/register`}
                  className="text-platinum-900 hover:underline font-semibold"
                >
                  {t('register')}
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-platinum-700 mb-2 text-center">
                  {t('smsCode')}
                </label>
                <p className="text-xs text-platinum-600 text-center mb-4">
                  Enter the 6-digit code sent to your phone
                </p>
                <input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all text-center text-2xl tracking-widest font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                  loading
                    ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                    : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                }`}
              >
                {loading ? 'Verifying...' : t('verifyCode')}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-sm text-platinum-600 hover:text-platinum-900 transition-colors"
              >
                ← {t('back')}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
