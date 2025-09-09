// src/components/ThemeToggle.tsx
'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider'; // 1. Import the hook
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme(); // 2. Use the hook
  const [isMounted, setIsMounted] = useState(false);

  // This effect prevents the button from rendering on the server
  // and causing a hydration mismatch.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a placeholder on the server
    return <div className="w-10 h-10 rounded-lg bg-slate-700 animate-pulse"></div>;
  }

  // 3. The component is now much simpler
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-slate-700" />
      )}
    </button>
  );
}