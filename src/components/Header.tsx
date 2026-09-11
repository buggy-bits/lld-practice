'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, History, BookOpen } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  const isProblems = pathname === '/' || pathname.startsWith('/problems');
  const isHistory = pathname.startsWith('/history');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-slate-900 text-white p-2 rounded-lg font-bold text-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight">LLD Practice</span>
                <span className="ml-2 text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                  Platform
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isProblems
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Problems</span>
            </Link>

            <Link
              href="/history"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isHistory
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Attempt History</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
