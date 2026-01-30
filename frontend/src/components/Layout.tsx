import React from 'react';
import { View } from '../types';
import { Home, Plus, Calendar, History, BarChart3, CheckSquare } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  onViewChange: (view: View) => void;
  children: React.ReactNode;
  uncompletedTasksCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children, uncompletedTasksCount }) => {
  const navItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, view: 'Dashboard' as View },
    { label: 'Dodaj Trening', icon: <Plus className="w-5 h-5" />, view: 'AddTraining' as View },
    { label: 'Kalendarz', icon: <Calendar className="w-5 h-5" />, view: 'Calendar' as View },
    { label: 'Historia', icon: <History className="w-5 h-5" />, view: 'History' as View },
    { label: 'Zadania', icon: <CheckSquare className="w-5 h-5" />, view: 'Tasks' as View },
    { label: 'Wykresy', icon: <BarChart3 className="w-5 h-5" />, view: 'Charts' as View },
  ];

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 px-2 py-3 grid grid-cols-6 gap-1">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition text-xs font-medium ${
              currentView === item.view
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span className="line-clamp-1">{item.label}</span>
            {item.view === 'Tasks' && uncompletedTasksCount > 0 && (
              <span className="absolute top-1 right-1/4 transform translate-x-1/2 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border border-[#0a0a0a]">
                {uncompletedTasksCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
