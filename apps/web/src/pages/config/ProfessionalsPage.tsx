import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Stethoscope, UserCheck, UserX, Loader2 } from 'lucide-react';
import { useProfessionals, useCreateProfessional, useToggleProfessionalActive } from '../../hooks/useProfessionals';
import { useSpecialties } from '../../hooks/useSpecialties';
import { cn } from '../../lib/utils';

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
    const toggleActive = useToggleProfessionalActive();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

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

    const handleToggleActive = (profId: string, profName: string, isActive: boolean) => {
        const msg = isActive
            ? `¿Desactivar a ${profName}? No aparecerá al cargar turnos, pero su historial se mantiene.`
            : `¿Reactivar a ${profName}? Volverá a estar disponible para turnos.`;
        if (confirm(msg)) {
            toggleActive.mutate(profId);
        }
    };

    const activeProfessionals = professionals?.filter(p => p.active) || [];
    const inactiveProfessionals = professionals?.filter(p => !p.active) || [];

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 animate-pulse font-medium">Cargando profesionales...</p>
        </div>
    );

    const isError = !professionals && !isLoading;
    if (isError) return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">Error al cargar profesionales. Por favor, verifica la conexión con el servidor.</p>
        </div>
    );

    const ProfessionalCard = ({ prof, isInactive }: { prof: any; isInactive?: boolean }) => (
        <div className={cn(
            "card-premium flex flex-col gap-3 transition-all group relative",
            isInactive
                ? "opacity-60 border-slate-200 bg-slate-50/50"
                : "hover:border-indigo-200"
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    isInactive ? "bg-slate-100" : "bg-indigo-50 group-hover:bg-indigo-100"
                )}>
                    <Stethoscope size={28} className={isInactive ? "text-slate-400" : "text-indigo-600"} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={cn("font-bold truncate", isInactive ? "text-slate-500" : "text-slate-900")}>
                            {prof.tenantUser?.user?.fullName || 'Usuario'}
                        </h3>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0",
                            isInactive
                                ? "bg-rose-50 text-rose-400"
                                : "bg-emerald-50 text-emerald-500"
                        )}>
                            {isInactive ? 'Inactivo' : 'Activo'}
                        </span>
                    </div>
                    <p className={cn(
                        "text-xs font-bold uppercase tracking-wider mb-2",
                        isInactive ? "text-slate-400" : "text-indigo-500"
                    )}>
                        {prof.specialty?.name || 'Sin especialidad'}
                    </p>

                    <div className="space-y-1">
                        {prof.licenseNumber && (
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                                MN: {prof.licenseNumber}
                            </p>
                        )}
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-200 inline-block" />
                            {prof.tenantUser?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => handleToggleActive(prof.id, prof.tenantUser?.user?.fullName, prof.active)}
                disabled={toggleActive.isPending}
                className={cn(
                    "w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                    isInactive
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        : "border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                )}
            >
                {toggleActive.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : isInactive ? (
                    <><UserCheck size={14} /> Reactivar</>
                ) : (
                    <><UserX size={14} /> Desactivar</>
                )}
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Profesionales</h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {activeProfessionals.length} activos
                        {inactiveProfessionals.length > 0 && ` · ${inactiveProfessionals.length} inactivos`}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nuevo Profesional
                </button>
            </div>

            {/* Active professionals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProfessionals.map((prof: any) => (
                    <ProfessionalCard key={prof.id} prof={prof} />
                ))}
            </div>

            {activeProfessionals.length === 0 && (
                <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                    <Stethoscope size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium">No hay profesionales activos.</p>
                </div>
            )}

            {/* Inactive professionals */}
            {inactiveProfessionals.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors mb-4"
                    >
                        {showInactive ? '▾' : '▸'} Profesionales inactivos ({inactiveProfessionals.length})
                    </button>

                    {showInactive && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inactiveProfessionals.map((prof: any) => (
                                <ProfessionalCard key={prof.id} prof={prof} isInactive />
                            ))}
                        </div>
                    )}
                </div>
            )}

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
