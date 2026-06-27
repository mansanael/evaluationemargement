import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (data: { email: string; password: string; name: string; poste?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const seminarsApi = {
  getAll: () => api.get('/seminars').then((r) => r.data),
  getOne: (id: string) => api.get(`/seminars/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/seminars', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/seminars/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/seminars/${id}`).then((r) => r.data),
};

export const attendanceApi = {
  getAll: (seminarId: string) =>
    api.get(`/seminars/${seminarId}/attendance`).then((r) => r.data),
  sign: (seminarId: string, data: { signatureData: string; guestName?: string; guestPoste?: string; signedAt?: string }) =>
    api.post(`/seminars/${seminarId}/attendance`, data).then((r) => r.data),
  delete: (seminarId: string, id: string) =>
    api.delete(`/seminars/${seminarId}/attendance/${id}`).then((r) => r.data),
};

export const evaluationsApi = {
  getAll: (seminarId: string) =>
    api.get(`/seminars/${seminarId}/evaluations`).then((r) => r.data),
  submit: (seminarId: string, data: any) =>
    api.post(`/seminars/${seminarId}/evaluations`, data).then((r) => r.data),
};

export const resourcesApi = {
  getAll: (seminarId: string) =>
    api.get(`/seminars/${seminarId}/resources`).then((r) => r.data),
  addLink: (seminarId: string, name: string, url: string) =>
    api.post(`/seminars/${seminarId}/resources/link`, { name, url }).then((r) => r.data),
  upload: (seminarId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/seminars/${seminarId}/resources/upload`, form).then((r) => r.data);
  },
  delete: (seminarId: string, id: string) =>
    api.delete(`/seminars/${seminarId}/resources/${id}`).then((r) => r.data),
};

export const analyticsApi = {
  getGlobal: () => api.get('/analytics').then((r) => r.data),
  getForSeminar: (seminarId: string) =>
    api.get(`/analytics/seminars/${seminarId}`).then((r) => r.data),
};
