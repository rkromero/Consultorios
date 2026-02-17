import api from '../lib/axios';

export interface UserResponse {
    id: string;
    tenantUserId: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    createdAt: string;
}

export interface InviteUserData {
    email: string;
    fullName: string;
    password: string;
    role: string;
}

export const usersApi = {
    getAll: async () => {
        const { data } = await api.get<UserResponse[]>('/users');
        return data;
    },

    invite: async (data: InviteUserData) => {
        const { data: result } = await api.post('/users/invite', data);
        return result;
    },

    remove: async (userId: string) => {
        const { data } = await api.delete(`/users/${userId}`);
        return data;
    },

    updateRole: async (userId: string, role: string) => {
        const { data } = await api.put(`/users/${userId}/role`, { role });
        return data;
    }
};
