import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AddTraining } from './components/AddTraining';
import { History } from './components/History';
import { Charts } from './components/Charts';
import { Calendar } from './components/Calendar';
import { Tasks } from './components/Tasks';
import { Training, DailyLog, Task } from './types';
import { getTrainings, getDailyLogs, getTasks } from './utils/storage';
import { Home, Plus, Calendar as CalendarIcon, History as HistoryIcon, BarChart3, AlertCircle, Loader2, CheckSquare } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';


const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const [trainingsData, logsData, tasksData] = await Promise.all([
        getTrainings(200),
        getDailyLogs(30),
        getTasks()
      ]);
      setTrainings(trainingsData);
      setDailyLogs(logsData);
      setTasks(tasksData);
    } catch (e: any) {
      setApiError(e.message || 'Failed to load data');
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const uncompletedTasksCount = tasks.filter(t => t.is_completed === 0).length;

  if (isLoading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="animate-spin w-10 h-10 text-teal-500" />
        </div>
      );
  }

  if (apiError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Błąd połączenia</p>
            <p className="text-sm">{apiError}</p>
          </div>
        </div>
      );
  }

  const appRoutes = (
    <Routes>
      <Route path="/" element={<Dashboard trainings={trainings} dailyLogs={dailyLogs} onRefresh={loadData} />} />
      <Route path="/add-training" element={
        <AddTraining
          onSaved={() => {
            loadData();
            navigate('/');
          }}
        />
      } />
      <Route path="/history" element={<History trainings={trainings} />} />
      <Route path="/charts" element={<Charts trainings={trainings} dailyLogs={dailyLogs} />} />
      <Route path="/calendar" element={<Calendar dailyLogs={dailyLogs} tasks={tasks} onLogsUpdated={loadData} />} />
      <Route path="/tasks" element={<Tasks onTasksChange={loadData} />} />
    </Routes>
  );

  const navItems = [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/' },
    { label: 'Dodaj Trening', icon: <Plus className="w-5 h-5" />, path: '/add-training' },
    { label: 'Kalendarz', icon: <CalendarIcon className="w-5 h-5" />, path: '/calendar' },
    { label: 'Historia', icon: <HistoryIcon className="w-5 h-5" />, path: '/history' },
    { label: 'Zadania', icon: <CheckSquare className="w-5 h-5" />, path: '/tasks' },
    { label: 'Wykresy', icon: <BarChart3 className="w-5 h-5" />, path: '/charts' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col xl:flex-row">
      {!isMobile && (
        <aside className="hidden xl:flex w-56 bg-[#0a0a0a] border-r border-white/10 px-6 py-8 space-y-8 overflow-y-auto sticky top-0 h-screen flex-col">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="w-10 h-10" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-teal-100 bg-clip-text text-transparent tracking-tight">m~ wellness</h1>
          </Link>
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full text-left px-3 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 block ${
                  location.pathname === item.path
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon} {item.label}
                </div>
                {item.path === '/tasks' && uncompletedTasksCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {uncompletedTasksCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        {isMobile ? (
          <Layout uncompletedTasksCount={uncompletedTasksCount}>
            {appRoutes}
          </Layout>
        ) : (
          <main className="flex-1 overflow-y-auto px-8 py-6 max-w-7xl">
            {appRoutes}
          </main>
        )}
      </div>
    </div>
  );
};

export default App;
