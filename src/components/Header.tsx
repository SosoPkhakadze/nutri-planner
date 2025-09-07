// Make Header a client component to use the usePathname hook
'use client'; 

// src/components/Header.tsx
import NoSsr from './NoSsr';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link'; // Import Link
import { usePathname } from 'next/navigation'; // Import to check current path

export default function Header() {
  const pathname = usePathname();

  const navLinkClasses = (path: string) => 
    `text-gray-300 hover:text-cyan-400 transition-colors font-medium pb-1 ${
      pathname === path ? 'border-b-2 border-cyan-500 text-white' : 'border-b-2 border-transparent'
    }`;

  return (
    <header className="bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 0118 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nutri-Planner</h1>
              <p className="text-xs text-gray-400">Smart Nutrition</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className={navLinkClasses('/')}>
                Dashboard
              </Link>
              <Link href="/planner" className={navLinkClasses('/planner')}>
                Planner
              </Link>
              <Link href="/food-db" className={navLinkClasses('/food-db')}>
                Food DB
              </Link>
            </div>
            
            <NoSsr>
              <ThemeToggle />
            </NoSsr>
          </nav>
        </div>
      </div>
    </header>
  );
}