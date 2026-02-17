import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const tenantId = useAuthStore.getState().tenant?.id;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
        config.headers['x-tenant-id'] = tenantId;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
