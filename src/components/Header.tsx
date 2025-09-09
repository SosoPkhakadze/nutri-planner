// src/components/Header.tsx
'use client'; 

import NoSsr from './NoSsr';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Database, FileText, Pill, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/food-db', label: 'Food DB', icon: Database },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/supplements', label: 'Supplements', icon: Pill },
  ];

  const navLinkClasses = (path: string) => 
    `group relative flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
      pathname === path 
        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  const mobileNavLinkClasses = (path: string) => 
    `flex items-center gap-4 px-6 py-4 text-lg font-medium transition-all duration-200 ${
      pathname === path 
        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;
  
  // A NEW, more sophisticated SVG Icon Component
  const BrandIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <defs>
        <linearGradient id="iconGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" stroke="url(#iconGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <BrandIcon />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Nutri-Planner
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Smart Nutrition Tracking</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path} className={navLinkClasses(path)}>
                  <Icon size={18} />
                  <span>{label}</span>
                  {pathname === path && ( <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 -z-10"></div> )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <NoSsr><div className="hidden md:block"><ThemeToggle /></div></NoSsr>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 w-80 max-w-[90vw] h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <BrandIcon />
                  </div>
                  <div><h2 className="font-bold text-white">Menu</h2><p className="text-xs text-slate-400">Navigation</p></div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link key={path} href={path} className={`${mobileNavLinkClasses(path)} rounded-xl`} onClick={() => setIsMobileMenuOpen(false)}>
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <NoSsr><div className="flex items-center justify-between px-2"><span className="text-slate-300 font-medium">Theme</span><ThemeToggle /></div></NoSsr>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}