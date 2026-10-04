import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorText = (err) => err.response?.data?.message || 'Could not reach the server';
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// Downloads a file from an authenticated endpoint
export async function download(path, params, filename) {
  const { data } = await api.get(path, { params, responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
export default api;
