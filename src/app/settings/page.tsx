"use client";

import React from 'react';
import { ArrowLeft, Bell, Lock, User, Eye, Moon, Globe, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

export default function Settings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordLoading, setPasswordLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordError('');
    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', value: 'Alex Thompson' },
        { icon: Lock, label: 'Change Password', value: 'Updated 2mo ago' },
        { icon: Globe, label: 'Language', value: 'English (US)' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Push Notifications', value: 'On' },
        { icon: Eye, label: 'Privacy Policy', value: '' },
        { icon: Moon, label: 'Dark Mode', value: 'Off' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-surface pt-24 pb-40">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-brand-surface-normal flex items-center px-6 h-16">
        <Link href="/profile" className="p-2 -ml-2 text-brand-on-surface hover:bg-brand-surface-low rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-h font-bold text-lg ml-2">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-12">
          {sections.map(section => (
            <div key={section.title}>
              <h2 className="font-sans font-black text-[10px] uppercase tracking-[0.4em] text-brand-on-surface-variant opacity-40 mb-6 ml-4">{section.title}</h2>
              <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-brand-surface-normal divide-y divide-brand-surface-normal">
                {section.items.map(item => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-6 hover:bg-brand-surface-low transition-all group"
                    onClick={() => {
                      if (item.label === 'Change Password') {
                        setIsPasswordModalOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-surface-low flex items-center justify-center text-brand-on-surface-variant group-hover:scale-110 transition-transform">
                        <item.icon size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-h text-lg font-bold text-brand-on-surface">{item.label}</p>
                        {item.value && <p className="font-sans text-xs text-brand-on-surface-variant opacity-60 mt-0.5">{item.value}</p>}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-brand-on-surface-variant opacity-40 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <section className="bg-red-50 p-8 rounded-[32px] border border-red-100">
            <h3 className="font-h text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
            <p className="font-sans text-sm text-red-600/70 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-red-600 text-white px-8 py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg active:scale-95 transition-all">
              Delete Account
            </button>
          </section>
        </div>

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-6 right-6 text-brand-on-surface-variant hover:text-brand-on-surface"
              >
                ✕
              </button>
              <h2 className="font-h text-2xl font-bold text-brand-on-surface mb-6">Change Password</h2>

              {passwordSuccess ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl font-sans font-medium mb-6 text-center">
                  Password updated successfully!
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl font-sans text-sm font-medium">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block font-sans text-xs font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2 ml-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-surface-normal rounded-xl py-3 px-4 text-brand-on-surface outline-none focus:border-brand-primary transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-surface-normal rounded-xl py-3 px-4 text-brand-on-surface outline-none focus:border-brand-primary transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-brand-surface-low border border-brand-surface-normal rounded-xl py-3 px-4 text-brand-on-surface outline-none focus:border-brand-primary transition-all font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full mt-4 bg-brand-primary text-white py-4 rounded-xl font-sans font-bold text-sm uppercase tracking-widest hover:bg-brand-primary-hover active:scale-95 transition-all disabled:opacity-70"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
