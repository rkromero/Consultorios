import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    fullName: string;
}

interface Tenant {
    id: string;
    name: string;
    role?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    tenant: Tenant | null; // Selected tenant
    role: string | null; // User role in current tenant
    selectedSiteId: string | null; // Selected site
    availableTenants: Tenant[]; // List of tenants user belongs to

    setLogin: (token: string, user: User, tenants: Tenant[]) => void;
    selectTenant: (token: string, tenant: Tenant, role: string) => void;
    setSelectedSiteId: (siteId: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            tenant: null,
            role: null,
            selectedSiteId: null,
            availableTenants: [],

            setLogin: (token, user, tenants) => set({ token, user, availableTenants: tenants }),
            selectTenant: (token, tenant, role) => set({ token, tenant, role, selectedSiteId: null }),
            setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
            logout: () => set({ token: null, user: null, tenant: null, role: null, selectedSiteId: null, availableTenants: [] }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
