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
}

export const getProfessionals = async (): Promise<Professional[]> => {
    const { data } = await api.get('/professionals');
    return data;
};

export const createProfessional = async (inputData: { userId: string; specialtyId: string; licenseNumber?: string; color?: string }): Promise<Professional> => {
    const { data } = await api.post('/professionals', inputData);
    return data;
};

export const updateProfessional = async (id: string, inputData: Partial<Professional>): Promise<Professional> => {
    const { data } = await api.put(`/professionals/${id}`, inputData);
    return data;
};
