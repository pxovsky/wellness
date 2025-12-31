#!/bin/bash
set -e
echo "🚀 FRONTEND SETUP - Starting"
cd frontend || { echo "❌ Error: frontend folder not found inside current directory"; exit 1; }

mkdir -p src/services src/utils src/components

# api.ts
cat > src/services/api.ts << 'EOF'
import { Training, DailyLog } from '../types';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }

  async healthCheck(): Promise<boolean> {
    try { const res = await fetch(`${this.baseUrl}/health`); return res.ok; } catch { return false; }
  }
  async getTrainings(limit?: number): Promise<Training[]> {
    const url = new URL(`${this.baseUrl}/api/trainings`);
    if (limit) url.searchParams.append('limit', limit.toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch trainings: ${res.status}`);
    return res.json();
  }
  async addTraining(training: Omit<Training, 'id'>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/trainings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(training)
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || err.error); }
  }
  async deleteTraining(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/trainings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
  }
  async getDashboard() {
    const res = await fetch(`${this.baseUrl}/api/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  }
  async getDailyLogs(limit?: number): Promise<DailyLog[]> {
    const url = new URL(`${this.baseUrl}/api/daily/logs`);
    if (limit) url.searchParams.append('limit', limit.toString());
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  }
  async logReading(date: string, reading: number): Promise<DailyLog> {
    const res = await fetch(`${this.baseUrl}/api/daily/reading`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({date, reading})
    });
    if (!res.ok) throw new Error('Failed to log reading');
    return res.json();
  }
  async logKefir(date: string, kefir: number): Promise<DailyLog> {
    const res = await fetch(`${this.baseUrl}/api/daily/kefir`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({date, kefir})
    });
    if (!res.ok) throw new Error('Failed to log kefir');
    return res.json();
  }
}
export const apiClient = new ApiClient(API_URL);
export const getTrainings = (limit?: number) => apiClient.getTrainings(limit);
export const saveTraining = (t: Omit<Training, 'id'>) => apiClient.addTraining(t);
export const deleteTraining = (id: number) => apiClient.deleteTraining(id);
export const getDailyLogs = (limit?: number) => apiClient.getDailyLogs(limit);
export const logReading = (d: string, r: number) => apiClient.logReading(d, r);
export const logKefir = (d: string, k: number) => apiClient.logKefir(d, k);
export const getDashboardData = () => apiClient.getDashboard();
EOF

# storage.ts
[ -f src/utils/storage.ts ] && cp src/utils/storage.ts src/utils/storage.ts.backup
cat > src/utils/storage.ts << 'EOF'
import { Training, DailyLog } from '../types';
import { apiClient } from '../services/api';

export function clearOldLocalStorage(): void {
  try { localStorage.removeItem('myniu_trainings'); localStorage.removeItem('myniu_daily_logs'); } 
  catch (e) { console.error(e); }
}

export async function getTrainings(limit: number = 200): Promise<Training[]> {
  try { return await apiClient.getTrainings(limit); } catch (e) { console.error(e); return []; }
}
export async function saveTraining(t: Omit<Training, 'id'>): Promise<void> { await apiClient.addTraining(t); }
export async function deleteTraining(id: number): Promise<void> { await apiClient.deleteTraining(id); }
export async function getDailyLogs(limit: number = 200): Promise<DailyLog[]> {
  try { return await apiClient.getDailyLogs(limit); } catch (e) { console.error(e); return []; }
}
export async function getTodayLog(date?: string): Promise<DailyLog | null> {
  try {
    const logs = await getDailyLogs();
    const target = date || new Date().toISOString().split('T')[0];
    return logs.find(l => l.date === target) || null;
  } catch { return null; }
}
export async function logReading(d: string, r: number) { return await apiClient.logReading(d, r); }
export async function logKefir(d: string, k: number) { return await apiClient.logKefir(d, k); }
EOF

# App.tsx
[ -f src/App.tsx ] && cp src/App.tsx src/App.tsx.backup
cat > src/App.tsx << 'EOF'
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
  
  // Navigation items omitted for brevity in setup script but logic is here
  return (
    <div className="min-h-screen bg-black text-white flex flex-col xl:flex-row">
       <Layout currentView={currentView} onViewChange={setCurrentView}>{renderView()}</Layout>
    </div>
  );
};
export default App;
EOF

# AddTraining.tsx
cat > src/components/AddTraining.tsx << 'EOF'
import React, { useState } from 'react';
import { Training } from '../types';
import { saveTraining } from '../utils/storage';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AddTraining: React.FC<{onSaved:()=>void}> = ({ onSaved }) => {
  const [t, setT] = useState<Omit<Training, 'id'>>({
    dt: new Date().toISOString().slice(0, 16), duration_min: 45, calories: 450,
    avg_hr: 140, max_hr: 165, training_effect: 3.2, notes: ''
  });
  const [err, setErr] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true); setErr(null);
      await saveTraining(t);
      onSaved();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {err && <div className="text-red-400 border border-red-500 p-3 rounded">{err}</div>}
      <input type="datetime-local" value={t.dt} onChange={e=>setT({...t, dt:e.target.value})} className="w-full bg-gray-800 p-2 rounded"/>
      <div className="grid grid-cols-2 gap-2">
         <input type="number" placeholder="Min" value={t.duration_min} onChange={e=>setT({...t, duration_min:+e.target.value})} className="bg-gray-800 p-2 rounded"/>
         <input type="number" placeholder="Kcal" value={t.calories} onChange={e=>setT({...t, calories:+e.target.value})} className="bg-gray-800 p-2 rounded"/>
         <input type="number" placeholder="Avg HR" value={t.avg_hr} onChange={e=>setT({...t, avg_hr:+e.target.value})} className="bg-gray-800 p-2 rounded"/>
         <input type="number" placeholder="Max HR" value={t.max_hr} onChange={e=>setT({...t, max_hr:+e.target.value})} className="bg-gray-800 p-2 rounded"/>
      </div>
      <input type="number" step="0.1" placeholder="Effect" value={t.training_effect} onChange={e=>setT({...t, training_effect:+e.target.value})} className="w-full bg-gray-800 p-2 rounded"/>
      <textarea placeholder="Notes" value={t.notes} onChange={e=>setT({...t, notes:e.target.value})} className="w-full bg-gray-800 p-2 rounded h-20"/>
      <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 p-2 rounded flex justify-center">
        {saving ? <Loader2 className="animate-spin"/> : 'Zapisz'}
      </button>
    </div>
  );
};
EOF

echo "VITE_API_URL=http://localhost:5000" > .env.local
if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then echo ".env.local" >> .gitignore; fi
echo "✅ Frontend setup complete!"