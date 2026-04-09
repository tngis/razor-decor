'use client';

import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export const ProductCard = ({ product, locale }: ProductCardProps) => {
  const t = useTranslations('product');
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name[locale as 'en' | 'mn']} added to cart`);
  };

  return (
    <Card hover className="group">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name[locale as 'en' | 'mn']}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name[locale as 'en' | 'mn']}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description[locale as 'en' | 'mn']}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart size={16} className="mr-2" />
              {t('addToCart')}
            </Button>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};
