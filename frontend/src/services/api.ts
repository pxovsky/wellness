import axios from 'axios';
import { Training, Task } from '../types';

const API = axios.create({
  baseURL: 'http://192.168.0.153:5000/api',
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
  logNoPhoneAfter21: (date: string, success: boolean) => API.post('/daily/no_phone_after_21', { date, success }).then(r => r.data),
  logVibeCoding: (date: string, minutes: number) => API.post('/daily/vibe_coding', { date, minutes }).then(r => r.data),
  logHouseholdChores: (date: string, count: number) => API.post('/daily/chores', { date, count }).then(r => r.data),
  // 👇 NOWA METODA
  logVitamins: (date: string, taken: boolean) => API.post('/daily/vitamins', { date, taken }).then(r => r.data)
};

export const tasksAPI = {
  getAll: () => API.get('/tasks').then(r => r.data),
  add: (task: Partial<Task>) => API.post('/tasks', task).then(r => r.data),
  update: (id: number, updates: Partial<Task>) => API.put(`/tasks/${id}`, updates).then(r => r.data),
  delete: (id: number) => API.delete(`/tasks/${id}`).then(r => r.data),
  reorder: (taskIds: number[]) => API.post('/tasks/reorder', { task_ids: taskIds }).then(r => r.data)
};
