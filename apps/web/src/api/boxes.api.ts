import api from '../lib/axios';
import { Site } from './sites.api';

export interface Box {
    id: string;
    name: string;
    active: boolean;
    siteId: string;
    site?: Site;
}

export const getBoxes = async (siteId?: string): Promise<Box[]> => {
    const { data } = await api.get('/boxes', { params: { siteId } });
    return data;
};

export const createBox = async (box: { name: string; siteId: string }): Promise<Box> => {
    const { data } = await api.post('/boxes', box);
    return data;
};

export const updateBox = async (id: string, box: Partial<Box>): Promise<Box> => {
    const { data } = await api.put(`/boxes/${id}`, box);
    return data;
};

export const deleteBox = async (id: string): Promise<void> => {
    await api.delete(`/boxes/${id}`);
};
