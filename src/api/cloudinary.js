// src/api/cloudinary.js
import axios from 'axios';

// Replace these with your actual Cloudinary configuration
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/ddq7it9tz/upload';
const CLOUDINARY_UPLOAD_PRESET = 'IT-help-desk';

/**
 * Helper function to validate file type as image
 * @param {string} fileName - The file name
 * @returns {boolean} - Whether the file is a valid image
 */
export const isValidImage = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};

/**
 * Upload multiple image files to Cloudinary
 * @param {Array<File>} files - Array of image files to upload
 * @returns {Promise<Array>} - Array of uploaded image info objects
 */
export const uploadFilesToCloudinary = async (files) => {
  try {
    // Filter out non-image files
    const imageFiles = files.filter((file) => isValidImage(file.name));
    if (imageFiles.length === 0) {
      throw new Error('No valid image files selected. Supported formats: jpg, jpeg, png, gif, webp.');
    }

    const uploadPromises = imageFiles.map(async (file) => {
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'image'); // Explicitly set resource_type to image

      // Upload the file
      const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Return the image information
      return {
        type: 'image',
        fileName: file.name,
        fileSize: file.size,
        url: response.data.secure_url,
        publicId: response.data.public_id,
        uploadedAt: new Date().toISOString(),
      };
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error);
    throw new Error('Failed to upload images: ' + error.message);
  }
};

/**
 * Helper function to validate URLs
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};


// export { isValidImage };