import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AddTraining } from './components/AddTraining';
import { History } from './components/History';
import { Charts } from './components/Charts';
import { Calendar } from './components/Calendar';
import { View, Training, DailyLog } from './types';
import { getTrainings, getDailyLogs } from './utils/storage';
import { Home, Plus, Calendar as CalendarIcon, History as HistoryIcon, BarChart3 } from 'lucide-react';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);


  const refreshData = () => {
    setTrainings(getTrainings());
    setDailyLogs(getDailyLogs());
  };


  useEffect(() => {
    refreshData();
  }, []);


  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };


    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard trainings={trainings} dailyLogs={dailyLogs} />;
      case 'AddTraining':
        return <AddTraining onSaved={() => { refreshData(); setCurrentView('Dashboard'); }} />;
      case 'History':
        return <History trainings={trainings} />;
      case 'Charts':
        return <Charts trainings={trainings} dailyLogs={dailyLogs} />;
      case 'Calendar':
        return <Calendar dailyLogs={dailyLogs} onLogsUpdated={refreshData} />;
      default:
        return <Dashboard trainings={trainings} dailyLogs={dailyLogs} />;
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, view: 'Dashboard' as View },
    { label: 'Dodaj Trening', icon: <Plus className="w-5 h-5" />, view: 'AddTraining' as View },
    { label: 'Kalendarz', icon: <CalendarIcon className="w-5 h-5" />, view: 'Calendar' as View },
    { label: 'Historia', icon: <HistoryIcon className="w-5 h-5" />, view: 'History' as View },
    { label: 'Wykresy', icon: <BarChart3 className="w-5 h-5" />, view: 'Charts' as View },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col xl:flex-row">
      {/* PC Sidebar (desktop only - hidden on mobile) */}
      {!isMobile && (
        <aside className="hidden xl:flex w-56 bg-[#0a0a0a] border-r border-white/10 px-6 py-8 space-y-8 overflow-y-auto sticky top-0 h-screen flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">‹</span>
            <h1 className="text-lg font-bold text-blue-500">Myniu Lite</h1>
          </div>


          <nav className="space-y-2 flex-1">
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`w-full text-left px-3 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 ${
                  currentView === item.view
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>


          <div className="pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500">© 2025 Myniu Lite</p>
          </div>
        </aside>
      )}


      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          // Mobile Layout - bottom navbar
          <Layout currentView={currentView} onViewChange={setCurrentView}>
            {renderView()}
          </Layout>
        ) : (
          // Desktop Layout - header + content
          <>
            <header className="bg-[#0a0a0a] border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-40">
              <h2 className="text-2xl font-bold">
                {currentView === 'Dashboard' ? 'Dashboard'
                  : currentView === 'AddTraining' ? 'Dodaj Trening'
                  : currentView === 'History' ? 'Historia'
                  : currentView === 'Charts' ? 'Wykresy'
                  : currentView === 'Calendar' ? 'Kalendarz'
                  : 'App'}
              </h2>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-500">👤</span>
              </div>
            </header>


            <main className="flex-1 overflow-y-auto px-8 py-6">
              <div className="max-w-7xl">
                {renderView()}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};


export default App;
