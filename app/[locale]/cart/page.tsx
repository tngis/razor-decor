'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { formatPrice } from '@/lib/utils/format';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CartPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('cart');
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, updateQuantity, removeItem, getTotalAmount } = useCartStore();
  const total = getTotalAmount();

  const handleCheckout = () => {
    if (!user) {
      router.push(`/${params.locale}/auth/login`);
      return;
    }
    router.push(`/${params.locale}/checkout`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-platinum-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-platinum-900 mb-4">{t('empty')}</h2>
          <p className="text-platinum-600 mb-8">Your shopping cart is waiting to be filled</p>
          <button
            onClick={() => router.push(`/${params.locale}`)}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-premium"
          >
            <span>{t('continueShopping')}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
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
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6 hover-lift"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-platinum-50 flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name[params.locale as 'en' | 'mn']}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-platinum-400">
                        <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-platinum-900 mb-2">
                      {item.product.name[params.locale as 'en' | 'mn']}
                    </h3>
                    <p className="text-sm text-platinum-600 mb-4">
                      {formatPrice(item.product.price)} {t('each')}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-platinum-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-2 hover:bg-platinum-50 text-platinum-700 transition-colors"
                        >
                          <Minus size={18} strokeWidth={2} />
                        </button>
                        <span className="px-6 py-2 font-semibold text-platinum-900 border-x border-platinum-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-2 hover:bg-platinum-50 text-platinum-700 transition-colors"
                        >
                          <Plus size={18} strokeWidth={2} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-xs text-platinum-500 mb-1">Subtotal</p>
                    <p className="text-2xl font-bold text-platinum-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-premium p-6 sticky top-28"
            >
              <h2 className="text-2xl font-serif font-bold text-platinum-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-platinum-200">
                <div className="flex justify-between text-platinum-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-platinum-600">
                  <span>Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-semibold text-platinum-900">{t('total')}</span>
                <span className="text-3xl font-bold text-platinum-900">{formatPrice(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-metal hover:shadow-metal-hover mb-3"
              >
                {t('checkout')}
              </button>

              <button
                onClick={() => router.push(`/${params.locale}`)}
                className="w-full py-4 rounded-lg bg-white border-2 border-platinum-200 text-platinum-900 font-semibold hover:border-platinum-400 hover:bg-platinum-50 transition-all duration-300"
              >
                {t('continueShopping')}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
