'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getServices } from '@/lib/firebase/firestore';
import { Service } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function ServicesPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServices(true); // Only visible services
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen pt-20 bg-white">
      {/* Hero Section */}
      {/* <section className="relative py-16 overflow-hidden bg-gradient-to-br from-platinum-50 to-white">
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
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-platinum-900 mb-4 tracking-tight">
              Our Services
            </h1>
            <div className="w-16 h-px bg-platinum-400 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-platinum-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive solutions for all your laser-cut décor needs
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Services List */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card-premium overflow-hidden hover:shadow-premium-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative h-80 bg-platinum-50">
              <Image
                src={service.image}
                alt={service.name[params.locale as 'en' | 'mn']}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-8 md:p-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-platinum-900 mb-4">
                {service.name[params.locale as 'en' | 'mn']}
              </h2>

              <div className="w-16 h-px bg-platinum-400 mb-6" />

              <p className="text-lg text-platinum-600 leading-relaxed mb-6">
                {service.description[params.locale as 'en' | 'mn']}
              </p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-platinum-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-platinum-900" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Get Service Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/${params.locale}/services/${service.id}/request`)}
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg bg-platinum-900 text-white font-semibold hover:bg-platinum-800 transition-all duration-300 shadow-metal hover:shadow-metal-hover"
              >
                <span>Get This Service</span>
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Footer Spacer */}
      <div className="h-20" />
    </div>
  );
}
