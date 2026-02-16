import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Stethoscope, Trash2 } from 'lucide-react';
import { useSpecialties, useCreateSpecialty, useDeleteSpecialty } from '../../hooks/useSpecialties';

// --- Form Schema ---
const specialtySchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
});
type SpecialtyForm = z.infer<typeof specialtySchema>;

export default function SpecialtiesPage() {
    const { data: specialties, isLoading } = useSpecialties();
    const createSpecialty = useCreateSpecialty();
    const deleteSpecialty = useDeleteSpecialty();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form handling
    const { register, handleSubmit, reset, formState: { errors } } = useForm<SpecialtyForm>({
        resolver: zodResolver(specialtySchema)
    });

    const onSubmit = (data: SpecialtyForm) => {
        createSpecialty.mutate(data, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta especialidad?')) {
            deleteSpecialty.mutate(id);
        }
    };

    if (isLoading) return <div>Cargando especialidades...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Especialidades ({specialties?.length || 0})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    Nueva Especialidad
                </button>
            </div>

            {/* List of Specialties */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 max-w-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {specialties?.map((specialty: any) => (
                            <tr key={specialty.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-full">
                                            <Stethoscope size={16} className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{specialty.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(specialty.id)}
                                        className="text-red-600 hover:text-red-900 flex items-center gap-1 justify-end w-full"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {specialties?.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-10 text-center text-gray-500">
                                    No hay especialidades registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nueva Especialidad</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input {...register('name')} className="mt-1 block w-full border rounded-md p-2" placeholder="Ej: Kinesiología" />
                                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
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
