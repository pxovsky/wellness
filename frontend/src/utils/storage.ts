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
