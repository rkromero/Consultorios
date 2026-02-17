import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X,
    Calendar,
    Clock,
    User,
    Building2,
    FileText,
    Loader2,
    AlertCircle,
    Stethoscope
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usePatients } from '../hooks/usePatients';
import { useProfessionals } from '../hooks/useProfessionals';
import { useSpecialties } from '../hooks/useSpecialties';
import { useSites } from '../hooks/useSites';
import { useCreateAppointment } from '../hooks/useAppointments';
import { AppointmentType } from '../api/appointments.api';
import { Patient } from '../api/patients.api';
import { format } from 'date-fns';

const appointmentSchema = z.object({
    specialtyId: z.string().min(1, "Debe seleccionar una especialidad"),
    patientId: z.string().min(1, "Debe seleccionar un paciente"),
    professionalId: z.string().min(1, "Debe seleccionar un profesional"),
    siteId: z.string().min(1, "Debe seleccionar una sede"),
    date: z.string().min(1, "Debe seleccionar una fecha"),
    time: z.string().min(1, "Debe seleccionar una hora"),
    duration: z.coerce.number().default(45),
    notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: AppointmentType;
}

export default function AppointmentModal({ isOpen, onClose, type }: AppointmentModalProps) {
    const { selectedSiteId } = useAuthStore();
    const { data: patientsRes } = usePatients({ limit: 100 });
    const { data: professionals = [] } = useProfessionals();
    const { data: specialties = [] } = useSpecialties();
    const { data: sites = [] } = useSites();
    const { mutate: createAppointment, isPending, error: serverError } = useCreateAppointment();

    const patients = (patientsRes as any)?.data || [];

    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<AppointmentForm>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            specialtyId: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            duration: 45,
            siteId: selectedSiteId || ''
        }
    });

    const selectedSpecialtyId = useWatch({ control, name: 'specialtyId' });

    const filteredProfessionals = useMemo(() => {
        if (!selectedSpecialtyId) return [];
        return professionals.filter(p => p.specialtyId === selectedSpecialtyId);
    }, [professionals, selectedSpecialtyId]);

    // Reset professionalId when specialty changes
    useEffect(() => {
        setValue('professionalId', '');
    }, [selectedSpecialtyId, setValue]);

    // Reset form when modal opens or selectedSiteId changes
    useEffect(() => {
        if (isOpen) {
            reset({
                specialtyId: '',
                patientId: '',
                professionalId: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                time: '',
                duration: 45,
                siteId: selectedSiteId || '',
                notes: ''
            });
        }
    }, [isOpen, selectedSiteId, reset]);

    const onSubmit = (data: AppointmentForm) => {
        const startTime = new Date(`${data.date}T${data.time}`);
        const endTime = new Date(startTime.getTime() + data.duration * 60000);

        createAppointment({
            patientId: data.patientId,
            professionalId: data.professionalId,
            siteId: data.siteId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type,
            notes: data.notes
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            Nueva {type === AppointmentType.REGULAR ? 'Cita' : 'Evaluación'}
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                            Complete los detalles del turno
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Paciente */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <User size={14} className="text-indigo-500" /> Paciente
                            </label>
                            <select
                                {...register('patientId')}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                            >
                                <option value="">Seleccionar paciente...</option>
                                {patients.map((p: Patient) => (
                                    <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} (DNI: {p.dni})</option>
                                ))}
                            </select>
                            {errors.patientId && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.patientId.message}</span>}
                        </div>

                        {/* Especialidad */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <Stethoscope size={14} className="text-indigo-500" /> Especialidad
                            </label>
                            <select
                                {...register('specialtyId')}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                            >
                                <option value="">Seleccionar especialidad...</option>
                                {specialties.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.specialtyId && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.specialtyId.message}</span>}
                        </div>

                        {/* Profesional (filtrado por especialidad) */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <User size={14} className="text-indigo-500" /> Profesional
                            </label>
                            <select
                                {...register('professionalId')}
                                disabled={!selectedSpecialtyId}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {!selectedSpecialtyId ? 'Primero seleccione especialidad...' : 'Seleccionar profesional...'}
                                </option>
                                {filteredProfessionals.map(p => (
                                    <option key={p.id} value={p.id}>{p.tenantUser.user.fullName}</option>
                                ))}
                            </select>
                            {selectedSpecialtyId && filteredProfessionals.length === 0 && (
                                <span className="text-amber-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">No hay profesionales para esta especialidad</span>
                            )}
                            {errors.professionalId && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.professionalId.message}</span>}
                        </div>

                        {/* Sede */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <Building2 size={14} className="text-indigo-500" /> Sede / Lugar
                            </label>
                            <select
                                {...register('siteId')}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                            >
                                <option value="">Seleccionar sede...</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.siteId && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.siteId.message}</span>}
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <Calendar size={14} className="text-indigo-500" /> Fecha del Turno
                            </label>
                            <input
                                type="date"
                                {...register('date')}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                            />
                            {errors.date && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.date.message}</span>}
                        </div>

                        {/* Hora y Duración */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    <Clock size={14} className="text-indigo-500" /> Hora
                                </label>
                                <select
                                    {...register('time')}
                                    className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                                >
                                    <option value="">Hora...</option>
                                    {Array.from({ length: 24 * 4 }).map((_, i) => {
                                        const h = Math.floor(i / 4).toString().padStart(2, '0');
                                        const m = ((i % 4) * 15).toString().padStart(2, '0');
                                        const time = `${h}:${m}`;
                                        return <option key={time} value={time}>{time}</option>;
                                    })}
                                </select>
                                {errors.time && <span className="text-rose-500 text-[10px] font-bold mt-2 block ml-1 uppercase tracking-wider">{errors.time.message}</span>}
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    <Clock size={14} className="text-indigo-500" /> Duración
                                </label>
                                <div className="input-premium bg-slate-100 border-slate-200 text-slate-500 font-bold cursor-not-allowed flex items-center">
                                    45 min
                                </div>
                                <input type="hidden" {...register('duration')} value="45" />
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <FileText size={14} className="text-indigo-500" /> Notas / Observaciones
                            </label>
                            <textarea
                                {...register('notes')}
                                placeholder="Agregar información adicional..."
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all min-h-[100px] py-4 resize-none"
                            />
                        </div>
                    </div>

                    {/* Server Error Display */}
                    {serverError && (
                        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Error de Servidor</p>
                                <p className="text-sm text-rose-600 font-medium leading-relaxed">
                                    {(serverError as any)?.response?.data?.message || (serverError as any).message || 'Ocurrió un error inesperado al agendar el turno.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-[2] btn-primary py-4 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>AGENDANDO...</span>
                                </>
                            ) : (
                                <span>AGENDAR TURNO</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
