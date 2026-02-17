import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    X,
    User,
    Calendar,
    Clock,
    Building2,
    FileText,
    Edit3,
    Trash2,
    Save,
    Loader2,
    AlertCircle,
    Phone,
    Stethoscope,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Appointment, AppointmentType, AppointmentStatus } from '../api/appointments.api';
import { useUpdateAppointment } from '../hooks/useAppointments';
import { useAuthStore } from '../stores/auth.store';

interface AppointmentDetailSidebarProps {
    appointment: Appointment | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.RESERVED]: 'Reservado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.ATTENDED]: 'Asistió',
    [AppointmentStatus.ABSENT]: 'Ausente',
    [AppointmentStatus.CANCELLED]: 'Cancelado',
};

const statusColors: Record<AppointmentStatus, string> = {
    [AppointmentStatus.RESERVED]: 'bg-blue-100 text-blue-700',
    [AppointmentStatus.CONFIRMED]: 'bg-emerald-100 text-emerald-700',
    [AppointmentStatus.ATTENDED]: 'bg-green-100 text-green-700',
    [AppointmentStatus.ABSENT]: 'bg-rose-100 text-rose-700',
    [AppointmentStatus.CANCELLED]: 'bg-slate-100 text-slate-500',
};

export default function AppointmentDetailSidebar({ appointment, isOpen, onClose }: AppointmentDetailSidebarProps) {
    const { role, tenant, availableTenants } = useAuthStore();
    const effectiveRole = role || availableTenants.find(t => t.id === tenant?.id)?.role || null;
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        status: AppointmentStatus.CONFIRMED as AppointmentStatus,
        notes: '',
        date: '',
        time: '',
    });
    const [showConfirmRelease, setShowConfirmRelease] = useState(false);

    const { mutate: updateAppointment, isPending, error: serverError, reset: resetMutation } = useUpdateAppointment();

    const canRelease = effectiveRole === 'ADMIN' || effectiveRole === 'COORDINATOR';

    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
            setShowConfirmRelease(false);
            resetMutation();
        }
    }, [isOpen, resetMutation]);

    const startEdit = () => {
        if (!appointment) return;
        const start = parseISO(appointment.startTime);
        setEditData({
            status: appointment.status,
            notes: appointment.notes || '',
            date: format(start, 'yyyy-MM-dd'),
            time: format(start, 'HH:mm'),
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        resetMutation();
    };

    const saveEdit = () => {
        if (!appointment) return;

        const startTime = new Date(`${editData.date}T${editData.time}`);
        const originalStart = parseISO(appointment.startTime);
        const originalEnd = parseISO(appointment.endTime);
        const duration = originalEnd.getTime() - originalStart.getTime();
        const endTime = new Date(startTime.getTime() + duration);

        updateAppointment({
            id: appointment.id,
            data: {
                status: editData.status,
                notes: editData.notes,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            }
        }, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const handleRelease = () => {
        if (!appointment) return;
        updateAppointment({
            id: appointment.id,
            data: { status: AppointmentStatus.CANCELLED }
        }, {
            onSuccess: () => {
                setShowConfirmRelease(false);
                onClose();
            }
        });
    };

    const handleClose = () => {
        setIsEditing(false);
        setShowConfirmRelease(false);
        resetMutation();
        onClose();
    };

    if (!appointment) return null;

    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);
    const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[90] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={handleClose}
            />

            {/* Sidebar */}
            <div className={cn(
                "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className={cn(
                    "p-6 border-b border-slate-100 flex items-center justify-between shrink-0",
                    appointment.type === AppointmentType.REGULAR ? "bg-indigo-50/50" : "bg-amber-50/50"
                )}>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">
                            Detalles del Turno
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                appointment.type === AppointmentType.REGULAR
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-amber-100 text-amber-700"
                            )}>
                                {appointment.type === AppointmentType.REGULAR ? 'Cita' : 'Evaluación'}
                            </div>
                            <span className={cn(
                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                statusColors[appointment.status]
                            )}>
                                {statusLabels[appointment.status]}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {/* Patient */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</span>
                        </div>
                        <p className="text-base font-bold text-slate-800">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        {appointment.patient?.phone && (
                            <div className="flex items-center gap-2 mt-1.5">
                                <Phone size={12} className="text-slate-400" />
                                <span className="text-sm text-slate-500">{appointment.patient.phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Professional */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Stethoscope size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profesional</span>
                        </div>
                        <p className="text-base font-bold text-slate-800">
                            {appointment.professional?.tenantUser?.user?.fullName}
                        </p>
                        {appointment.professional?.specialty && (
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                                {appointment.professional.specialty.name}
                            </p>
                        )}
                    </div>

                    {/* Site */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</span>
                        </div>
                        <p className="text-base font-bold text-slate-800">
                            {appointment.site?.name || 'Sin sede'}
                        </p>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</span>
                        </div>
                        {isEditing ? (
                            <div className="space-y-3">
                                <input
                                    type="date"
                                    value={editData.date}
                                    onChange={e => setEditData(prev => ({ ...prev, date: e.target.value }))}
                                    className="input-premium text-sm bg-white"
                                />
                                <select
                                    value={editData.time}
                                    onChange={e => setEditData(prev => ({ ...prev, time: e.target.value }))}
                                    className="input-premium text-sm bg-white"
                                >
                                    {Array.from({ length: 24 * 4 }).map((_, i) => {
                                        const h = Math.floor(i / 4).toString().padStart(2, '0');
                                        const m = ((i % 4) * 15).toString().padStart(2, '0');
                                        const t = `${h}:${m}`;
                                        return <option key={t} value={t}>{t}</option>;
                                    })}
                                </select>
                            </div>
                        ) : (
                            <>
                                <p className="text-base font-bold text-slate-800 capitalize">
                                    {format(start, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-sm text-slate-500 font-semibold">
                                        {format(start, 'HH:mm')} - {format(end, 'HH:mm')} ({durationMin} min)
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Status (edit mode) */}
                    {isEditing && (
                        <div className="bg-slate-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={14} className="text-indigo-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                            </div>
                            <select
                                value={editData.status}
                                onChange={e => setEditData(prev => ({ ...prev, status: e.target.value as AppointmentStatus }))}
                                className="input-premium text-sm bg-white"
                            >
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                value={editData.notes}
                                onChange={e => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Agregar notas..."
                                className="input-premium text-sm bg-white min-h-[80px] resize-none"
                            />
                        ) : (
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {appointment.notes || 'Sin notas'}
                            </p>
                        )}
                    </div>

                    {/* Server Error */}
                    {serverError && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Error</p>
                                <p className="text-sm text-rose-600 font-medium">
                                    {(serverError as any)?.response?.data?.message || 'Ocurrió un error inesperado.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirm Release Dialog */}
                    {showConfirmRelease && (
                        <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-sm font-bold text-rose-800 mb-1">¿Liberar este turno?</p>
                            <p className="text-xs text-rose-600 mb-4">
                                Esta acción cancelará el turno y liberará el horario. No se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmRelease(false)}
                                    className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition-all"
                                >
                                    No, volver
                                </button>
                                <button
                                    onClick={handleRelease}
                                    disabled={isPending}
                                    className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Sí, liberar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 space-y-3 shrink-0 bg-white">
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={cancelEdit}
                                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={isPending}
                                className="flex-[2] btn-primary py-3 flex items-center justify-center gap-2"
                            >
                                {isPending ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Guardar Cambios
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={startEdit}
                                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                            >
                                <Edit3 size={16} />
                                Editar Turno
                            </button>

                            {canRelease && (
                                <button
                                    onClick={() => setShowConfirmRelease(true)}
                                    className="w-full py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 border-2 border-rose-200 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Liberar Turno
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
