import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Stethoscope } from 'lucide-react';
import { useProfessionals, useCreateProfessional } from '../../hooks/useProfessionals';
import { useSpecialties } from '../../hooks/useSpecialties';

// --- Form Schema ---
const professionalSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
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

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 animate-pulse">Cargando profesionales...</p>
        </div>
    );

    if (professionals?.length === 0 && !isLoading) {
        // Fallback for empty state or if something failed silently
    }

    // Handle error state
    const isError = !professionals && !isLoading;
    if (isError) return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700">
                        Error al cargar profesionales. Por favor, verifica la conexión con el servidor.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Profesionales</h2>
                    <p className="text-xs text-slate-500 font-medium">{professionals?.length || 0} registrados en total</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nuevo Profesional
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals?.map((prof: any) => (
                    <div key={prof.id} className="card-premium flex items-start gap-4 hover:border-indigo-200 transition-colors group relative">
                        <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                            <Stethoscope size={28} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 truncate">{prof.tenantUser?.user?.fullName || 'Usuario'}</h3>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">{prof.specialty?.name || 'Sin especialidad'}</p>

                            <div className="space-y-1">
                                {prof.licenseNumber && (
                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        MN: {prof.licenseNumber}
                                    </p>
                                )}
                                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    {prof.tenantUser?.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <Stethoscope size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Profesional</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre</label>
                                    <input {...register('firstName')} className="input-premium" placeholder="Ej: Juan" />
                                    {errors.firstName && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.firstName.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Apellido</label>
                                    <input {...register('lastName')} className="input-premium" placeholder="Ej: Perez" />
                                    {errors.lastName && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email (Acceso al sistema)</label>
                                <input {...register('email')} type="email" className="input-premium" placeholder="profesional@ejemplo.com" />
                                {errors.email && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Celular</label>
                                    <input {...register('phone')} className="input-premium" placeholder="Ej: 11223344" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Matrícula (MN)</label>
                                    <input {...register('licenseNumber')} className="input-premium" placeholder="Ej: 123456" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Especialidad</label>
                                <select {...register('specialtyId')} className="input-premium appearance-none bg-white">
                                    <option value="">Seleccionar Especialidad</option>
                                    {specialties?.map((spec: any) => (
                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                    ))}
                                </select>
                                {errors.specialtyId && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.specialtyId.message}</span>}
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
