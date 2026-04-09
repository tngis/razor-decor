'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProduct } from '@/lib/firebase/firestore';
import { useCartStore } from '@/lib/store/cartStore';
import { Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Package, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProductDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(params.id);
      if (!data) {
        router.push(`/${params.locale}/products`);
        return;
      }
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      router.push(`/${params.locale}/products`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success('Added to cart!');
  };

  if (loading) {
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

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-platinum-600 hover:text-platinum-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-platinum-50 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImage] || '/placeholder.jpg'}
                    alt={product.name[params.locale as 'en' | 'mn']}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-platinum-900 shadow-metal'
                        : 'border-platinum-200 hover:border-platinum-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name[params.locale as 'en' | 'mn']} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Category Badge */}
            <div className="inline-flex items-center space-x-2 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-platinum-100 text-platinum-700 text-sm font-medium">
                {product.category}
              </span>
              {product.inStock && (
                <span className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                  <Check className="w-4 h-4" strokeWidth={2} />
                  <span>In Stock</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-4">
              {product.name[params.locale as 'en' | 'mn']}
            </h1>

            <div className="w-16 h-px bg-platinum-400 mb-6" />

            {/* Description */}
            <p className="text-lg text-platinum-600 leading-relaxed mb-8">
              {product.description[params.locale as 'en' | 'mn']}
            </p>

            {/* Price */}
            <div className="mb-8">
              <span className="text-4xl font-bold text-platinum-900">
                ₮{product.price.toLocaleString()}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-platinum-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-lg border-2 border-platinum-300 hover:border-platinum-900 text-platinum-900 font-bold transition-all"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-platinum-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-lg border-2 border-platinum-300 hover:border-platinum-900 text-platinum-900 font-bold transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-4 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${
                product.inStock
                  ? 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                  : 'bg-platinum-200 text-platinum-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </motion.button>

            {/* Features */}
            <div className="mt-12 pt-8 border-t border-platinum-200 space-y-4">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-platinum-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-platinum-900 mb-1">Premium Quality</h3>
                  <p className="text-sm text-platinum-600">
                    Precision laser-cut metal with premium finish
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-platinum-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-platinum-900 mb-1">Fast Delivery</h3>
                  <p className="text-sm text-platinum-600">
                    Delivery within Ulaanbaatar
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-platinum-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-platinum-900 mb-1">Quality Guarantee</h3>
                  <p className="text-sm text-platinum-600">
                    Crafted with attention to detail
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
