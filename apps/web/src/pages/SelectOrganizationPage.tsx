import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/axios';
import { Building2, ChevronRight, UserCircle } from 'lucide-react';

export default function SelectOrganizationPage() {
    const { user, availableTenants, selectTenant } = useAuthStore();
    const navigate = useNavigate();

    const handleSelect = async (tenantId: string) => {
        try {
            const res = await api.post('/auth/select-tenant', { tenantId });
            selectTenant(res.data.token, res.data.tenant);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to select tenant', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px]" />

            <div className="max-w-2xl w-full relative">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6 group cursor-default">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {user?.fullName[0]}
                        </div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                            Hola, {user?.fullName.split(' ')[0]}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Seleccione su Organización</h1>
                    <p className="text-slate-500 font-medium">Elija el centro médico con el que desea trabajar hoy</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {availableTenants.map((tenant: any) => (
                        <button
                            key={tenant.id}
                            onClick={() => handleSelect(tenant.id)}
                            className="card-premium p-8 bg-white/80 backdrop-blur-xl border-white hover:border-indigo-300 hover:translate-y-[-4px] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Building2 size={120} className="text-indigo-600" />
                            </div>

                            <div className="flex flex-col h-full relative z-10">
                                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Building2 size={24} />
                                </div>

                                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                    {tenant.name}
                                </h3>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100/50">
                                    <div className="flex items-center gap-2">
                                        <UserCircle size={14} className="text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                            Rol: {tenant.role === 'ADMIN' ? 'Administrador' : 'Profesional'}
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                    >
                        &larr; Cerrar Sesión y Cambiar Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}
