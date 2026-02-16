import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/axios';

export default function SelectOrganizationPage() {
    const { user, availableTenants, selectTenant } = useAuthStore();
    const navigate = useNavigate();

    const handleSelect = async (tenantId: string) => {
        try {
            const res = await api.post('/auth/select-tenant', { tenantId });
            selectTenant(res.data.token, res.data.tenant); // Update with full tenant token
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to select tenant', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-2">Bienvenido, {user?.fullName}</h1>
            <p className="text-gray-600 mb-8">Selecciona una organización para continuar</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
                {availableTenants.map((tenant: any) => (
                    <button
                        key={tenant.id}
                        onClick={() => handleSelect(tenant.id)}
                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border text-left group"
                    >
                        <h3 className="text-xl font-semibold group-hover:text-blue-600">{tenant.name}</h3>
                        <span className="text-sm text-gray-500 mt-2 block">{tenant.role}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
