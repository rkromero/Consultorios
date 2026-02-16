import api from '../lib/axios';

export interface Invoice {
    id: string;
    amount: number;
    concept: string;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    paymentMethod?: string;
    createdAt: string;
    patient: {
        firstName: string;
        lastName: string;
        dni: string;
    };
}

export const getInvoices = async (params: { startDate?: string; endDate?: string; status?: string }): Promise<Invoice[]> => {
    const { data } = await api.get('/invoices', { params });
    return data;
};

export const createInvoice = async (data: { patientId: string; amount: number; concept: string; status: string; paymentMethod?: string }): Promise<Invoice> => {
    const { data: response } = await api.post('/invoices', data);
    return response;
};

export const updateInvoice = async (id: string, data: { status?: string; paymentMethod?: string }): Promise<Invoice> => {
    const { data: response } = await api.put(`/invoices/${id}`, data);
    return response;
};

export const getStats = async (): Promise<{ revenue: number; counts: any[] }> => {
    const { data } = await api.get('/invoices/stats');
    return data;
};
