'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { createService } from '@/lib/firebase/firestore';
import { uploadImage, validateImageFile } from '@/lib/firebase/storage';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddServicePage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: { en: '', mn: '' },
    description: { en: '', mn: '' },
    features: [] as string[],
    visible: true,
    order: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin())) {
      router.push(`/${params.locale}`);
    }
  }, [user, authLoading, isAdmin, router, params.locale]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      validateImageFile(file);
      toast.loading('Uploading image...', { id: 'upload' });
      const url = await uploadImage(file, 'services');
      setImageUrl(url);
      toast.success('Image uploaded successfully!', { id: 'upload' });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      setImageUrl(imageInput.trim());
      setImageInput('');
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.en || !formData.name.mn) {
        throw new Error('Please provide service name in both languages');
      }

      if (!formData.description.en || !formData.description.mn) {
        throw new Error('Please provide description in both languages');
      }

      if (!imageUrl) {
        throw new Error('Please add a service image');
      }

      await createService({
        ...formData,
        image: imageUrl,
      });

      toast.success('Service created successfully!');
      router.push(`/${params.locale}/admin`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 bg-platinum-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-platinum-600 hover:text-platinum-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-4xl font-serif font-bold text-platinum-900 mb-2">Add New Service</h1>
          <div className="w-16 h-px bg-platinum-400" />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="card-premium p-8 space-y-8"
        >
          {/* Service Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">
                Service Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name.en}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">
                Service Name (Mongolian) *
              </label>
              <input
                type="text"
                required
                value={formData.name.mn}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name, mn: e.target.value } })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">
                Description (English) *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description.en}
                onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">
                Description (Mongolian) *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description.mn}
                onChange={(e) => setFormData({ ...formData, description: { ...formData.description, mn: e.target.value } })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-platinum-700 mb-2">Service Image *</label>

            {imageUrl ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-platinum-200 mb-4">
                <img src={imageUrl} alt="Service" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full py-4 rounded-lg border-2 border-dashed transition-all flex items-center justify-center space-x-3 mb-4 ${
                    uploading
                      ? 'border-platinum-300 bg-platinum-50 cursor-not-allowed'
                      : 'border-platinum-400 hover:border-platinum-900 hover:bg-platinum-50'
                  }`}
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-platinum-400 border-t-platinum-900 rounded-full"
                      />
                      <span className="text-platinum-600 font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-platinum-600" strokeWidth={2} />
                      <span className="text-platinum-700 font-medium">Upload Image from Device</span>
                    </>
                  )}
                </button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-platinum-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-platinum-500">or add image URL</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all"
                  >
                    Add
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold text-platinum-700 mb-2">Features</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
                className="flex-1 px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Add</span>
              </button>
            </div>

            {formData.features.length > 0 && (
              <ul className="space-y-2">
                {formData.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-platinum-50 border border-platinum-200"
                  >
                    <span className="text-platinum-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Order and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">Display Order</label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-5 h-5 rounded border-platinum-300 text-platinum-900 focus:ring-platinum-900"
                />
                <span className="text-platinum-700 font-medium">Visible on website</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-platinum-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border border-platinum-300 text-platinum-700 hover:bg-platinum-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                loading
                  ? 'bg-platinum-300 text-platinum-500 cursor-not-allowed'
                  : 'bg-platinum-900 text-white hover:bg-platinum-800 shadow-metal hover:shadow-metal-hover'
              }`}
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
