import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload an image to Firebase Storage
 * @param file - The image file to upload
 * @param folder - The folder path in storage (e.g., 'products')
 * @returns The download URL of the uploaded image
 */
export const uploadImage = async (file: File, folder: string = 'products'): Promise<string> => {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${filename}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param files - Array of image files to upload
 * @param folder - The folder path in storage
 * @param onProgress - Optional callback for upload progress
 * @returns Array of download URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'products',
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadImage(file, folder).then((url) => {
        if (onProgress) {
          const progress = ((index + 1) / files.length) * 100;
          onProgress(progress);
        }
        return url;
      })
    );

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The full download URL of the image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);

    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns true if valid, throws error if invalid
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): boolean => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, WEBP, or GIF images.');
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  return true;
};
