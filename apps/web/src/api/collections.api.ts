import api from '../lib/axios';

export enum CollectionStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

export interface Collection {
    id: string;
    appointmentId: string;
    amountDueArsInt: number;
    dueDate: string;
    status: CollectionStatus;
    paidAt: string | null;
    notes: string | null;
    appointment: {
        startTime: string;
        patient: { firstName: string; lastName: string };
        professional: { tenantUser: { user: { fullName: string } } };
        site: { name: string };
    };
}

export interface CollectionsKPIs {
    pending: { count: number; total: number };
    overdue: { count: number; total: number };
    paid: { count: number; total: number };
}

export interface CollectionsResponse {
    items: Collection[];
    kpis: CollectionsKPIs;
}

export const getCollections = async (params: any): Promise<CollectionsResponse> => {
    const response = await api.get('/admin/collections', { params });
    return response.data;
};

export const updateDueDate = async (appointmentId: string, dueDate: string): Promise<Collection> => {
    const response = await api.patch(`/admin/collections/${appointmentId}/due-date`, { dueDate });
    return response.data;
};

export const markAsPaid = async (appointmentId: string, data: { paidAt: string; notes?: string }): Promise<Collection> => {
    const response = await api.post(`/admin/collections/${appointmentId}/mark-paid`, data);
    return response.data;
};

export const revertToPending = async (appointmentId: string): Promise<Collection> => {
    const response = await api.post(`/admin/collections/${appointmentId}/revert-pending`);
    return response.data;
};
