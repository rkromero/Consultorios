import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Phone, Building } from 'lucide-react';
import { useSites, useCreateSite } from '../../hooks/useSites';

// --- Form Schema ---
const siteSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    address: z.string().optional(),
    phone: z.string().optional(),
});
type SiteForm = z.infer<typeof siteSchema>;

export default function SitesPage() {
    const { data: sites, isLoading } = useSites();
    const createSite = useCreateSite();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form handling
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SiteForm>({
        resolver: zodResolver(siteSchema)
    });

    const onSubmit = (data: SiteForm) => {
        createSite.mutate(data, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    if (isLoading) return <div>Cargando sedes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Sedes</h2>
                    <p className="text-xs text-slate-500 font-medium">{sites?.length || 0} sedes operativas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nueva Sede
                </button>
            </div>

            {/* Grid of Sites */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites?.map((site: any) => (
                    <div key={site.id} className="card-premium flex flex-col hover:border-indigo-200 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                    <Building className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{site.name}</h3>
                                </div>
                            </div>
                            {site.active ? (
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
                            ) : (
                                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Inactivo</span>
                            )}
                        </div>

                        <div className="space-y-2 mt-2 flex-1">
                            {site.address && (
                                <div className="flex items-center gap-2.5 text-slate-500">
                                    <MapPin size={16} className="text-slate-300" />
                                    <span className="text-sm font-medium">{site.address}</span>
                                </div>
                            )}
                            {site.phone && (
                                <div className="flex items-center gap-2.5 text-slate-500">
                                    <Phone size={16} className="text-slate-300" />
                                    <span className="text-sm font-medium">{site.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                            <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">CONFIGURAR SEDE</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Very Simple Modal (Replace with Dialog component later) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <Building size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Nueva Sede</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre de la Sede</label>
                                <input {...register('name')} className="input-premium" placeholder="Ej: Clínica Central" />
                                {errors.name && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dirección</label>
                                <input {...register('address')} className="input-premium" placeholder="Calle falsa 123" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Teléfono</label>
                                <input {...register('phone')} className="input-premium" placeholder="+54 11..." />
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-8"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
