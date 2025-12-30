import React from 'react';
import { View } from '../types';
import { Home, Plus, Calendar, History, BarChart3, User } from 'lucide-react';


interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}


export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const getHeaderTitle = () => {
    const titles: Record<View, string> = {
      Dashboard: 'Dashboard',
      AddTraining: 'Dodaj Trening',
      History: 'Historia',
      Charts: 'Wykresy',
      Calendar: 'Kalendarz',
    };
    return titles[currentView] || currentView;
  };


  return (
    <div className="flex flex-col h-screen bg-black text-white max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex justify-between items-center bg-black/80 sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center text-blue-500 font-semibold cursor-pointer text-sm">
          <span className="text-lg mr-1">‹</span> Myniu Lite
        </div>
        <h1 className="text-base font-bold text-center flex-1">{getHeaderTitle()}</h1>
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <User className="text-blue-500 w-5 h-5" />
        </div>
      </header>


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 hide-scrollbar">
        {children}
      </main>


      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 py-2 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <NavItem 
            icon={<Home className="w-6 h-6" />} 
            label="Dashboard" 
            isActive={currentView === 'Dashboard'} 
            onClick={() => onViewChange('Dashboard')} 
          />
          <NavItem 
            icon={<Plus className="w-6 h-6" />} 
            label="Dodaj" 
            isActive={currentView === 'AddTraining'} 
            onClick={() => onViewChange('AddTraining')} 
          />
          <NavItem 
            icon={<Calendar className="w-6 h-6" />} 
            label="Kalendarz" 
            isActive={currentView === 'Calendar'} 
            onClick={() => onViewChange('Calendar')} 
          />
          <NavItem 
            icon={<History className="w-6 h-6" />} 
            label="Historia" 
            isActive={currentView === 'History'} 
            onClick={() => onViewChange('History')} 
          />
          <NavItem 
            icon={<BarChart3 className="w-6 h-6" />} 
            label="Wykresy" 
            isActive={currentView === 'Charts'} 
            onClick={() => onViewChange('Charts')} 
          />
        </div>
      </nav>
    </div>
  );
};


interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}


const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors text-center flex-1 ${
        isActive 
          ? 'text-blue-500' 
          : 'text-gray-500 hover:text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium whitespace-nowrap">{label}</span>
    </button>
  );
};
