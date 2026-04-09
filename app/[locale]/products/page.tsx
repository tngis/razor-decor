'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/firebase/firestore';
import { Product } from '@/types';
import { PremiumProductCard } from '@/components/product/PremiumProductCard';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage({ params }: { params: { locale: string } }) {
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

  const categoryMap = products.reduce<Record<string, true>>((acc, product) => {
    acc[product.category] = true;
    return acc;
  }, {});
  const categories = ['all', ...Object.keys(categoryMap)];

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
      {/* Hero Section */}
      {/* <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-platinum-50 to-white">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #e9ecef 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-platinum-900 mb-4 tracking-tight">
              Our Products
            </h1>
            <div className="w-16 h-px bg-platinum-400 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-platinum-600 max-w-2xl mx-auto leading-relaxed">
              Explore our collection of premium laser-cut metal décor
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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

          <div className="flex items-center space-x-3">
            <SlidersHorizontal className="w-5 h-5 text-platinum-500" strokeWidth={1.5} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 rounded-lg bg-white border border-platinum-200 focus:border-platinum-400 focus:ring-1 focus:ring-platinum-400 outline-none transition-all cursor-pointer font-medium text-platinum-900"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
