import api from '../lib/axios';

export interface MedicalNote {
    id: string;
    content: string;
    date: string;
    author: {
        tenantUser: {
            user: {
                fullName: string;
            }
        };
        specialty: {
            name: string;
        }
    };
}

export const getByPatient = async (patientId: string): Promise<MedicalNote[]> => {
    const { data } = await api.get(`/medical-notes/patient/${patientId}`);
    return data;
};

export const createMedicalNote = async (payload: { patientId: string; content: string }): Promise<MedicalNote> => {
    const { data } = await api.post('/medical-notes', payload);
    return data;
};
