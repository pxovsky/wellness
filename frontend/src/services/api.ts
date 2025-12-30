import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});

export const dashboardAPI = {
  get: () => API.get('/dashboard').then(r => r.data)
};

export const trainingsAPI = {
  getAll: (limit = 200) => API.get(`/trainings?limit=${limit}`).then(r => r.data),
  add: (data: any) => API.post('/trainings', data),
  delete: (id: number) => API.delete(`/trainings/${id}`)
};

export const dailyAPI = {
  logReading: () => API.post('/daily/reading', {}),
  logKefir: () => API.post('/daily/kefir', {})
};
