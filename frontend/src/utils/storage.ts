import { Training, DailyLog, Task } from '../types';
import { trainingsAPI, dailyAPI, dashboardAPI, tasksAPI } from '../services/api';

// --- Treningi ---

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

// --- Daily Logs (Pobieranie) ---

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

// --- Helpery do logowania pojedynczych czynności ---

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

export async function logVibeCoding(date: string, minutes: number): Promise<void> {
  await dailyAPI.logVibeCoding(date, minutes);
}

export async function logHouseholdChores(date: string, count: number): Promise<void> {
  await dailyAPI.logHouseholdChores(date, count);
}

export async function logVitamins(date: string, taken: boolean): Promise<void> {
  await dailyAPI.logVitamins(date, taken);
}

// --- Główna funkcja zapisu (Unified) ---

// Definicje typów dla Overloading (żeby TypeScript nie krzyczał w Calendar.tsx)
export async function saveDailyLog(log: Partial<DailyLog>): Promise<void>;
export async function saveDailyLog(metric: string, data: any, date: string): Promise<void>;

export async function saveDailyLog(
  arg1: Partial<DailyLog> | string,
  arg2?: any,
  arg3?: string
): Promise<void> {
  
  // Przypadek 1: Nowe użycie (Calendar.tsx) -> saveDailyLog('reading', { minutes: 30 }, '2024-01-01')
  if (typeof arg1 === 'string') {
    const metric = arg1;
    const data = arg2;
    const date = arg3!;

    try {
      switch (metric) {
        case 'reading':
          if (data.minutes !== undefined) await logReading(date, data.minutes);
          break;
        case 'water':
          if (data.glasses !== undefined) await logWater(date, data.glasses);
          break;
        case 'kefir':
          if (data.glasses !== undefined) await logKefir(date, data.glasses);
          break;
        case 'vibe-coding':
        case 'vibe_coding': 
          if (data.minutes !== undefined) await logVibeCoding(date, data.minutes);
          break;
        case 'no-phone':
          if (data.success !== undefined) await logNoPhoneAfter21(date, data.success);
          break;
        case 'chores':
        case 'household_chores':
          // Frontend czasem wysyła completed=1/0 zamiast count
          const count = data.count !== undefined ? data.count : (data.completed ? 1 : 0);
          await logHouseholdChores(date, count);
          break;
        case 'vitamins':
          // Frontend może wysłać taken=1/0 lub boolean
          const taken = typeof data.taken === 'boolean' ? data.taken : data.taken === 1;
          await logVitamins(date, taken);
          break;
        default:
          console.warn(`Unknown metric: ${metric}`);
      }
    } catch (e) {
      console.error(`Error saving ${metric} for ${date}:`, e);
      throw e;
    }
    return;
  }

  // Przypadek 2: Stare użycie (Obiekt) -> saveDailyLog({ date: '...', reading_minutes: 30 })
  const log = arg1;
  const date = log.date || new Date().toISOString().split('T')[0];

  try {
    if (log.reading_minutes !== undefined) {
      await logReading(date, log.reading_minutes);
    }
    if (log.water_glasses !== undefined) {
      await logWater(date, log.water_glasses);
    }
    if (log.kefir_glasses !== undefined) {
      await logKefir(date, log.kefir_glasses);
    }
    if (log.no_phone_after_21 !== undefined) {
      await logNoPhoneAfter21(date, log.no_phone_after_21 === 1);
    }
    if (log.vibe_coding_minutes !== undefined) {
      await logVibeCoding(date, log.vibe_coding_minutes);
    }
    if (log.household_chores !== undefined) {
      await logHouseholdChores(date, log.household_chores);
    }
    if (log.vitamins !== undefined) {
      const taken = typeof log.vitamins === 'number' ? log.vitamins === 1 : !!log.vitamins;
      await logVitamins(date, taken);
    }
  } catch (e) {
    console.error('Error saving daily log (object mode):', e);
    throw e;
  }
}

// --- Dashboard ---

export async function getDashboard() {
  try {
    return await dashboardAPI.get();
  } catch (e) {
    console.error('Error fetching dashboard:', e);
    return null;
  }
}

// --- Tasks ---

export async function getTasks(): Promise<Task[]> {
  return await tasksAPI.getAll();
}

export async function addTask(task: Partial<Task>): Promise<void> {
  await tasksAPI.add(task);
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<void> {
  await tasksAPI.update(id, updates);
}

export async function deleteTask(id: number): Promise<void> {
  await tasksAPI.delete(id);
}

export async function reorderTasks(taskIds: number[]): Promise<void> {
  await tasksAPI.reorder(taskIds);
}
