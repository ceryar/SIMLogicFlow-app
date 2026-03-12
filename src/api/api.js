import axios from 'axios';

// En producción, Railway usará la variable VITE_API_BASE_URL.
// En desarrollo, usará el proxy de Vite (/api).
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

// Interceptor para incluir el token JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
