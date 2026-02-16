import api from '../lib/axios';

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    address?: string;
}

export interface PatientResponse {
    data: Patient[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getPatient = async (id: string): Promise<Patient> => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
};

export const getPatients = async (params: { q?: string; page?: number; limit?: number }): Promise<PatientResponse> => {
    const { data } = await api.get('/patients', { params });
    return data;
};

export const createPatient = async (inputData: Partial<Patient>): Promise<Patient> => {
    const { data } = await api.post('/patients', inputData);
    return data;
};

export const updatePatient = async (id: string, inputData: Partial<Patient>): Promise<Patient> => {
    const { data } = await api.put(`/patients/${id}`, inputData);
    return data;
};
