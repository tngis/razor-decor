'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getService, createServiceRequest } from '@/lib/firebase/firestore';
import { useAuthStore } from '@/lib/store/authStore';
import { Service } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ServiceRequestPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    loadService();
  }, [params.id]);

  const loadService = async () => {
    try {
      const data = await getService(params.id);
      if (!data) {
        toast.error('Service not found');
        router.push(`/${params.locale}/services`);
        return;
      }
      setService(data);

      // Pre-fill user data if logged in
      if (user) {
        setFormData((prev) => ({
          ...prev,
          customerName: user.displayName || '',
          phoneNumber: user.phoneNumber || '',
          email: user.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Failed to load service');
      router.push(`/${params.locale}/services`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!service) return;

      if (!formData.customerName.trim()) {
        throw new Error('Please enter your name');
      }

      if (!formData.phoneNumber.trim()) {
        throw new Error('Please enter your phone number');
      }

      if (!formData.message.trim()) {
        throw new Error('Please provide details about your request');
      }

      await createServiceRequest({
        serviceId: service.id,
        serviceName: service.name,
        userId: user?.id,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        message: formData.message,
        status: 'pending',
      });

      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
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

  if (!service) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-20 bg-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full text-center"
        >
          <div className="card-premium p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2} />
            </motion.div>

            <h1 className="text-3xl font-serif font-bold text-platinum-900 mb-4">
              Request Received!
            </h1>

            <div className="w-16 h-px bg-platinum-400 mx-auto mb-6" />

            <p className="text-lg text-platinum-600 mb-8 leading-relaxed">
              Thank you for your interest in our services. We have received your request and will
              contact you shortly to discuss the details.
            </p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${params.locale}/services`)}
                className="w-full px-8 py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-metal"
              >
                Back to Services
              </motion.button>

              <button
                onClick={() => router.push(`/${params.locale}`)}
                className="w-full px-8 py-4 rounded-lg border border-platinum-300 text-platinum-700 font-semibold hover:bg-platinum-50 transition-all"
              >
                Go to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-platinum-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6 h-fit"
          >
            <div className="relative h-48 rounded-lg overflow-hidden mb-4">
              <Image
                src={service.image}
                alt={service.name[params.locale as 'en' | 'mn']}
                fill
                className="object-cover"
              />
            </div>

            <h2 className="text-2xl font-serif font-bold text-platinum-900 mb-3">
              {service.name[params.locale as 'en' | 'mn']}
            </h2>

            <p className="text-platinum-600 leading-relaxed mb-4">
              {service.description[params.locale as 'en' | 'mn']}
            </p>

            {service.features && service.features.length > 0 && (
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-platinum-700 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-platinum-900" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Request Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-premium p-8">
              <h1 className="text-3xl font-serif font-bold text-platinum-900 mb-2">
                Request This Service
              </h1>
              <div className="w-16 h-px bg-platinum-400 mb-6" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    placeholder="99887766"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-platinum-700 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all resize-none"
                    placeholder="Please provide details about your project, requirements, timeline, etc."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    submitting
                      ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                      : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
                  }`}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-platinum-400 border-t-platinum-600 rounded-full"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" strokeWidth={2} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
