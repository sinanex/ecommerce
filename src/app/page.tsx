import { Metadata } from 'next';
import HomeClient from './page.client';

export const metadata: Metadata = {
  title: 'KITBAY STORE | Best Shoes Store in Kerala, India',
  description: 'Discover premium shoes, customized sneakers, training footwear, and sports accessories at KITBAY STORE. Your ultimate shoes shop in Kerala, India, with complete delivery across India.',
  keywords: ['shoes store in kerala', 'shoes shop india', 'buy shoes online', 'sports wear india', 'kerala shoes store', 'customized shoes india', 'sneakers shop kerala', 'kitbay store', 'sports shoes india'],
  openGraph: {
    title: 'KITBAY STORE | Best Shoes Store in Kerala, India',
    description: 'Discover premium shoes, customized sneakers, training footwear, and sports accessories at KITBAY STORE. Your ultimate shoes shop in Kerala, India, with complete delivery across India.',
    url: 'https://kitbayshoes.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KITBAY STORE | Best Shoes Store in Kerala, India',
    description: 'Discover premium shoes, customized sneakers, training footwear, and sports accessories at KITBAY STORE. Your ultimate shoes shop in Kerala, India, with complete delivery across India.',
  },
};

export default function Home() {
  return <HomeClient />;
}
