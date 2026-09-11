import './globals.css';
import { Header } from '@/components/Header';

export const metadata = {
  title: 'LLD Practice Platform',
  description: 'Practice Low-Level Object-Oriented Design problems and receive structured, explainable feedback on your design decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-xs">
            LLD Practice Platform &copy; 2026. Designed for low-level domain design mastery.
          </div>
        </footer>
      </body>
    </html>
  );
}
