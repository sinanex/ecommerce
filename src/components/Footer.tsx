"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import { Instagram } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-brand-surface-low border-t border-brand-surface-normal w-full pt-6 pb-5 px-6 md:px-12">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-4 md:flex-row md:justify-between">

        {/* Logo */}
        <div className="text-xl font-black text-brand-on-surface font-h uppercase tracking-widest">
          6YARD
        </div>

        {/* Nav links */}
        <div className="flex gap-6 items-center">
          <a className="text-brand-on-surface-variant hover:text-brand-primary transition-all font-sans font-bold text-xs uppercase tracking-widest" href="#">Contact</a>
          <a className="text-brand-on-surface-variant hover:text-brand-primary transition-all font-sans font-bold text-xs uppercase tracking-widest" href="#">Privacy Policy</a>
        </div>

        {/* Instagram icon */}
        <a
          href="https://www.instagram.com/6yard.2?igsh=MTF0MWd2N2Vjd2d1eQ=="
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-on-surface-variant hover:text-[#E4405F] hover:shadow-md transition-all"
        >
          <Instagram size={16} />
        </a>
      </div>

      {/* Copyright */}
      <div className="max-w-[1280px] mx-auto mt-4 pt-4 border-t border-brand-surface-normal text-center">
        <p className="font-sans font-medium text-[10px] text-brand-on-surface-variant uppercase tracking-widest">
          &copy; {new Date().getFullYear()} 6YARD
        </p>
      </div>
    </footer>
  );
}
