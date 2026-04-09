'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { signOut } from '@/lib/firebase/auth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PremiumHeader = ({ locale }: { locale: string }) => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'frosted shadow-premium-lg border-b border-platinum-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push(`/${locale}`)}
            className="cursor-pointer flex items-center space-x-3"
          >
            <div className="text-3xl font-serif font-bold metallic-text tracking-tight">
              RAZOR DECOR
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { href: '', label: t('home') },
              { href: '/products', label: t('products') },
              { href: '/services', label: t('services') },
            ].map((link) => (
              <motion.button
                key={link.href}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/${locale}${link.href}`)}
                className={`text-sm font-medium tracking-wide transition-all duration-300 ${
                  pathname === `/${locale}${link.href}`
                    ? 'text-platinum-900 border-b-2 border-platinum-900 pb-1'
                    : 'text-platinum-600 hover:text-platinum-900'
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
              className="relative p-2"
            >
              <ShoppingBag className="w-5 h-5 text-platinum-700" strokeWidth={1.5} />
              {mounted && (
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-platinum-900 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-platinum-300">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/${locale}/profile`)}
                  className="flex items-center space-x-2 text-sm text-platinum-700 hover:text-platinum-900 transition-colors"
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-medium">{t('profile')}</span>
                </motion.button>

                {user.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/${locale}/admin`)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-platinum-900 text-white text-sm font-medium hover:bg-platinum-800 transition-colors"
                  >
                    <Package className="w-4 h-4" strokeWidth={1.5} />
                    <span>{t('admin')}</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 text-platinum-700 hover:text-platinum-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="ml-4 px-6 py-2.5 rounded-lg bg-platinum-900 text-white text-sm font-semibold hover:bg-platinum-800 transition-all duration-300"
              >
                {t('login')}
              </motion.button>
            )}

            {/* Language Switcher */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={switchLocale}
              className="ml-2 px-3 py-2 rounded-lg border border-platinum-300 text-platinum-700 text-sm font-medium hover:border-platinum-400 hover:bg-platinum-50 transition-all"
            >
              {locale === 'en' ? 'MN' : 'EN'}
            </motion.button>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-platinum-900" />
            ) : (
              <Menu size={24} className="text-platinum-900" />
            )}
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
            className="md:hidden frosted border-t border-platinum-200"
          >
            <div className="px-4 py-6 space-y-2">
              <button
                onClick={() => {
                  router.push(`/${locale}`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-platinum-700 hover:bg-platinum-50 transition-all font-medium"
              >
                {t('home')}
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/products`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-platinum-700 hover:bg-platinum-50 transition-all font-medium"
              >
                {t('products')}
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/services`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-platinum-700 hover:bg-platinum-50 transition-all font-medium"
              >
                {t('services')}
              </button>
              <button
                onClick={() => {
                  router.push(`/${locale}/cart`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-platinum-700 hover:bg-platinum-50 transition-all font-medium flex items-center justify-between"
              >
                <span>{t('cart')}</span>
                {mounted && itemCount > 0 && (
                  <span className="bg-platinum-900 text-white text-xs font-semibold rounded-full px-2 py-1">
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
                    className="w-full text-left px-4 py-3 rounded-lg text-platinum-700 hover:bg-platinum-50 transition-all font-medium"
                  >
                    {t('profile')}
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        router.push(`/${locale}/admin`);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg bg-platinum-900 text-white font-medium"
                    >
                      {t('admin')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all"
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
                  className="w-full px-4 py-3 rounded-lg bg-platinum-900 text-white font-semibold"
                >
                  {t('login')}
                </button>
              )}

              <button
                onClick={() => {
                  switchLocale();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg border border-platinum-300 font-medium transition-all"
              >
                {locale === 'en' ? 'Монгол' : 'English'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
