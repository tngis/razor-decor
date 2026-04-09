'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { formatPrice } from '@/lib/utils/format';
import { createOrder } from '@/lib/firebase/firestore';
import { Address } from '@/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('checkout');
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [address, setAddress] = useState<Address>(
    user?.address || {
      province: '',
      district: '',
      khoroo: '',
      detailedAddress: '',
    }
  );

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push(`/${params.locale}/auth/login`);
      return;
    }

    // Validate address
    if (
      !address.province ||
      !address.district ||
      !address.khoroo ||
      !address.detailedAddress
    ) {
      toast.error('Please fill in all address fields');
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentConfirmation = async () => {
    setLoading(true);
    try {
      // Create order
      const orderId = await createOrder(user!.id, {
        userId: user!.id,
        items,
        totalAmount: getTotalAmount(),
        status: 'payment_pending',
        deliveryAddress: address,
      });

      // Send email notification to admin (via API route)
      await fetch('/api/send-order-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userPhone: user!.phoneNumber,
          totalAmount: getTotalAmount(),
        }),
      });

      clearCart();
      toast.success(t('orderPlaced'));
      router.push(`/${params.locale}/profile?tab=orders`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push(`/${params.locale}/auth/login`);
    return null;
  }

  if (items.length === 0) {
    router.push(`/${params.locale}`);
    return null;
  }

  if (showPayment) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-platinum-900 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-3xl font-serif font-bold text-platinum-900 mb-4">
              {t('payment')}
            </h1>

            <p className="text-platinum-600 mb-8">{t('scanQR')}</p>

            {/* QR Code */}
            <div className="relative w-72 h-72 mx-auto mb-8 bg-platinum-50 rounded-xl border-2 border-platinum-200 overflow-hidden">
              <Image
                src="/qr/payment-qr.png"
                alt="Payment QR Code"
                fill
                className="object-contain p-6"
              />
            </div>

            <div className="bg-platinum-50 rounded-lg p-6 mb-8 border border-platinum-200">
              <p className="text-sm text-platinum-600 font-medium mb-2 uppercase tracking-wide">
                {t('orderSummary')}
              </p>
              <p className="text-4xl font-bold text-platinum-900">
                {formatPrice(getTotalAmount())}
              </p>
            </div>

            <p className="text-sm text-platinum-600 mb-8">{t('afterPayment')}</p>

            <button
              onClick={handlePaymentConfirmation}
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                  <span>{t('havePaid')}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPayment(false)}
              className="mt-4 text-sm text-platinum-600 hover:text-platinum-900 transition-colors"
            >
              ← Back to checkout
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-2">
            {t('title')}
          </h1>
          <div className="w-16 h-px bg-platinum-400 mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Address Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card-premium p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-6 h-6 text-platinum-700" strokeWidth={1.5} />
                <h2 className="text-2xl font-serif font-bold text-platinum-900">
                  {t('deliveryAddress')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('province')}
                  </label>
                  <input
                    type="text"
                    value={address.province}
                    onChange={(e) =>
                      setAddress({ ...address, province: e.target.value })
                    }
                    placeholder="Улаанбаатар"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('district')}
                  </label>
                  <input
                    type="text"
                    value={address.district}
                    onChange={(e) =>
                      setAddress({ ...address, district: e.target.value })
                    }
                    placeholder="Сүхбаатар"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('khoroo')}
                  </label>
                  <input
                    type="text"
                    value={address.khoroo}
                    onChange={(e) =>
                      setAddress({ ...address, khoroo: e.target.value })
                    }
                    placeholder="1-р хороо"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('detailedAddress')}
                  </label>
                  <input
                    type="text"
                    value={address.detailedAddress}
                    onChange={(e) =>
                      setAddress({ ...address, detailedAddress: e.target.value })
                    }
                    placeholder="Байр, тоот, давхар"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-premium p-6 sticky top-28">
              <h2 className="text-2xl font-serif font-bold text-platinum-900 mb-6">
                {t('orderSummary')}
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-platinum-200">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-platinum-600">
                      {item.product.name[params.locale as 'en' | 'mn']} × {item.quantity}
                    </span>
                    <span className="font-semibold text-platinum-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="text-lg font-semibold text-platinum-900">Total</span>
                <span className="text-3xl font-bold text-platinum-900">
                  {formatPrice(getTotalAmount())}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-metal hover:shadow-metal-hover"
              >
                {t('placeOrder')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
