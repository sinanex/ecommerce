import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

const getProductModel = () => {
  if (mongoose.models.Product) {
    return mongoose.models.Product;
  }
  const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount_price: { type: Number },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  }, { strict: false });
  return mongoose.model('Product', productSchema);
};

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const mockIds = ['1', '2', '3', '4', '5', '6', '7', '8', 'rem-1', 'rem-2', 'rem-3', 'rem-4'];
  let name = '6YARD Product';
  let description = 'Get your hands on the premium gear from 6YARD.';
  let image = 'https://6yardjersey.com/icon.png';

  if (mockIds.includes(id)) {
    name = id === '1' ? 'Manchester Home Kit 24/25' :
           id === '2' ? 'Elite Vapour Training Tee' :
           id === '3' ? 'London Away Kit 24/25' :
           id === '4' ? 'National Pro Match Jersey' :
           id === '5' ? 'Premium Red Kit' :
           id === '6' ? 'Sky Blue Fan Jersey' :
           id === '7' ? 'Pro Training Black' :
           id === '8' ? 'National Home Kit' : 'Match Gear';
  } else {
    try {
      await dbConnect();
      const Product = getProductModel() as any;
      const product = await (Product as any).findById(id).lean() as any;
      if (product) {
        name = product.name;
        description = product.description || description;
        if (product.images && product.images.length > 0) {
          image = product.images[0];
        }
      }
    } catch (e) {
      console.error('Error fetching product for metadata:', e);
    }
  }

  return {
    title: name,
    description: description,
    openGraph: {
      title: `${name} | 6YARD`,
      description: description,
      images: [{ url: image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | 6YARD`,
      description: description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: any }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const mockIds = ['1', '2', '3', '4', '5', '6', '7', '8', 'rem-1', 'rem-2', 'rem-3', 'rem-4'];
  let name = '6YARD Product';
  let description = 'Get your hands on the premium gear from 6YARD.';
  let image = 'https://6yardjersey.com/icon.png';
  let currentPrice = 89.99;

  if (mockIds.includes(id)) {
    name = id === '1' ? 'Manchester Home Kit 24/25' :
           id === '2' ? 'Elite Vapour Training Tee' :
           id === '3' ? 'London Away Kit 24/25' :
           id === '4' ? 'National Pro Match Jersey' :
           id === '5' ? 'Premium Red Kit' :
           id === '6' ? 'Sky Blue Fan Jersey' :
           id === '7' ? 'Pro Training Black' :
           id === '8' ? 'National Home Kit' : 'Match Gear';
    currentPrice = id === '1' ? 89.99 : id === '2' ? 54.99 : id === '3' ? 84.99 : id === '4' ? 79.99 : 89.99;
  } else {
    try {
      await dbConnect();
      const Product = getProductModel() as any;
      const product = await (Product as any).findById(id).lean() as any;
      if (product) {
        name = product.name;
        description = product.description || description;
        if (product.images && product.images.length > 0) {
          image = product.images[0];
        }
        currentPrice = product.discount_price || product.price;
      }
    } catch (e) {
      console.error('Error fetching product for schema:', e);
    }
  }

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": image,
    "description": description,
    "sku": id,
    "brand": {
      "@type": "Brand",
      "name": "6YARD"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": currentPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "url": `https://6yardjersey.com/product/${id}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://6yardjersey.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://6yardjersey.com/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `https://6yardjersey.com/product/${id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient />
    </>
  );
}
