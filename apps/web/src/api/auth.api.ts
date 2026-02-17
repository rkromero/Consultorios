import axios from 'axios';

const API_URL = '/api';

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    tenantName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: async (data: RegisterData) => {
        const response = await axios.post(`${API_URL}/auth/register`, data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const response = await axios.post(`${API_URL}/auth/login`, data);
        return response.data;
    },

    selectTenant: async (tenantId: string, token: string) => {
        const response = await axios.post(
            `${API_URL}/auth/select-tenant`,
            { tenantId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
};
