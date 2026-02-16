import api from '../lib/axios';

export interface Site {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    active: boolean;
}

export const getSites = async (): Promise<Site[]> => {
    const { data } = await api.get('/sites');
    return data;
};

export const createSite = async (site: { name: string; address?: string; phone?: string }): Promise<Site> => {
    const { data } = await api.post('/sites', site);
    return data;
};

export const updateSite = async (id: string, site: Partial<Site>): Promise<Site> => {
    const { data } = await api.put(`/sites/${id}`, site);
    return data;
};

export const deleteSite = async (id: string): Promise<void> => {
    await api.delete(`/sites/${id}`);
};
