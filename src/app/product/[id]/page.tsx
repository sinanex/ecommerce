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
  let name = 'KITBAY Product';
  let description = 'Get your hands on the premium shoes from KITBAY.';
  let image = 'https://kitbayshoes.com/icon.png';

  if (mockIds.includes(id)) {
    name = id === '1' ? 'Classic White Sneakers' :
           id === '2' ? 'Vapour Running Shoes' :
           id === '3' ? 'London Turf Shoes' :
           id === '4' ? 'Pro Turf Match Shoes' :
           id === '5' ? 'Premium Red Football Shoes' :
           id === '6' ? 'Sky Blue Fan Shoes' :
           id === '7' ? 'Pro Training Running Shoes' :
           id === '8' ? 'National Football Shoes' : 'Premium Shoes';
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
      title: `${name} | KITBAY`,
      description: description,
      images: [{ url: image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | KITBAY`,
      description: description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: any }) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const mockIds = ['1', '2', '3', '4', '5', '6', '7', '8', 'rem-1', 'rem-2', 'rem-3', 'rem-4'];
  let name = 'KITBAY Product';
  let description = 'Get your hands on the premium shoes from KITBAY.';
  let image = 'https://kitbayshoes.com/icon.png';
  let currentPrice = 89.99;

  if (mockIds.includes(id)) {
    name = id === '1' ? 'Classic White Sneakers' :
           id === '2' ? 'Vapour Running Shoes' :
           id === '3' ? 'London Turf Shoes' :
           id === '4' ? 'Pro Turf Match Shoes' :
           id === '5' ? 'Premium Red Football Shoes' :
           id === '6' ? 'Sky Blue Fan Shoes' :
           id === '7' ? 'Pro Training Running Shoes' :
           id === '8' ? 'National Football Shoes' : 'Premium Shoes';
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
      "name": "KITBAY"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": currentPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "url": `https://kitbayshoes.com/product/${id}`
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
        "item": "https://kitbayshoes.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://kitbayshoes.com/"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `https://kitbayshoes.com/product/${id}`
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
