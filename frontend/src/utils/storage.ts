import { Training, DailyLog } from '../types';
import { trainingsAPI, dailyAPI, dashboardAPI } from '../services/api';

export async function getTrainings(limit: number = 200): Promise<Training[]> {
  try {
    return await trainingsAPI.getAll(limit);
  } catch (e) {
    console.error('Error fetching trainings:', e);
    return [];
  }
}

export async function saveTraining(t: Omit<Training, 'id'>): Promise<void> {
  await trainingsAPI.add(t);
}

export async function deleteTraining(id: number): Promise<void> {
  await trainingsAPI.delete(id);
}

export async function getDailyLogs(days: number = 7): Promise<DailyLog[]> {
  try {
    const end_date = new Date().toISOString().split('T')[0];
    const start_date = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return await dailyAPI.getLogs(start_date, end_date);
  } catch (e) {
    console.error('Error fetching daily logs:', e);
    return [];
  }
}

export async function getTodayLog(): Promise<DailyLog | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    return await dailyAPI.getLog(today);
  } catch (e) {
    console.error('Error fetching today log:', e);
    return null;
  }
}

export async function getDailyLogForDate(date: string): Promise<DailyLog | null> {
  try {
    return await dailyAPI.getLog(date);
  } catch (e) {
    console.error(`Error fetching log for ${date}:`, e);
    return null;
  }
}

export async function logReading(date: string, minutes: number): Promise<void> {
  await dailyAPI.logReading(date, minutes);
}

export async function logWater(date: string, glasses: number): Promise<void> {
  await dailyAPI.logWater(date, glasses);
}

export async function logKefir(date: string, glasses: number): Promise<void> {
  await dailyAPI.logKefir(date, glasses);
}

export async function logNoPhoneAfter21(date: string, success: boolean): Promise<void> {
  await dailyAPI.logNoPhoneAfter21(date, success);
}

export async function saveDailyLog(log: Partial<DailyLog>): Promise<void> {
  const date = log.date || new Date().toISOString().split('T')[0];
  if (log.reading_minutes !== undefined && log.reading_minutes > 0) {
    await logReading(date, log.reading_minutes);
  }
  if (log.water_glasses !== undefined && log.water_glasses > 0) {
    await logWater(date, log.water_glasses);
  }
  if (log.kefir_glasses !== undefined && log.kefir_glasses > 0) {
    await logKefir(date, log.kefir_glasses);
  }
  if (log.no_phone_after_21 !== undefined) {
    await logNoPhoneAfter21(date, log.no_phone_after_21 === 1);
  }
}

export async function getDashboard() {
  try {
    return await dashboardAPI.get();
  } catch (e) {
    console.error('Error fetching dashboard:', e);
    return null;
  }
}
