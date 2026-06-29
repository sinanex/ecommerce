import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

export const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

export const extractPublicId = (url: string): string | null => {
  if (!url) return null;
  
  // If it's already a public ID (doesn't start with http/https), return as is
  if (!url.startsWith('http')) return url;

  try {
    const parts = url.split('/upload/');
    if (parts.length !== 2) return null;
    let path = parts[1];
    
    // Check if the path starts with a version number like "v123456789/"
    if (/^v\d+\//.test(path)) {
      path = path.substring(path.indexOf('/') + 1);
    }
    
    // Remove the extension
    const lastDot = path.lastIndexOf('.');
    if (lastDot !== -1) {
      path = path.substring(0, lastDot);
    }
    return path;
  } catch (e) {
    return null;
  }
};

export const deleteFromCloudinary = async (urlOrPublicId: string): Promise<void> => {
  const publicId = extractPublicId(urlOrPublicId);
  if (!publicId) {
    return Promise.resolve(); // Nothing to delete
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
