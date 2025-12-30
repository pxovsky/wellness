
import { Training, DailyLog } from '../types';

const TRAININGS_KEY = 'myniu_trainings';
const DAILY_LOGS_KEY = 'myniu_daily_logs';

export const getTrainings = (): Training[] => {
  const data = localStorage.getItem(TRAININGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTraining = (training: Training) => {
  const trainings = getTrainings();
  localStorage.setItem(TRAININGS_KEY, JSON.stringify([training, ...trainings]));
};

export const deleteTraining = (id: string) => {
  const trainings = getTrainings();
  localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings.filter(t => t.id !== id)));
};

export const getDailyLogs = (): DailyLog[] => {
  const data = localStorage.getItem(DAILY_LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDailyLog = (log: DailyLog) => {
  const logs = getDailyLogs();
  const index = logs.findIndex(l => l.date === log.date);
  if (index !== -1) {
    logs[index] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
};

export const getTodayLog = (): DailyLog => {
  const today = new Date().toISOString().split('T')[0];
  const logs = getDailyLogs();
  return logs.find(l => l.date === today) || { date: today, reading: false, kefir: false };
};
