import api from '../lib/axios';

export interface TenantInfo {
    id: string;
    name: string;
    logoUrl: string | null;
}

export const getTenantInfo = async (): Promise<TenantInfo> => {
    const { data } = await api.get('/tenant');
    return data;
};

export const updateTenantName = async (name: string): Promise<TenantInfo> => {
    const { data } = await api.put('/tenant/name', { name });
    return data;
};

export const uploadTenantLogo = async (logoDataUrl: string): Promise<TenantInfo> => {
    const { data } = await api.post('/tenant/logo', { logoDataUrl });
    return data;
};

export const removeTenantLogo = async (): Promise<TenantInfo> => {
    const { data } = await api.delete('/tenant/logo');
    return data;
};
