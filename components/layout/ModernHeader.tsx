'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, Menu, X, Sparkles, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { signOut } from '@/lib/firebase/auth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ModernHeader = ({ locale }: { locale: string }) => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'mn' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-soft-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${locale}`)}
            className="cursor-pointer flex items-center space-x-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">
                Razor Decor
              </h1>
              <p className="text-xs text-gray-500 font-medium">Metal Art Studio</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { href: '', label: t('home') },
              { href: '/products', label: t('products') },
            ].map((link) => (
              <motion.button
                key={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${locale}${link.href}`)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  pathname === `/${locale}${link.href}`
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-glow'
                    : 'text-gray-700 hover:bg-white/50'
                }`}
              >
                {link.label}
              </motion.button>
            ))}

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/${locale}/cart`)}
              className="relative p-3 rounded-xl hover:bg-white/50 transition-all ml-2"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-accent-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-glow"
                  >
                    {itemCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2 ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${locale}/profile`)}
                  className="px-4 py-2 rounded-xl hover:bg-white/50 text-gray-700 font-medium transition-all flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{t('profile')}</span>
                </motion.button>

                {user.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/${locale}/admin`)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-glow hover:shadow-glow-lg transition-all flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>{t('admin')}</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="ml-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                {t('login')}
              </motion.button>
            )}

            {/* Language Switcher */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchLocale}
              className="ml-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-primary-500 text-gray-700 font-medium transition-all"
            >
              {locale === 'en' ? '🇲🇳 MN' : '🇬🇧 EN'}
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-gray-200/50"
          >
            <div className="px-4 py-6 space-y-3">
              <button
                onClick={() => {
                  router.push(`/${locale}`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 transition-all font-medium"
              >
                {t('home')}
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/products`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 transition-all font-medium"
              >
                {t('products')}
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/cart`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 transition-all font-medium flex items-center justify-between"
              >
                <span>{t('cart')}</span>
                {itemCount > 0 && (
                  <span className="bg-gradient-to-r from-accent-500 to-pink-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => {
                      router.push(`/${locale}/profile`);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/50 transition-all font-medium"
                  >
                    {t('profile')}
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        router.push(`/${locale}/admin`);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                    >
                      {t('admin')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-all"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push(`/${locale}/auth/login`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold"
                >
                  {t('login')}
                </button>
              )}

              <button
                onClick={() => {
                  switchLocale();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-primary-500 font-medium transition-all"
              >
                {locale === 'en' ? '🇲🇳 Монгол' : '🇬🇧 English'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
