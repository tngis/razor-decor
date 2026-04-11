'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts, getServices } from '@/lib/firebase/firestore';
import { Product, Service } from '@/types';
import { PremiumProductCard } from '@/components/product/PremiumProductCard';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function PremiumHomePage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
    loadServices();
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

  const loadServices = async () => {
    try {
      const data = await getServices(true); // Only visible services
      setServices(data.slice(0, 3)); // Show first 3 services
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  // Avoid spreading a `Set` (can require `es2015` + `downlevelIteration` TS flags).
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

  const heroObjectImage = (
    // eslint-disable-next-line @next/next/no-img-element -- large pattern-based SVG from public/
    <img
      src="/Object.svg"
      alt="Razor Decor — custom metal art"
      width={553}
      height={431}
      className="w-full h-full object-contain drop-shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
      draggable={false}
    />
  );

  return (
    <div className="min-h-screen pt-20 ">
      {/* Hero — 3D object + copy */}
      <section className="relative min-h-[calc(100vh-5rem)] md:min-h-0 py-16 md:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-platinum-200/80 via-platinum-50 to-white">
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #9E9E9E 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div
          className="absolute top-1/4 -right-24 w-[min(520px,90vw)] h-[min(520px,90vw)] rounded-full opacity-40 blur-3xl pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.35),transparent_65%)]"
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none bg-[radial-gradient(circle_at_center,rgba(52,58,64,0.12),transparent_70%)]"
          aria-hidden
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="text-sm font-medium text-platinum-600 tracking-[0.2em] uppercase mb-5"
              >
                Est. 2024 — Ulaanbaatar, Mongolia
              </motion.p>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-platinum-950 mb-6 tracking-tight leading-[1.05]">
                Razor Decor
              </h1>

              <div className="w-16 h-px bg-gradient-to-r from-transparent via-platinum-500 to-transparent mx-auto lg:mx-0 mb-8" />

              <p className="text-lg sm:text-xl md:text-2xl text-platinum-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                Where craftsmanship meets innovation. Custom laser-cut metal décor designed for modern spaces.
              </p>

              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-colors duration-300 shadow-premium-lg"
              >
                <span>View Collection</span>
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex justify-center lg:justify-end order-1 lg:order-2"
            >
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] aspect-[553/431]">
                <div
                  className="absolute inset-[-8%] rounded-[40%] opacity-90 blur-2xl pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22)_0%,rgba(206,212,218,0.35)_45%,transparent_72%)]"
                  aria-hidden
                />
                <div
                  className="absolute inset-0 rounded-3xl border border-white/60 bg-white/25 shadow-premium-xl backdrop-blur-[2px] pointer-events-none"
                  aria-hidden
                />
                {reduceMotion ? (
                  <div className="relative w-full h-full p-4 sm:p-6">{heroObjectImage}</div>
                ) : (
                  <motion.div
                    className="relative w-full h-full p-4 sm:p-6"
                    animate={{
                      y: [0, -14, 0],
                      rotate: [0, 1.2, 0, -1.2, 0],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {heroObjectImage}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.slice(0, 6).map((product, index) => (
                <PremiumProductCard
                  key={product.id}
                  product={product}
                  locale={params.locale}
                  index={index}
                />
              ))}
            </div>

            {/* See More Button */}
            {filteredProducts.length > 6 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${params.locale}/products`)}
                  className="px-8 py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-metal hover:shadow-metal-hover"
                >
                  See More Products
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-4">
              Our Services
            </h2>
            <div className="w-16 h-px bg-platinum-400 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-platinum-600 max-w-2xl mx-auto leading-relaxed">
              From custom designs to bulk orders, we bring precision craftsmanship to every project
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-premium overflow-hidden hover:shadow-premium-lg transition-shadow duration-300"
              >
                {/* Service Image */}
                <div className="relative h-48 bg-platinum-50">
                  <Image
                    src={service.image}
                    alt={service.name[params.locale as 'en' | 'mn']}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-platinum-900 mb-3">
                    {service.name[params.locale as 'en' | 'mn']}
                  </h3>

                  <p className="text-platinum-600 leading-relaxed line-clamp-3">
                    {service.description[params.locale as 'en' | 'mn']}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Services Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${params.locale}/services`)}
              className="px-8 py-4 rounded-lg bg-white border-2 border-platinum-900 text-platinum-900 font-semibold hover:bg-platinum-900 hover:text-white transition-all duration-300 shadow-premium"
            >
              View All Services
            </motion.button>
          </motion.div>
        </section>
      )}

      {/* Footer Spacer */}
      <div className="h-20" />
    </div>
  );
}
