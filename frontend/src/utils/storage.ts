import { Training, DailyLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getTrainings = async (limit: number = 20): Promise<Training[]> => {
  const response = await fetch(`${API_URL}/trainings?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch trainings');
  return response.json();
};

export const saveTraining = async (training: Omit<Training, 'id'>): Promise<any> => {
  const response = await fetch(`${API_URL}/trainings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(training),
  });
  if (!response.ok) throw new Error('Failed to save training');
  return response.json();
};

export const getDailyLogs = async (limit: number = 30): Promise<DailyLog[]> => {
  const response = await fetch(`${API_URL}/daily-logs?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch daily logs');
  return response.json();
};

export const getTodayLog = async (): Promise<DailyLog | null> => {
  const today = new Date().toISOString().split('T')[0];
  const logs = await getDailyLogs(1); 
  return logs.find(l => l.date === today) || null;
};

export const getDailyLogForDate = async (date: string): Promise<DailyLog | null> => {
    // Backend powinien mieć endpoint, ale tymczasowo pobieramy więcej i filtrujemy
    const logs = await getDailyLogs(60); 
    return logs.find(l => l.date === date) || null;
}

/**
 * Zapisuje log dzienny.
 * Obsługuje granularne zapisywanie pojedynczych metryk.
 * 
 * @param metricOrLog - nazwa endpointu (np. 'reading', 'water')
 * @param data - dane do wysłania (np. { minutes: 30 })
 * @param date - data logu (YYYY-MM-DD)
 */
export const saveDailyLog = async (
  metricOrLog: string | DailyLog, 
  data?: any, 
  date?: string
): Promise<any> => {
  
  // Jeśli ktoś próbuje wywołać ze starym sposobem (cały obiekt), rzucamy błąd lub ostrzeżenie
  if (typeof metricOrLog !== 'string') {
     console.error("Użycie saveDailyLog z całym obiektem nie jest już wspierane. Użyj granularnych endpointów.");
     throw new Error("Legacy saveDailyLog usage deprecated");
  }

  // Nowe użycie: saveDailyLog('reading', { minutes: 30 }, '2024-01-01')
  const endpoint = metricOrLog;
  const payload = { ...data, date };

  const response = await fetch(`${API_URL}/daily/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Failed to save daily log for ${endpoint}`);
  return response.json();
};

export const deleteTraining = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/trainings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete training');
};
