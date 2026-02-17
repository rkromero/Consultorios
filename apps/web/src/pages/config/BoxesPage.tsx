import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Box as BoxIcon, Building } from 'lucide-react';
import { useBoxes, useCreateBox } from '../../hooks/useBoxes';
import { useSites } from '../../hooks/useSites';

// --- Form Schema ---
const boxSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    siteId: z.string().min(1, "La sede es requerida"),
});
type BoxForm = z.infer<typeof boxSchema>;

export default function BoxesPage() {
    const { data: sites } = useSites();
    // Optional: filter by site logic could be added here
    const { data: boxes, isLoading } = useBoxes();
    const createBox = useCreateBox();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form handling
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BoxForm>({
        resolver: zodResolver(boxSchema)
    });

    const onSubmit = (data: BoxForm) => {
        createBox.mutate(data, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    if (isLoading) return <div>Cargando consultorios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Consultorios</h2>
                    <p className="text-xs text-slate-500 font-medium">{boxes?.length || 0} unidades registradas</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nuevo Consultorio
                </button>
            </div>

            {/* Grid of Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxes?.map((box: any) => (
                    <div key={box.id} className="card-premium flex flex-col hover:border-indigo-200 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-2.5 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                    <BoxIcon className="text-indigo-600" size={24} />
                                </div>
                                <h3 className="font-bold text-slate-900 leading-tight">{box.name}</h3>
                            </div>
                            {box.active ? (
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
                            ) : (
                                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Inactivo</span>
                            )}
                        </div>

                        <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-2">
                            <Building size={16} className="text-slate-300" />
                            {box.site?.name || 'Sede desconocida'}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
                            <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase">Editar Detalles</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <BoxIcon size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Consultorio</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Consultorio</label>
                                <input {...register('name')} className="input-premium" placeholder="Ej: Consultorio 1" />
                                {errors.name && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sede Responsable</label>
                                <select {...register('siteId')} className="input-premium appearance-none bg-white">
                                    <option value="">Seleccionar Sede</option>
                                    {sites?.map((site: any) => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                                {errors.siteId && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.siteId.message}</span>}
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
