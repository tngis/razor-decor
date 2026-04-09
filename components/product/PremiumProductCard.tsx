'use client';

import { Product } from '@/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

interface PremiumProductCardProps {
  product: Product;
  locale: string;
  index: number;
}

export const PremiumProductCard = ({ product, locale, index }: PremiumProductCardProps) => {
  const t = useTranslations('product');
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(t('addToCart'), {
      style: {
        background: '#212529',
        color: 'white',
        borderRadius: '8px',
        padding: '16px',
      },
    });
  };

  const handleCardClick = () => {
    router.push(`/${locale}/products/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-premium overflow-hidden hover:shadow-premium-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-platinum-50">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name[locale as 'en' | 'mn']}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-platinum-400" strokeWidth={1} />
          </div>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
            Out of Stock
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-accent-gold text-white text-xs font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-platinum-600 uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-platinum-900 mb-2 line-clamp-1">
          {product.name[locale as 'en' | 'mn']}
        </h3>

        {/* Description */}
        <p className="text-sm text-platinum-600 mb-4 line-clamp-2">
          {product.description[locale as 'en' | 'mn']}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-platinum-200 mt-auto">
          <p className="text-xl font-bold text-platinum-900">
            {formatPrice(product.price)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              product.inStock
                ? 'bg-platinum-900 text-white hover:bg-platinum-800'
                : 'bg-platinum-200 text-platinum-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span>{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
