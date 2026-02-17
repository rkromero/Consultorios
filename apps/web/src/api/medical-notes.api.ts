import api from '../lib/axios';

export interface Attachment {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
}

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
    attachments: Attachment[];
}

export const getByPatient = async (patientId: string): Promise<MedicalNote[]> => {
    const { data } = await api.get(`/medical-notes/patient/${patientId}`);
    return data;
};

export const createMedicalNote = async (payload: FormData): Promise<MedicalNote> => {
    const { data } = await api.post('/medical-notes', payload, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};
