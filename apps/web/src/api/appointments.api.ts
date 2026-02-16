import api from '../lib/axios';

export enum AppointmentType {
    IN_PERSON = 'IN_PERSON',
    VIRTUAL = 'VIRTUAL',
}

export enum AppointmentStatus {
    RESERVED = 'RESERVED',
    CONFIRMED = 'CONFIRMED',
    ATTENDED = 'ATTENDED',
    ABSENT = 'ABSENT',
    CANCELLED = 'CANCELLED',
}

export interface Appointment {
    id: string;
    patientId: string;
    patient?: {
        firstName: string;
        lastName: string;
        phone?: string;
    };
    professionalId: string;
    professional?: {
        tenantUser: {
            user: { fullName: string }
        };
    };
    startTime: string; // ISO
    endTime: string;   // ISO
    type: AppointmentType;
    status: AppointmentStatus;
    notes?: string;
}

export const getAppointments = async (params: { start: string; end: string; professionalId?: string; siteId?: string }): Promise<Appointment[]> => {
    const { data } = await api.get('/appointments', { params });
    return data;
};

export const createAppointment = async (payload: {
    patientId: string;
    professionalId: string;
    siteId: string;
    startTime: string;
    endTime: string;
    type: AppointmentType;
    notes?: string;
}): Promise<Appointment> => {
    const { data } = await api.post('/appointments', payload);
    return data;
};

export const updateAppointment = async (id: string, payload: Partial<Appointment>): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}`, payload);
    return data;
};
