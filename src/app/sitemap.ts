import { MetadataRoute } from 'next';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

const getProductModel = () => {
  if (mongoose.models.Product) {
    return mongoose.models.Product;
  }
  const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
  return mongoose.model('Product', productSchema);
};

const getCategoryModel = () => {
  if (mongoose.models.Category) {
    return mongoose.models.Category;
  }
  const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
  });
  return mongoose.model('Category', categorySchema);
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://6yardjersey.com';

  // Base routes
  const routes = [
    '',
    '/cart',
    '/checkout',
    '/profile',
    '/orders',
    '/admin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  let categoryRoutes: any[] = [];
  let productRoutes: any[] = [];

  try {
    await dbConnect();
    
    // Fetch products directly from MongoDB to avoid fetch limits or relative URL build failures
    const ProductModel = getProductModel() as any;
    const products = await ProductModel.find({ isAvailable: true }).select('_id updated_at').lean();
    productRoutes = products.map((prod: any) => ({
      url: `${baseUrl}/product/${prod._id}`,
      lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    // Fetch categories directly from MongoDB
    const CategoryModel = getCategoryModel() as any;
    const categories = await CategoryModel.find({}).select('name').lean();
    categoryRoutes = categories.map((cat: any) => ({
      url: `${baseUrl}/category/${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Error generating dynamic routes for sitemap:', e);
  }

  return [...routes, ...categoryRoutes, ...productRoutes];
}
