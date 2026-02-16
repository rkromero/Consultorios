import api from '../lib/axios';

export interface Specialty {
    id: string;
    name: string;
}

export const getSpecialties = async (): Promise<Specialty[]> => {
    const { data } = await api.get('/specialties');
    return data;
};

export const createSpecialty = async (inputData: { name: string }): Promise<Specialty> => {
    const { data } = await api.post('/specialties', inputData);
    return data;
};

export const deleteSpecialty = async (id: string): Promise<void> => {
    await api.delete(`/specialties/${id}`);
};
