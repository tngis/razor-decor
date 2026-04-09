'use client';

import { Product } from '@/types';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ModernProductCardProps {
  product: Product;
  locale: string;
  index: number;
}

export const ModernProductCard = ({ product, locale, index }: ModernProductCardProps) => {
  const t = useTranslations('product');
  const addItem = useCartStore((state) => state.addItem);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(
      <div className="flex items-center space-x-2">
        <ShoppingCart className="w-5 h-5" />
        <span>{t('addToCart')} ✓</span>
      </div>,
      {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
        },
      }
    );
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />

      {/* Card Container */}
      <div className="relative card-modern overflow-hidden cursor-pointer">
        {/* Image Container */}
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name[locale as 'en' | 'mn']}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 mesh-gradient">
              <Sparkles className="w-16 h-16 mb-2 animate-pulse" />
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Quick Actions Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute top-4 right-4 flex flex-col space-y-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-3 rounded-xl glass backdrop-blur-xl transition-all ${
                isLiked ? 'bg-red-500 text-white' : 'hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl glass backdrop-blur-xl hover:bg-white transition-all"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Status Badge */}
          {!product.inStock ? (
            <div className="absolute top-4 left-4 px-4 py-2 rounded-xl glass backdrop-blur-xl border border-white/20">
              <span className="text-sm font-semibold text-red-600">{t('outOfStock')}</span>
            </div>
          ) : (
            product.featured && (
              <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-pink-500 shadow-glow">
                <span className="text-sm font-semibold text-white flex items-center space-x-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Featured</span>
                </span>
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:gradient-text transition-all">
            {product.name[locale as 'en' | 'mn']}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description[locale as 'en' | 'mn']}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Price */}
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('price')}</p>
              <p className="text-2xl font-bold gradient-text">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`p-4 rounded-xl transition-all duration-300 ${
                product.inStock
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-glow hover:shadow-glow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Hover Border Animation */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-400/50 transition-all duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
};
