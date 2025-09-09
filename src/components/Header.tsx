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
  
  // New SVG Icon Component
  const BrandIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2C14.5241 4.17273 16.3216 6.94189 17.1519 10.0381C17.9822 13.1342 17.801 16.4259 16.6441 19.3934" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
      <path d="M22 12C19.8273 14.5241 17.0581 16.3216 13.9619 17.1519C10.8658 17.9822 7.57413 17.801 4.60662 16.6441" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
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
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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