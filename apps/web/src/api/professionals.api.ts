import api from '../lib/axios';

export interface Professional {
    id: string;
    specialtyId: string;
    specialty?: { name: string };
    tenantUser: {
        user: {
            fullName: string;
            email: string;
        }
    };
    licenseNumber?: string;
    color?: string;
    active: boolean;
}

export const getProfessionals = async (activeOnly?: boolean): Promise<Professional[]> => {
    const params = activeOnly !== undefined ? { activeOnly: String(activeOnly) } : {};
    const { data } = await api.get('/professionals', { params });
    return data;
};

export const createProfessional = async (inputData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialtyId: string;
    licenseNumber?: string;
    color?: string
}): Promise<Professional> => {
    const { data } = await api.post('/professionals', inputData);
    return data;
};

export const updateProfessional = async (id: string, inputData: Partial<Professional>): Promise<Professional> => {
    const { data } = await api.put(`/professionals/${id}`, inputData);
    return data;
};

export const toggleProfessionalActive = async (id: string): Promise<Professional> => {
    const { data } = await api.patch(`/professionals/${id}/toggle-active`);
    return data;
};
