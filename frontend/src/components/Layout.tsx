import React from 'react';
import { Home, Plus, Calendar, History, BarChart3, CheckSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  uncompletedTasksCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, uncompletedTasksCount }) => {
  const location = useLocation();
  const navItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/' },
    { label: 'Dodaj Trening', icon: <Plus className="w-5 h-5" />, path: '/add-training' },
    { label: 'Kalendarz', icon: <Calendar className="w-5 h-5" />, path: '/calendar' },
    { label: 'Historia', icon: <History className="w-5 h-5" />, path: '/history' },
    { label: 'Zadania', icon: <CheckSquare className="w-5 h-5" />, path: '/tasks' },
    { label: 'Wykresy', icon: <BarChart3 className="w-5 h-5" />, path: '/charts' },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <h1 className="text-base font-bold bg-gradient-to-r from-teal-400 to-teal-100 bg-clip-text text-transparent tracking-tight">m~ wellness</h1>
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 px-2 py-3 grid grid-cols-6 gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition text-xs font-medium ${
              location.pathname === item.path
                ? 'bg-teal-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span className="line-clamp-1">{item.label}</span>
            {item.path === '/tasks' && uncompletedTasksCount > 0 && (
              <span className="absolute top-1 right-1/4 transform translate-x-1/2 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center min-w-[18px] h-[18px] rounded-full border border-[#0a0a0a] px-1">
                {uncompletedTasksCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};
