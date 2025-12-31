import os
import subprocess
import sys
from pathlib import Path

# --- KONFIGURACJA PLIKÓW ---

# Backend Files
models_py = """from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class TrainingCreateRequest(BaseModel):
    dt: str = Field(..., description="DateTime in format YYYY-MM-DD HH:MM")
    duration_min: int = Field(gt=0, le=300)
    calories: int = Field(ge=0, le=10000)
    avg_hr: int = Field(gt=0, le=220)
    max_hr: int = Field(gt=0, le=220)
    training_effect: float = Field(ge=0.0, le=5.0)
    notes: str = Field(default="", max_length=1000)
    
    @validator('max_hr')
    def validate_max_hr(cls, v, values):
        if 'avg_hr' in values and v < values['avg_hr']: raise ValueError('max_hr must be >= avg_hr')
        return v
    
    @validator('dt')
    def validate_datetime(cls, v):
        try: datetime.strptime(v, '%Y-%m-%d %H:%M')
        except ValueError: raise ValueError('DateTime format error')
        return v

class TrainingResponse(BaseModel):
    id: int
    dt: str
    duration_min: int
    calories: int
    avg_hr: int
    max_hr: int
    training_effect: float
    notes: str

class DailyLogCreateRequest(BaseModel):
    date: str
    reading: Optional[int] = Field(None, ge=0, le=999)
    kefir: Optional[int] = Field(None, ge=0, le=500)

class DailyLogResponse(BaseModel):
    date: str
    reading: Optional[int]
    kefir: Optional[int]
    streak_reading: int
    streak_kefir: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
"""

app_py = """import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import ValidationError
from dotenv import load_dotenv
from models import TrainingCreateRequest, DailyLogCreateRequest, ErrorResponse
from storage import Storage
from datetime import datetime

load_dotenv()
app = Flask(__name__)
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=[origin.strip() for origin in cors_origins])
storage = Storage()

@app.errorhandler(404)
def not_found(e): return jsonify(ErrorResponse(error="Endpoint not found").dict()), 404
@app.errorhandler(500)
def internal_error(e): return jsonify(ErrorResponse(error="Internal error", detail=str(e)).dict()), 500

def handle_validation_error(e: ValidationError):
    errors = [f"{'.'.join(str(x) for x in err['loc'])}: {err['msg']}" for err in e.errors()]
    return jsonify({"error": "Validation error", "detail": "; ".join(errors)}), 400

@app.route('/health', methods=['GET'])
def health(): return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()}), 200

@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    limit = request.args.get('limit', 200, type=int)
    return jsonify(storage.get_trainings(limit)), 200

@app.route('/api/trainings', methods=['POST'])
def add_training():
    try:
        data = TrainingCreateRequest(**request.json)
        storage.add_training(**data.dict())
        return jsonify({"status": "ok"}), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/trainings/<int:id>', methods=['DELETE'])
def delete_training(id):
    try:
        storage.delete_training(id)
        return jsonify({"status": "ok"}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard(): return jsonify(storage.get_dashboard()), 200

@app.route('/api/daily/logs', methods=['GET'])
def get_daily_logs():
    limit = request.args.get('limit', 200, type=int)
    return jsonify(storage.get_daily_logs(limit)), 200

@app.route('/api/daily/reading', methods=['POST'])
def log_reading():
    try:
        data = DailyLogCreateRequest(**request.json)
        return jsonify(storage.log_reading(data.date, data.reading)), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/daily/kefir', methods=['POST'])
def log_kefir():
    try:
        data = DailyLogCreateRequest(**request.json)
        return jsonify(storage.log_kefir(data.date, data.kefir)), 201
    except ValidationError as e: return handle_validation_error(e)
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host=os.getenv('FLASK_HOST', '0.0.0.0'), port=int(os.getenv('FLASK_PORT', 5000)), debug=os.getenv('FLASK_DEBUG', 'False')=='True')
"""

requirements_txt = """flask==2.3.3
flask-cors==4.0.0
pydantic==2.4.2
python-dotenv==1.0.0
pytesseract==0.3.10
Pillow==10.0.1
"""

