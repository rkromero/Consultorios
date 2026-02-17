import api from '../lib/axios';

export interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    createdAt: string;
}

export const usersApi = {
    getAll: async () => {
        const { data } = await api.get<UserResponse[]>('/users');
        return data;
    }
};
