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
}

interface AuthState {
    token: string | null;
    user: User | null;
    tenant: Tenant | null; // Selected tenant
    availableTenants: Tenant[]; // List of tenants user belongs to

    setLogin: (token: string, user: User, tenants: Tenant[]) => void;
    selectTenant: (token: string, tenant: Tenant) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            tenant: null,
            availableTenants: [],

            setLogin: (token, user, tenants) => set({ token, user, availableTenants: tenants }),
            selectTenant: (token, tenant) => set({ token, tenant }),
            logout: () => set({ token: null, user: null, tenant: null, availableTenants: [] }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
