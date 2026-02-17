import api from './index';

export interface PriceVersion {
    id: string;
    priceArsInt: number;
    effectiveFrom: string;
    createdByUserId: string;
    isActive: boolean;
}

export interface PricingResponse {
    current: PriceVersion | null;
    history: PriceVersion[];
}

export const getPricing = async (): Promise<PricingResponse> => {
    const response = await api.get('/admin/pricing');
    return response.data;
};

export const createPriceVersion = async (priceArsInt: number): Promise<PriceVersion> => {
    const response = await api.post('/admin/pricing', { priceArsInt });
    return response.data;
};

export const runSetup = async (): Promise<{ message: string; totalAppointmentsUpdated: number }> => {
    const response = await api.post('/admin/pricing/setup');
    return response.data;
};
