import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Stethoscope } from 'lucide-react';
import { useProfessionals, useCreateProfessional } from '../../hooks/useProfessionals';
import { useSpecialties } from '../../hooks/useSpecialties';

// --- Form Schema ---
const professionalSchema = z.object({
    userId: z.string().min(1, "El usuario es requerido"), // In real app, this should be a User Select
    specialtyId: z.string().min(1, "La especialidad es requerida"),
    licenseNumber: z.string().optional(),
});
type ProfessionalForm = z.infer<typeof professionalSchema>;

export default function ProfessionalsPage() {
    const { data: professionals, isLoading } = useProfessionals();
    const { data: specialties } = useSpecialties();
    const createProfessional = useCreateProfessional();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form handling
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfessionalForm>({
        resolver: zodResolver(professionalSchema)
    });

    const onSubmit = (data: ProfessionalForm) => {
        createProfessional.mutate(data, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    if (isLoading) return <div>Cargando profesionales...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Profesionales ({professionals?.length || 0})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm"
                >
                    <Plus size={16} />
                    Nuevo Profesional
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals?.map((prof: any) => (
                    <div key={prof.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full flex items-center justify-center">
                            <Stethoscope size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{prof.tenantUser?.user?.fullName || 'Usuario'}</h3>
                            <p className="text-sm text-gray-500">{prof.specialty?.name || 'Sin especialidad'}</p>
                            {prof.licenseNumber && (
                                <p className="text-xs text-gray-400 mt-1">MN: {prof.licenseNumber}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nuevo Profesional</h3>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <p className="text-sm text-yellow-700">
                                Nota: Para el MVP, debes ingresar el ID del usuario manualmente. En el futuro, esto será un selector de usuarios.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                                <input {...register('userId')} className="mt-1 block w-full border rounded-md p-2" placeholder="UUID del usuario" />
                                {errors.userId && <span className="text-red-500 text-sm">{errors.userId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                                <select {...register('specialtyId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="">Seleccionar Especialidad</option>
                                    {specialties?.map((spec: any) => (
                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                    ))}
                                </select>
                                {errors.specialtyId && <span className="text-red-500 text-sm">{errors.specialtyId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Matrícula (Opcional)</label>
                                <input {...register('licenseNumber')} className="mt-1 block w-full border rounded-md p-2" />
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
