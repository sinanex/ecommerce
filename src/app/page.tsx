import { Metadata } from 'next';
import HomeClient from './page.client';

export const metadata: Metadata = {
  title: '6YARD STORE | Best Football Jersey Store in Kerala, India',
  description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop in Kerala, India, with complete delivery across India.',
  keywords: ['jersey store in kerala', 'football jersey shop india', 'buy football jersey online', 'sports wear india', 'kerala football jersey store', 'customized jersey india', 'soccer shop kerala', '6yard store', 'football kits india'],
  openGraph: {
    title: '6YARD STORE | Best Football Jersey Store in Kerala, India',
    description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop in Kerala, India, with complete delivery across India.',
    url: 'https://6yardjersey.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '6YARD STORE | Best Football Jersey Store in Kerala, India',
    description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop in Kerala, India, with complete delivery across India.',
  },
};

export default function Home() {
  return <HomeClient />;
}
