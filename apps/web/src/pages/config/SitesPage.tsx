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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Sedes ({sites?.length || 0})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    Nueva Sede
                </button>
            </div>

            {/* Grid of Sites */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sites?.map((site: any) => (
                    <div key={site.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Building className="text-blue-500" size={20} />
                                <h3 className="font-semibold text-gray-900">{site.name}</h3>
                            </div>
                            {site.active ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activo</span>
                            ) : (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Inactivo</span>
                            )}
                        </div>

                        <div className="space-y-1 mt-4">
                            {site.address && (
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <MapPin size={14} /> {site.address}
                                </p>
                            )}
                            {site.phone && (
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <Phone size={14} /> {site.phone}
                                </p>
                            )}
                        </div>

                        <div className="mt-4 pt-3 border-t flex justify-end">
                            <button className="text-sm text-blue-600 hover:underline">Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Very Simple Modal (Replace with Dialog component later) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nueva Sede</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input {...register('name')} className="mt-1 block w-full border rounded-md p-2" />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                <input {...register('address')} className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input {...register('phone')} className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
