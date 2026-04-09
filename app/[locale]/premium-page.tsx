'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getProducts } from '@/lib/firebase/firestore';
import { Product } from '@/types';
import { PremiumProductCard } from '@/components/product/PremiumProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';

export default function PremiumHomePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('product');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      product.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.mn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Minimal & Sophisticated */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e9ecef 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-platinum-600 tracking-widest uppercase mb-6"
            >
              Est. 2024 — Ulaanbaatar, Mongolia
            </motion.p>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-platinum-900 mb-6 tracking-tight">
              Precision Metal Art
            </h1>

            <div className="w-16 h-px bg-platinum-400 mx-auto mb-8" />

            <p className="text-xl md:text-2xl text-platinum-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
              Where craftsmanship meets innovation. Custom laser-cut metal décor
              <br className="hidden md:block" />
              designed for modern spaces.
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-premium"
            >
              <span>View Collection</span>
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-4">
            Our Collection
          </h2>
          <div className="w-12 h-px bg-platinum-400 mx-auto" />
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-white border border-platinum-200 focus:border-platinum-400 focus:ring-1 focus:ring-platinum-400 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <SlidersHorizontal className="w-5 h-5 text-platinum-500" strokeWidth={1.5} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 rounded-lg bg-white border border-platinum-200 focus:border-platinum-400 focus:ring-1 focus:ring-platinum-400 outline-none transition-all cursor-pointer font-medium text-platinum-900"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Products' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-16">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-platinum-900 text-white shadow-metal'
                  : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
              }`}
            >
              {category === 'all' ? 'All' : category}
              <span className="ml-2 text-sm opacity-70">
                ({category === 'all' ? products.length : products.filter((p) => p.category === category).length})
              </span>
            </motion.button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-platinum-400" strokeWidth={1} />
            </div>
            <p className="text-xl text-platinum-600">No products found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <PremiumProductCard
                key={product.id}
                product={product}
                locale={params.locale}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section - Minimal & Elegant */}
      <section className="relative py-24 mt-20 bg-platinum-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-6">
              Custom Creations
            </h2>
            <div className="w-12 h-px bg-platinum-400 mx-auto mb-8" />
            <p className="text-xl text-platinum-600 mb-10 leading-relaxed">
              Have a unique vision? Let us bring it to life with precision CNC laser cutting.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg bg-white border-2 border-platinum-900 text-platinum-900 font-semibold hover:bg-platinum-900 hover:text-white transition-all duration-300 shadow-premium"
            >
              Request Custom Design
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="h-20" />
    </div>
  );
}
