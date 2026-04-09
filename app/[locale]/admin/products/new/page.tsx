'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { createProduct } from '@/lib/firebase/firestore';
import { uploadImage, validateImageFile } from '@/lib/firebase/storage';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddProductPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: { en: '', mn: '' },
    description: { en: '', mn: '' },
    price: 0,
    category: '',
    inStock: true,
    featured: false,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin())) {
      router.push(`/${params.locale}`);
    }
  }, [user, authLoading, isAdmin, router, params.locale]);

  const handleAddImageUrl = () => {
    if (imageInput.trim()) {
      setImageUrls([...imageUrls, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file
        validateImageFile(file);

        // Upload to Firebase Storage
        toast.loading(`Uploading image ${i + 1} of ${files.length}...`, { id: 'upload' });
        const url = await uploadImage(file, 'products');
        uploadedUrls.push(url);
      }

      setImageUrls([...imageUrls, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`, { id: 'upload' });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.en || !formData.name.mn) {
        throw new Error('Please provide product name in both languages');
      }

      if (!formData.description.en || !formData.description.mn) {
        throw new Error('Please provide description in both languages');
      }

      if (formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      if (!formData.category) {
        throw new Error('Please select a category');
      }

      if (imageUrls.length === 0) {
        throw new Error('Please add at least one image');
      }

      await createProduct({
        ...formData,
        images: imageUrls,
      });

      toast.success('Product created successfully!');
      router.push(`/${params.locale}/admin`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
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

          <h1 className="text-4xl font-serif font-bold text-platinum-900 mb-2">Add New Product</h1>
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
          {/* Product Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">
                Product Name (English) *
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
                Product Name (Mongolian) *
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

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">Price (₮) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-platinum-700 mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Wall Art, Signage"
                className="w-full px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Image Upload/URLs */}
          <div>
            <label className="block text-sm font-semibold text-platinum-700 mb-2">Product Images *</label>

            {/* File Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`w-full py-4 rounded-lg border-2 border-dashed transition-all flex items-center justify-center space-x-3 ${
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
                    <span className="text-platinum-700 font-medium">Upload Images from Device</span>
                    <span className="text-platinum-500 text-sm">(JPG, PNG, WEBP, max 5MB each)</span>
                  </>
                )}
              </button>
            </div>

            {/* Or separator */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-platinum-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-platinum-50 text-platinum-500">or add image URL</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-3 rounded-lg border border-platinum-300 focus:border-platinum-900 focus:ring-2 focus:ring-platinum-900/20 outline-none transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-6 py-3 rounded-lg bg-platinum-900 text-white hover:bg-platinum-800 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>Add</span>
              </button>
            </div>

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-platinum-200">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 rounded border-platinum-300 text-platinum-900 focus:ring-platinum-900"
              />
              <span className="text-platinum-700 font-medium">In Stock</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-platinum-300 text-platinum-900 focus:ring-platinum-900"
              />
              <span className="text-platinum-700 font-medium">Featured Product</span>
            </label>
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
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
