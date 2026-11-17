import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Upload, Layers, CheckCircle2, Server, Terminal } from 'lucide-react';
import axios from 'axios';

function App() {
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', message: 'Checking backend status...' });

  useEffect(() => {
    axios
      .get('http://localhost:5000/health')
      .then((res) => {
        setBackendHealth({ status: 'online', message: `API Online (Status: ${res.data.status})` });
      })
      .catch(() => {
        setBackendHealth({ status: 'offline', message: 'Backend offline or not running on port 5000' });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Axlero Marketplace</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Vendor Hub
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  backendHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-slate-400 hidden sm:inline">{backendHealth.message}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 mb-6">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Week 2 Milestone: React Scaffold & Axios API Client</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Multi-Vendor Retail & Ecommerce{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Dashboard
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Frontend foundation initialized with React 18, Vite, Tailwind CSS, and a centralized Axios client
            with automatic JWT Bearer token authentication and multi-vendor isolation.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-slate-600 transition">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Role-Based Access Control</h3>
            <p className="text-sm text-slate-400">
              Centralized Axios interceptor automatically passes JWT Bearer tokens and handles 401 session expiration.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-slate-600 transition">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg w-fit mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multipart Image Uploads</h3>
            <p className="text-sm text-slate-400">
              Configured client-side services supporting <code className="text-xs bg-slate-700 px-1 py-0.5 rounded">FormData</code>{' '}
              submission for product catalog image uploads.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 hover:border-slate-600 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Vendor Isolation</h3>
            <p className="text-sm text-slate-400">
              Pre-wired Product and Auth services ensuring vendors can only view and manage their own inventory.
            </p>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="mt-12 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Frontend Architecture Status</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Vite 6 + React 18 Scaffold initialized</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Tailwind CSS utility styling configured</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Centralized Axios client with JWT interceptors</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Auth & Multi-vendor Product API services ready</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
