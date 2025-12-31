import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AddTraining } from './components/AddTraining';
import { History } from './components/History';
import { Charts } from './components/Charts';
import { Calendar } from './components/Calendar';
import { View, Training, DailyLog } from './types';
import { getTrainings, getDailyLogs } from './utils/storage';
import { Home, Plus, Calendar as CalendarIcon, History as HistoryIcon, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from './services/api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('Dashboard');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true); setApiError(null);
      if (!(await apiClient.healthCheck())) throw new Error('Backend offline');
      const [t, l] = await Promise.all([getTrainings(), getDailyLogs()]);
      setTrainings(t); setDailyLogs(l);
    } catch (e: any) { setApiError(e.message || 'Failed to load'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', r); return () => window.removeEventListener('resize', r);
  }, []);

  const renderView = () => {
    if (isLoading && currentView === 'Dashboard') 
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-10 h-10 text-blue-500"/></div>;
    if (apiError && currentView === 'Dashboard')
      return <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-200"><AlertCircle className="inline mr-2"/>{apiError}</div>;
      
    switch (currentView) {
      case 'Dashboard': return <Dashboard trainings={trainings} dailyLogs={dailyLogs} />;
      case 'AddTraining': return <AddTraining onSaved={() => { loadData(); setCurrentView('Dashboard'); }} />;
      case 'History': return <History trainings={trainings} />;
      case 'Charts': return <Charts trainings={trainings} dailyLogs={dailyLogs} />;
      case 'Calendar': return <Calendar dailyLogs={dailyLogs} onLogsUpdated={loadData} />;
      default: return <Dashboard trainings={trainings} dailyLogs={dailyLogs} />;
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
                  currentView === item.view ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          <Layout currentView={currentView} onViewChange={setCurrentView}>{renderView()}</Layout>
        ) : (
          <main className="flex-1 overflow-y-auto px-8 py-6 max-w-7xl">{renderView()}</main>
        )}
      </div>
    </div>
  );
};
export default App;
