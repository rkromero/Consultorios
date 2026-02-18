import api from '../lib/axios';
import axios from 'axios';

export interface LandingSection {
    title: string;
    description: string;
    items: { icon: string; title: string; description: string }[];
}

export interface LandingContact {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
}

export interface LandingTheme {
    primaryColor: string;
    accentColor: string;
}

export interface LandingSeo {
    title?: string | null;
    description?: string | null;
    ogImage?: string | null;
}

export interface LandingPage {
    id?: string;
    tenantId?: string;
    enabled: boolean;
    slug: string;
    headline?: string | null;
    subheadline?: string | null;
    heroImageUrl?: string | null;
    logoUrl?: string | null;
    primaryCtaText?: string | null;
    primaryCtaLink?: string | null;
    sections?: LandingSection[] | null;
    contact?: LandingContact | null;
    theme?: LandingTheme | null;
    seo?: LandingSeo | null;
    poweredByEnabled: boolean;
    updatedAt?: string;
}

export const getLanding = async (): Promise<LandingPage> => {
    const { data } = await api.get('/landing');
    return data;
};

export const updateLanding = async (payload: Partial<LandingPage>): Promise<LandingPage> => {
    const { data } = await api.put('/landing', payload);
    return data;
};

export const enableLanding = async (): Promise<LandingPage> => {
    const { data } = await api.put('/landing/enable');
    return data;
};

export const disableLanding = async (): Promise<LandingPage> => {
    const { data } = await api.put('/landing/disable');
    return data;
};

export const updateSlug = async (slug: string): Promise<LandingPage> => {
    const { data } = await api.put('/landing/slug', { slug });
    return data;
};

export const uploadLandingImage = async (image: string, field: 'logoUrl' | 'heroImageUrl'): Promise<LandingPage> => {
    const { data } = await api.post('/landing/upload', { image, field });
    return data;
};

export const removeLandingImage = async (field: 'logoUrl' | 'heroImageUrl'): Promise<LandingPage> => {
    const { data } = await api.post('/landing/remove-image', { field });
    return data;
};

export const getPublicLanding = async (slug: string): Promise<LandingPage & { tenant: { name: string } }> => {
    const { data } = await axios.get(`/api/public/landing/${slug}`);
    return data;
};
