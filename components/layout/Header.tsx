'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useCartStore } from '@/lib/store/cartStore';
import { signOut } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export const Header = ({ locale }: { locale: string }) => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              Razor Decor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={`/${locale}`}
              className="text-gray-700 hover:text-primary-600 transition"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="text-gray-700 hover:text-primary-600 transition"
            >
              {t('products')}
            </Link>

            {/* Cart */}
            <Link
              href={`/${locale}/cart`}
              className="relative text-gray-700 hover:text-primary-600 transition"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/${locale}/profile`)}
                  className="text-gray-700 hover:text-primary-600 transition px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  <User size={20} className="inline mr-2" />
                  {t('profile')}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => router.push(`/${locale}/admin`)}
                    className="bg-accent-600 text-white px-3 py-1 rounded-md hover:bg-accent-700 transition"
                  >
                    {t('admin')}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary-600 transition p-2 rounded-md hover:bg-gray-100"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="bg-primary-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-primary-700 transition"
              >
                {t('login')}
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              {locale === 'en' ? 'MN' : 'EN'}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href={`/${locale}`} className="text-gray-700">
                {t('home')}
              </Link>
              <Link href={`/${locale}/products`} className="text-gray-700">
                {t('products')}
              </Link>
              <Link href={`/${locale}/cart`} className="text-gray-700">
                {t('cart')} ({itemCount})
              </Link>
              {user ? (
                <>
                  <Link href={`/${locale}/profile`} className="text-gray-700">
                    {t('profile')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link href={`/${locale}/admin`} className="text-gray-700">
                      {t('admin')}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-gray-700">
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link href={`/${locale}/auth/login`} className="text-gray-700">
                  {t('login')}
                </Link>
              )}
              <button onClick={switchLocale} className="text-left text-gray-700">
                {locale === 'en' ? 'Монгол' : 'English'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
