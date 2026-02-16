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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Consultorios ({boxes?.length || 0})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    Nuevo Consultorio
                </button>
            </div>

            {/* Grid of Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boxes?.map((box: any) => (
                    <div key={box.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <BoxIcon className="text-blue-500" size={20} />
                                    <h3 className="font-semibold text-gray-900">{box.name}</h3>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                                <Building size={14} />
                                {box.site?.name || 'Sede desconocida'}
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t flex justify-between items-center">
                            {box.active ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Activo</span>
                            ) : (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Inactivo</span>
                            )}
                            <button className="text-sm text-blue-600 hover:underline">Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nuevo Consultorio</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input {...register('name')} className="mt-1 block w-full border rounded-md p-2" placeholder="Ej: Consultorio 1" />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sede</label>
                                <select {...register('siteId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="">Seleccionar Sede</option>
                                    {sites?.map((site: any) => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                                {errors.siteId && <span className="text-red-500 text-sm">{errors.siteId.message}</span>}
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
