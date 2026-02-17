import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, User, Building2, FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usePatients } from '../hooks/usePatients';
import { useProfessionals } from '../hooks/useProfessionals';
import { useSites } from '../hooks/useSites';
import { useCreateAppointment } from '../hooks/useAppointments';
import { AppointmentType } from '../api/appointments.api';
import { Patient } from '../api/patients.api';
import { format } from 'date-fns';

const appointmentSchema = z.object({
    patientId: z.string().min(1, "Debe seleccionar un paciente"),
    professionalId: z.string().min(1, "Debe seleccionar un profesional"),
    siteId: z.string().min(1, "Debe seleccionar una sede"),
    date: z.string().min(1, "Debe seleccionar una fecha"),
    time: z.string().min(1, "Debe seleccionar una hora"),
    duration: z.coerce.number().min(15, "La duración mínima es 15 min").default(15),
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
    const { data: sites = [] } = useSites();
    const { mutate: createAppointment, isPending } = useCreateAppointment();

    const patients = (patientsRes as any)?.data || [];

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AppointmentForm>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            duration: 15,
            siteId: selectedSiteId || ''
        }
    });

    // Reset form when modal opens or selectedSiteId changes
    useEffect(() => {
        if (isOpen) {
            reset({
                date: format(new Date(), 'yyyy-MM-dd'),
                duration: 15,
                siteId: selectedSiteId || ''
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

                        {/* Profesional */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                <User size={14} className="text-indigo-500" /> Profesional
                            </label>
                            <select
                                {...register('professionalId')}
                                className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                            >
                                <option value="">Seleccionar profesional...</option>
                                {professionals.map(p => (
                                    <option key={p.id} value={p.id}>{p.tenantUser.user.fullName}</option>
                                ))}
                            </select>
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
                                <input
                                    type="time"
                                    {...register('time')}
                                    className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                    <Clock size={14} className="text-indigo-500" /> Duración (min)
                                </label>
                                <select
                                    {...register('duration')}
                                    className="input-premium bg-slate-50 border-slate-100 hover:border-indigo-200 focus:bg-white transition-all"
                                >
                                    <option value="15">15 min</option>
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                    <option value="60">60 min</option>
                                </select>
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