env_backend = """DATABASE_URL=sqlite:///myniu.db
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=False
CORS_ORIGINS=http://localhost:3000
"""

# Frontend Files
api_ts = """import { Training, DailyLog } from '../types';
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
"""

storage_ts = """import { Training, DailyLog } from '../types';
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
"""

app_tsx = """import React, { useState, useEffect } from 'react';
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
"""

add_training_tsx = """import React, { useState } from 'react';
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
      <input type="datetime-local" value={t.dt} onChange={e=>setT({...t, dt:e.target.value})} className="w-full bg-gray-800 p-2 rounded text-white"/>
      <div className="grid grid-cols-2 gap-2">
         <input type="number" placeholder="Min" value={t.duration_min} onChange={e=>setT({...t, duration_min:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Kcal" value={t.calories} onChange={e=>setT({...t, calories:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Avg HR" value={t.avg_hr} onChange={e=>setT({...t, avg_hr:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Max HR" value={t.max_hr} onChange={e=>setT({...t, max_hr:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
      </div>
      <input type="number" step="0.1" placeholder="Effect" value={t.training_effect} onChange={e=>setT({...t, training_effect:+e.target.value})} className="w-full bg-gray-800 p-2 rounded text-white"/>
      <textarea placeholder="Notes" value={t.notes} onChange={e=>setT({...t, notes:e.target.value})} className="w-full bg-gray-800 p-2 rounded h-20 text-white"/>
      <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 p-2 rounded flex justify-center text-white">
        {saving ? <Loader2 className="animate-spin"/> : 'Zapisz'}
      </button>
    </div>
  );
};
"""

env_frontend = "VITE_API_URL=http://localhost:5000"

# --- FUNKCJE ---

def write_file(path, content):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✅ Utworzono: {path}")

def run_command(command, cwd=None):
    try:
        print(f"🔄 Wykonywanie: {' '.join(command)}")
        subprocess.run(command, check=True, cwd=cwd, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd podczas: {command} -> {e}")
        # Nie przerywamy, bo pip może rzucić warningami

# --- MAIN ---

def main():
    print("🚀 AUTOMATYCZNY INSTALLER - KROK 1 (Python Version)")
    
    # 1. SETUP BACKEND
    print("\n--- 🛠️ SETUP BACKEND ---")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("❌ Error: folder 'backend' nie istnieje!")
        return

    write_file("backend/models.py", models_py)
    write_file("backend/app.py", app_py)
    write_file("backend/requirements.txt", requirements_txt)
    write_file("backend/.env", env_backend)
    
    # Pip install
    print("📦 Instalowanie bibliotek Python...")
    run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd="backend")

    # 2. SETUP FRONTEND
    print("\n--- 🎨 SETUP FRONTEND ---")
    frontend_dir = Path("frontend")

    if not frontend_dir.exists():
        print("❌ Error: folder 'frontend' nie istnieje!")
        return

    write_file("frontend/src/services/api.ts", api_ts)
    write_file("frontend/src/utils/storage.ts", storage_ts)
    write_file("frontend/src/App.tsx", app_tsx)
    write_file("frontend/src/components/AddTraining.tsx", add_training_tsx)
    write_file("frontend/.env.local", env_frontend)

    # 3. GIT COMMIT
    print("\n--- 📝 GIT COMMIT ---")
    if Path(".git").exists():
        run_command(["git", "add", "."])
        try:
            run_command(["git", "commit", "-m", "AI-v1.0: Frontend-Backend Sync (KROK 1)"])
        except:
            print("ℹ️ Prawdopodobnie nic do commitowania")
    else:
        print("ℹ️ Git nie zainicjalizowany (pomiń ten krok lub wpisz 'git init')")

    print("\n✅✅✅ WSZYSTKO GOTOWE! ✅✅✅")
    print("\n👉 Aby uruchomić BACKEND (Terminal 1):")
    print("   cd backend")
    print("   python app.py")
    print("\n👉 Aby uruchomić FRONTEND (Terminal 2):")
    print("   cd frontend")
    print("   npm run dev")

if __name__ == "__main__":
    main()
