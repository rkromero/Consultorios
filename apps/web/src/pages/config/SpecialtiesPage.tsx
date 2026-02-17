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

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 animate-pulse">Cargando especialidades...</p>
        </div>
    );

    const isError = !specialties && !isLoading;
    if (isError) return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mx-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">
                        Error al cargar especialidades. Por favor, verifica la conexión con el servidor.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Especialidades</h2>
                    <p className="text-xs text-slate-500 font-medium">{specialties?.length || 0} registradas en total</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nueva Especialidad
                </button>
            </div>

            {/* List of Specialties */}
            <div className="card-premium p-0 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {specialties?.map((specialty: any) => (
                            <tr key={specialty.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-50 p-2 rounded-xl">
                                            <Stethoscope size={18} className="text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{specialty.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(specialty.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg inline-flex"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {specialties?.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center">
                                    <p className="text-sm text-slate-400 font-medium">No hay especialidades registradas.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <Stethoscope size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Nueva Especialidad</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre de la Especialidad</label>
                                <input
                                    {...register('name')}
                                    className="input-premium py-3"
                                    placeholder="Ej: Kinesiología, Odontología..."
                                />
                                {errors.name && <span className="text-red-500 text-xs mt-1 font-medium block">{errors.name.message}</span>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
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
