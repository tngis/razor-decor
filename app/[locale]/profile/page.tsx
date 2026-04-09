'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { updateUserProfile, updateUserAddress, getOrders } from '@/lib/firebase/firestore';
import { Address, Order } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, MapPin, Package, CheckCircle2 } from 'lucide-react';

export default function ProfilePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('profile');
  const tOrder = useTranslations('order');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState<Address>(
    user?.address || {
      province: '',
      district: '',
      khoroo: '',
      detailedAddress: '',
    }
  );

  useEffect(() => {
    if (!user) {
      router.push(`/${params.locale}/auth/login`);
      return;
    }

    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.id, {
        displayName,
        email,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUserAddress(user.id, address);
      toast.success('Address updated successfully');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-platinum-100 text-platinum-800 border-platinum-300',
      payment_pending: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
      payment_verified: 'bg-blue-50 text-blue-700 border-blue-200',
      in_production: 'bg-purple-50 text-purple-700 border-purple-200',
      out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-2">
            {t('title')}
          </h1>
          <div className="w-16 h-px bg-platinum-400 mt-4" />
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-12 border-b border-platinum-200">
          {[
            { key: 'info', label: t('personalInfo'), icon: User },
            { key: 'address', label: t('address'), icon: MapPin },
            { key: 'orders', label: t('orders'), icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 px-6 font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-b-2 border-platinum-900 text-platinum-900'
                    : 'text-platinum-600 hover:text-platinum-900'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-premium p-8 max-w-2xl">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('displayName')}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={user.phoneNumber}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-platinum-200 bg-platinum-50 text-platinum-600 cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    loading
                      ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                      : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                  }`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-platinum-400 border-t-platinum-600 rounded-full"
                      />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                      <span>{t('updateProfile')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-premium p-8 max-w-2xl">
              <form onSubmit={handleUpdateAddress} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-platinum-700 mb-2">
                      Province / City
                    </label>
                    <input
                      type="text"
                      value={address.province}
                      onChange={(e) =>
                        setAddress({ ...address, province: e.target.value })
                      }
                      placeholder="Улаанбаатар"
                      className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-platinum-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={address.district}
                      onChange={(e) =>
                        setAddress({ ...address, district: e.target.value })
                      }
                      placeholder="Сүхбаатар"
                      className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-platinum-700 mb-2">
                      Khoroo
                    </label>
                    <input
                      type="text"
                      value={address.khoroo}
                      onChange={(e) =>
                        setAddress({ ...address, khoroo: e.target.value })
                      }
                      placeholder="1-р хороо"
                      className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Detailed Address
                  </label>
                  <input
                    type="text"
                    value={address.detailedAddress}
                    onChange={(e) =>
                      setAddress({ ...address, detailedAddress: e.target.value })
                    }
                    placeholder="Building, apartment, floor"
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                    loading
                      ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                      : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                  }`}
                >
                  {loading ? 'Updating...' : t('updateProfile')}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loading ? (
              <div className="flex justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-platinum-300 border-t-platinum-900 rounded-full"
                />
              </div>
            ) : orders.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-platinum-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-platinum-900 mb-2">No orders yet</h3>
                <p className="text-platinum-600">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="card-premium p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-platinum-900 mb-1">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-platinum-600">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0">
                        <span
                          className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {tOrder(`status.${order.status}`)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 pb-6 border-b border-platinum-200">
                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between"
                        >
                          <span className="text-platinum-700">
                            {item.product.name[params.locale as 'en' | 'mn']} × {item.quantity}
                          </span>
                          <span className="font-semibold text-platinum-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-platinum-900">Total</span>
                      <span className="text-2xl font-bold text-platinum-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
