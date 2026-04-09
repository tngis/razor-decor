'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getOrders, updateOrderStatus, getProducts, getServices, getServiceRequests, updateServiceRequestStatus } from '@/lib/firebase/firestore';
import { Order, Product, Service, ServiceRequest } from '@/types';
import { formatPrice, formatDateTime, formatPhoneNumber } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Check, Shield, Package, MapPin, User, Calendar, DollarSign, Plus, Edit, Eye, EyeOff, FileText, Phone, Mail, MessageSquare } from 'lucide-react';

export default function AdminPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('admin');
  const tOrder = useTranslations('order');
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [requestFilterStatus, setRequestFilterStatus] = useState<ServiceRequest['status'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'services' | 'requests'>('orders');

  useEffect(() => {
    if (!user) {
      router.push(`/${params.locale}/auth/login`);
      return;
    }

    if (!isAdmin()) {
      router.push(`/${params.locale}`);
      toast.error('Access denied');
      return;
    }

    loadOrders();
    loadProducts();
    loadServices();
    loadRequests();
  }, [user, isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    }
  };

  const loadServices = async () => {
    try {
      const data = await getServices(false); // Get all services including hidden
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    }
  };

  const loadRequests = async () => {
    try {
      const data = await getServiceRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleRequestStatusUpdate = async (requestId: string, newStatus: ServiceRequest['status']) => {
    try {
      await updateServiceRequestStatus(requestId, newStatus);
      toast.success('Request status updated');
      loadRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const statusFilters: (Order['status'] | 'all')[] = [
    'all',
    'payment_pending',
    'payment_verified',
    'in_production',
    'out_for_delivery',
    'delivered',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-platinum-300 border-t-platinum-900 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-platinum-900" strokeWidth={1.5} />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900">
              {t('title')}
            </h1>
          </div>
          <div className="w-16 h-px bg-platinum-400" />
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'orders'
                ? 'bg-platinum-900 text-white shadow-metal'
                : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'requests'
                ? 'bg-platinum-900 text-white shadow-metal'
                : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
            }`}
          >
            Requests
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-platinum-900 text-white shadow-metal'
                : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'services'
                ? 'bg-platinum-900 text-white shadow-metal'
                : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
            }`}
          >
            Services
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Status Filters */}
            <div className="flex flex-wrap gap-3 mb-12">
          {statusFilters.map((status) => {
            const count = status === 'all' ? orders.length : orders.filter((o) => o.status === status).length;
            return (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  filterStatus === status
                    ? 'bg-platinum-900 text-white shadow-metal'
                    : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
                }`}
              >
                {status === 'all' ? 'All Orders' : tOrder(`status.${status}`)}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filterStatus === status
                    ? 'bg-white/20 text-white'
                    : 'bg-platinum-100 text-platinum-700'
                }`}>
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-platinum-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold text-platinum-900 mb-2">No orders found</h3>
            <p className="text-platinum-600">Orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium p-8"
              >
                {/* Order Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pb-6 border-b border-platinum-200">
                  <div>
                    <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">Order ID</p>
                    <p className="font-mono font-bold text-platinum-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <User className="w-4 h-4 text-platinum-500 mt-1" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">{t('customer')}</p>
                      <p className="font-semibold text-platinum-900">
                        {formatPhoneNumber(order.user?.phoneNumber || 'N/A')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-4 h-4 text-platinum-500 mt-1" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">{t('date')}</p>
                      <p className="font-semibold text-platinum-900">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <DollarSign className="w-4 h-4 text-platinum-500 mt-1" strokeWidth={1.5} />
                    <div>
                      <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">{t('amount')}</p>
                      <p className="text-2xl font-bold text-platinum-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="text-lg font-serif font-bold text-platinum-900 mb-4">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center bg-platinum-50 p-4 rounded-lg border border-platinum-200"
                      >
                        <span className="text-platinum-700 font-medium">
                          {item.product.name[params.locale as 'en' | 'mn']} × {item.quantity}
                        </span>
                        <span className="font-bold text-platinum-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-8 bg-platinum-50 p-6 rounded-lg border border-platinum-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-5 h-5 text-platinum-700" strokeWidth={1.5} />
                    <h3 className="text-lg font-serif font-bold text-platinum-900">
                      Delivery Address
                    </h3>
                  </div>
                  <p className="text-platinum-700 leading-relaxed">
                    {order.deliveryAddress.province}, {order.deliveryAddress.district}, {order.deliveryAddress.khoroo}
                    <br />
                    {order.deliveryAddress.detailedAddress}
                  </p>
                </div>

                {/* Order Status Management */}
                <div>
                  <h3 className="text-lg font-serif font-bold text-platinum-900 mb-4">
                    {t('orderStatus')}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { status: 'payment_verified', label: t('received') },
                      { status: 'in_production', label: t('inProduction') },
                      { status: 'out_for_delivery', label: t('outForDelivery') },
                      { status: 'delivered', label: t('delivered') },
                    ].map((item) => {
                      const isActive =
                        order.status === item.status ||
                        (item.status === 'payment_verified' &&
                          ['in_production', 'out_for_delivery', 'delivered'].includes(order.status)) ||
                        (item.status === 'in_production' &&
                          ['out_for_delivery', 'delivered'].includes(order.status)) ||
                        (item.status === 'out_for_delivery' && order.status === 'delivered');

                      const isPending =
                        order.status === 'payment_pending' && item.status === 'payment_verified';

                      return (
                        <button
                          key={item.status}
                          onClick={() =>
                            handleStatusUpdate(order.id, item.status as Order['status'])
                          }
                          disabled={isActive && !isPending}
                          className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                            isActive
                              ? 'bg-green-50 border-green-500 text-green-900'
                              : 'bg-white border-platinum-300 hover:border-platinum-900 text-platinum-700'
                          } ${isPending ? 'ring-2 ring-accent-gold animate-pulse' : ''}`}
                        >
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <Check size={20} className="text-green-600" strokeWidth={2} />
                            </div>
                          )}
                          <p className="text-sm font-semibold">{item.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  {order.status === 'payment_pending' && (
                    <div className="mt-6 p-4 bg-accent-gold/10 border border-accent-gold/30 rounded-lg">
                      <p className="text-sm text-accent-gold font-semibold flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>Payment verification required. Click "Received" to verify payment.</span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <>
            {/* Status Filters */}
            <div className="flex flex-wrap gap-3 mb-8">
              {(['all', 'pending', 'contacted', 'in_progress', 'completed', 'cancelled'] as (ServiceRequest['status'] | 'all')[]).map((status) => {
                const count = status === 'all' ? requests.length : requests.filter((r) => r.status === status).length;
                return (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRequestFilterStatus(status)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 capitalize ${
                      requestFilterStatus === status
                        ? 'bg-platinum-900 text-white shadow-metal'
                        : 'bg-white text-platinum-700 border border-platinum-200 hover:border-platinum-400'
                    }`}
                  >
                    {status === 'all' ? 'All Requests' : status.replace('_', ' ')}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      requestFilterStatus === status
                        ? 'bg-white/20 text-white'
                        : 'bg-platinum-100 text-platinum-700'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Requests List */}
            {(requestFilterStatus === 'all' ? requests : requests.filter((r) => r.status === requestFilterStatus)).length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-platinum-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-platinum-900 mb-2">No requests found</h3>
                <p className="text-platinum-600">Service requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(requestFilterStatus === 'all' ? requests : requests.filter((r) => r.status === requestFilterStatus)).map((request, index) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    contacted: 'bg-blue-100 text-blue-800 border-blue-200',
                    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
                    completed: 'bg-green-100 text-green-800 border-green-200',
                    cancelled: 'bg-red-100 text-red-800 border-red-200',
                  };

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card-premium p-8"
                    >
                      {/* Request Header */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 pb-6 border-b border-platinum-200">
                        <div>
                          <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">Request ID</p>
                          <p className="font-mono font-bold text-platinum-900">
                            #{request.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 text-platinum-500 mt-1" strokeWidth={1.5} />
                          <div>
                            <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">Customer</p>
                            <p className="font-semibold text-platinum-900">{request.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Calendar className="w-4 h-4 text-platinum-500 mt-1" strokeWidth={1.5} />
                          <div>
                            <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">Date</p>
                            <p className="font-semibold text-platinum-900">
                              {formatDateTime(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-platinum-500 mb-2 uppercase tracking-wide">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[request.status]}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="mb-6">
                        <h3 className="text-lg font-serif font-bold text-platinum-900 mb-2">
                          Service: {request.serviceName[params.locale as 'en' | 'mn']}
                        </h3>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-platinum-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-platinum-600" strokeWidth={1.5} />
                          <span className="text-platinum-700">{request.phoneNumber}</span>
                        </div>
                        {request.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-platinum-600" strokeWidth={1.5} />
                            <span className="text-platinum-700">{request.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div className="mb-6 p-4 bg-platinum-50 rounded-lg border border-platinum-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-platinum-700" strokeWidth={1.5} />
                          <h4 className="font-semibold text-platinum-900">Project Details</h4>
                        </div>
                        <p className="text-platinum-700 leading-relaxed whitespace-pre-wrap">
                          {request.message}
                        </p>
                      </div>

                      {/* Status Management */}
                      <div>
                        <h4 className="text-lg font-serif font-bold text-platinum-900 mb-4">
                          Update Status
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {(['pending', 'contacted', 'in_progress', 'completed', 'cancelled'] as ServiceRequest['status'][]).map((status) => {
                            const isActive = request.status === status;

                            return (
                              <button
                                key={status}
                                onClick={() => handleRequestStatusUpdate(request.id, status)}
                                disabled={isActive}
                                className={`relative p-3 rounded-lg border-2 transition-all duration-300 capitalize text-sm ${
                                  isActive
                                    ? statusColors[status]
                                    : 'bg-white border-platinum-300 hover:border-platinum-900 text-platinum-700'
                                }`}
                              >
                                {isActive && (
                                  <div className="absolute top-2 right-2">
                                    <Check size={16} className="text-current" strokeWidth={2} />
                                  </div>
                                )}
                                <p className="font-semibold">{status.replace('_', ' ')}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-platinum-900">
                Manage Products ({products.length})
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${params.locale}/admin/products/new`)}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all shadow-metal"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Add Product</span>
              </motion.button>
            </div>

            {products.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-platinum-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-platinum-900 mb-2">No products yet</h3>
                <p className="text-platinum-600 mb-6">Start by adding your first product</p>
                <button
                  onClick={() => router.push(`/${params.locale}/admin/products/new`)}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  <span>Add Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-premium overflow-hidden hover:shadow-premium-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-platinum-50">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name.en}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-platinum-400" strokeWidth={1} />
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                          Out of Stock
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-accent-gold text-white text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-platinum-600 uppercase tracking-wide">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-platinum-900 mb-2 line-clamp-1">
                        {product.name.en}
                      </h3>
                      <p className="text-sm text-platinum-600 mb-4 line-clamp-2">
                        {product.description.en}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-platinum-200">
                        <p className="text-xl font-bold text-platinum-900">
                          {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={() => router.push(`/${params.locale}/admin/products/${product.id}/edit`)}
                          className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2} />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-platinum-900">
                Manage Services ({services.length})
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${params.locale}/admin/services/new`)}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all shadow-metal"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Add Service</span>
              </motion.button>
            </div>

            {services.length === 0 ? (
              <div className="card-premium p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-platinum-100 flex items-center justify-center">
                  <Package className="w-10 h-10 text-platinum-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-platinum-900 mb-2">No services yet</h3>
                <p className="text-platinum-600 mb-6">Start by adding your first service</p>
                <button
                  onClick={() => router.push(`/${params.locale}/admin/services/new`)}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all"
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  <span>Add Service</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-premium overflow-hidden hover:shadow-premium-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-platinum-50">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name.en}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-platinum-400" strokeWidth={1} />
                        </div>
                      )}
                      {!service.visible && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gray-500 text-white text-xs font-semibold flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" strokeWidth={2} />
                          <span>Hidden</span>
                        </div>
                      )}
                      {service.visible && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" strokeWidth={2} />
                          <span>Visible</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-platinum-600 uppercase tracking-wide">
                          Order: {service.order}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-platinum-900 mb-2 line-clamp-1">
                        {service.name.en}
                      </h3>
                      <p className="text-sm text-platinum-600 mb-4 line-clamp-2">
                        {service.description.en}
                      </p>
                      <div className="flex items-center justify-end pt-4 border-t border-platinum-200">
                        <button
                          onClick={() => router.push(`/${params.locale}/admin/services/${service.id}/edit`)}
                          className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2} />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
