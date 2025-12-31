import axios from 'axios';
import { Training, DailyLog } from '../types';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

export const dashboardAPI = {
  get: () => API.get('/dashboard').then(r => r.data)
};

export const trainingsAPI = {
  getAll: (limit = 200) => API.get(`/trainings?limit=${limit}`).then(r => r.data.trainings),
  add: (data: Omit<Training, 'id'>) => API.post('/trainings', data).then(r => r.data),
  get: (id: number) => API.get(`/trainings/${id}`).then(r => r.data),
  delete: (id: number) => API.delete(`/trainings/${id}`).then(r => r.data)
};

export const dailyAPI = {
  getLog: (date: string) => API.get(`/daily/${date}`).then(r => r.data),
  getLogs: (start_date: string, end_date: string) => API.get(`/daily?start_date=${start_date}&end_date=${end_date}`).then(r => r.data.logs),
  logReading: (date: string, minutes: number) => API.post('/daily/reading', { date, minutes }).then(r => r.data),
  logWater: (date: string, glasses: number) => API.post('/daily/water', { date, glasses }).then(r => r.data),
  logKefir: (date: string, glasses: number) => API.post('/daily/kefir', { date, glasses }).then(r => r.data),
  logNoPhoneAfter21: (date: string, success: boolean) => API.post('/daily/no_phone_after_21', { date, success }).then(r => r.data)
};
