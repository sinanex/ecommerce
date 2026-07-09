import { Metadata } from 'next';
import HomeClient from './page.client';

export const metadata: Metadata = {
  title: '6YARD STORE | Best Football Jersey Store in Manjeri, Malappuram, Calicut',
  description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop serving Manjeri, Malappuram, Kottakkal, Tirur, and Calicut.',
  keywords: ['jersey store in manjeri', 'football jersey shop malappuram', 'jersey shop in kottakkal', 'sports wear tirur', 'calicut football jersey store', 'customized jersey malappuram', 'soccer shop kerala', '6yard store', 'football kits kerala'],
  openGraph: {
    title: '6YARD STORE | Best Football Jersey Store in Manjeri, Malappuram, Calicut',
    description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop serving Manjeri, Malappuram, Kottakkal, Tirur, and Calicut.',
    url: 'https://6yardjersey.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '6YARD STORE | Best Football Jersey Store in Manjeri, Malappuram, Calicut',
    description: 'Discover premium football kits, customized jerseys, training tees, and sports accessories at 6YARD STORE. Your ultimate soccer jersey shop serving Manjeri, Malappuram, Kottakkal, Tirur, and Calicut.',
  },
};

export default function Home() {
  return <HomeClient />;
}
