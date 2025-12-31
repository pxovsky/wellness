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
