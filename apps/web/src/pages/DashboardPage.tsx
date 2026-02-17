import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, addHours, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    Clock,
    Users,
    UserCheck,
    UserX,
    AlertCircle,
    Plus,
    ChevronRight,
    Stethoscope,
    Building2,
    Activity,
    CheckCircle2,
    XCircle,
    Timer
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppointments, useUpdateAppointment } from '../hooks/useAppointments';
import { useAuthStore } from '../stores/auth.store';
import { AppointmentStatus, AppointmentType, Appointment } from '../api/appointments.api';

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
    [AppointmentStatus.RESERVED]: { label: 'Reservado', color: 'text-blue-700', bg: 'bg-blue-100' },
    [AppointmentStatus.CONFIRMED]: { label: 'Confirmado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    [AppointmentStatus.ATTENDED]: { label: 'Asistió', color: 'text-green-700', bg: 'bg-green-100' },
    [AppointmentStatus.ABSENT]: { label: 'Ausente', color: 'text-rose-700', bg: 'bg-rose-100' },
    [AppointmentStatus.CANCELLED]: { label: 'Cancelado', color: 'text-slate-500', bg: 'bg-slate-100' },
};

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { mutate: updateAppointment, isPending } = useUpdateAppointment();

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const { data: todayAppointments = [], isLoading } = useAppointments({
        start: todayStart.toISOString(),
        end: todayEnd.toISOString(),
    });

    const activeAppointments = useMemo(() =>
        todayAppointments
            .filter(a => a.status !== AppointmentStatus.CANCELLED)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
        [todayAppointments]
    );

    const upcomingAppointments = useMemo(() => {
        const twoHoursLater = addHours(now, 2);
        return activeAppointments.filter(a => {
            const start = parseISO(a.startTime);
            return (isAfter(start, now) || (isBefore(start, now) && isAfter(parseISO(a.endTime), now)))
                && isBefore(start, twoHoursLater);
        });
    }, [activeAppointments, now]);

    const kpis = useMemo(() => {
        const total = activeAppointments.length;
        const confirmed = activeAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length;
        const attended = activeAppointments.filter(a => a.status === AppointmentStatus.ATTENDED).length;
        const absent = activeAppointments.filter(a => a.status === AppointmentStatus.ABSENT).length;
        const pending = activeAppointments.filter(a => a.status === AppointmentStatus.RESERVED).length;
        const done = attended + absent;
        const remaining = total - done;
        return { total, confirmed, attended, absent, pending, remaining };
    }, [activeAppointments]);

    const handleQuickStatus = (id: string, status: AppointmentStatus) => {
        updateAppointment({ id, data: { status } });
    };

    const greeting = () => {
        const hour = now.getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        {greeting()}, {user?.fullName.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">
                        {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })} — {format(now, 'HH:mm')}hs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/agenda')}
                        className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Calendar size={16} />
                        Ver Agenda
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/agenda')}
                        className="btn-primary py-2.5 px-5 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Nuevo Turno
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                <KpiCard icon={<Calendar size={18} />} label="Turnos Hoy" value={kpis.total} color="indigo" />
                <KpiCard icon={<Timer size={18} />} label="Pendientes" value={kpis.remaining} color="amber" />
                <KpiCard icon={<CheckCircle2 size={18} />} label="Confirmados" value={kpis.confirmed} color="emerald" />
                <KpiCard icon={<UserCheck size={18} />} label="Asistieron" value={kpis.attended} color="green" />
                <KpiCard icon={<UserX size={18} />} label="Ausentes" value={kpis.absent} color="rose" />
                <KpiCard icon={<AlertCircle size={18} />} label="Sin Confirmar" value={kpis.pending} color="blue" />
            </div>

            {/* Próximas 2 Horas */}
            <div className="card-premium p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Clock size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Próximas 2 Horas</h2>
                            <p className="text-[11px] text-slate-400 font-medium">{upcomingAppointments.length} turnos</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-4">
                                <div className="w-16 h-10 bg-slate-100 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                                    <div className="h-3 bg-slate-50 rounded w-1/4" />
                                </div>
                                <div className="w-20 h-6 bg-slate-100 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : upcomingAppointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Clock size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-400">No hay turnos en las próximas 2 horas</p>
                        <p className="text-xs text-slate-300 mt-1">Los turnos aparecerán aquí cuando se acerque la hora</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {upcomingAppointments.map(app => (
                            <AppointmentRow
                                key={app.id}
                                appointment={app}
                                onStatusChange={handleQuickStatus}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Agenda Completa del Día */}
            <div className="card-premium p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Activity size={18} className="text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Agenda del Día</h2>
                            <p className="text-[11px] text-slate-400 font-medium">{activeAppointments.length} turnos totales</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/agenda')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                        Ver agenda completa <ChevronRight size={14} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse flex items-center gap-4">
                                <div className="w-14 h-8 bg-slate-100 rounded" />
                                <div className="flex-1 h-4 bg-slate-100 rounded w-1/3" />
                                <div className="w-20 h-4 bg-slate-50 rounded" />
                            </div>
                        ))}
                    </div>
                ) : activeAppointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-400">No hay turnos para hoy</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profesional</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {activeAppointments.map(app => {
                                    const startDate = parseISO(app.startTime);
                                    const endDate = parseISO(app.endTime);
                                    const isPast = isBefore(endDate, now);
                                    const isCurrent = isBefore(startDate, now) && isAfter(endDate, now);
                                    const sc = statusConfig[app.status];

                                    return (
                                        <tr key={app.id} className={cn(
                                            "transition-colors hover:bg-slate-50/80",
                                            isPast && app.status !== AppointmentStatus.ATTENDED && app.status !== AppointmentStatus.ABSENT && "opacity-50",
                                            isCurrent && "bg-indigo-50/30"
                                        )}>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                                    <span className="text-sm font-bold text-slate-700 tabular-nums">
                                                        {format(startDate, 'HH:mm')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">- {format(endDate, 'HH:mm')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {app.patient?.firstName} {app.patient?.lastName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-slate-600">{app.professional?.tenantUser?.user?.fullName}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-slate-500">{app.site?.name}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                                    app.type === AppointmentType.REGULAR ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {app.type === AppointmentType.REGULAR ? 'Cita' : 'Eval'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold", sc.bg, sc.color)}>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(app.status === AppointmentStatus.RESERVED || app.status === AppointmentStatus.CONFIRMED) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleQuickStatus(app.id, AppointmentStatus.ATTENDED)}
                                                                disabled={isPending}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Marcar Asistió"
                                                            >
                                                                <UserCheck size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuickStatus(app.id, AppointmentStatus.ABSENT)}
                                                                disabled={isPending}
                                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Marcar Ausente"
                                                            >
                                                                <UserX size={15} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {app.status === AppointmentStatus.RESERVED && (
                                                        <button
                                                            onClick={() => handleQuickStatus(app.id, AppointmentStatus.CONFIRMED)}
                                                            disabled={isPending}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Confirmar"
                                                        >
                                                            <CheckCircle2 size={15} />
                                                        </button>
                                                    )}
                                                    {(app.status === AppointmentStatus.ATTENDED || app.status === AppointmentStatus.ABSENT) && (
                                                        <span className="text-[10px] text-slate-400 italic font-medium">
                                                            {app.status === AppointmentStatus.ATTENDED ? 'Atendido' : 'No asistió'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function AppointmentRow({ appointment, onStatusChange, isPending }: {
    appointment: Appointment;
    onStatusChange: (id: string, status: AppointmentStatus) => void;
    isPending: boolean;
}) {
    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);
    const now = new Date();
    const isCurrent = isBefore(start, now) && isAfter(end, now);
    const sc = statusConfig[appointment.status];

    return (
        <div className={cn(
            "px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors",
            isCurrent && "bg-indigo-50/40 border-l-4 border-indigo-500"
        )}>
            {/* Time */}
            <div className="shrink-0 w-16 text-center">
                <div className="text-lg font-black text-slate-800 tabular-nums leading-none">
                    {format(start, 'HH:mm')}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {format(end, 'HH:mm')}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 truncate">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </span>
                    {appointment.patient?.phone && (
                        <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                            {appointment.patient.phone}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Stethoscope size={11} className="text-slate-300" />
                        {appointment.professional?.tenantUser?.user?.fullName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Building2 size={11} className="text-slate-300" />
                        {appointment.site?.name}
                    </span>
                </div>
            </div>

            {/* Status Badge */}
            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0", sc.bg, sc.color)}>
                {sc.label}
            </span>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {appointment.status === AppointmentStatus.RESERVED && (
                    <button
                        onClick={() => onStatusChange(appointment.id, AppointmentStatus.CONFIRMED)}
                        disabled={isPending}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Confirmar"
                    >
                        <CheckCircle2 size={16} />
                    </button>
                )}
                {(appointment.status === AppointmentStatus.RESERVED || appointment.status === AppointmentStatus.CONFIRMED) && (
                    <>
                        <button
                            onClick={() => onStatusChange(appointment.id, AppointmentStatus.ATTENDED)}
                            disabled={isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Asistió"
                        >
                            <UserCheck size={16} />
                        </button>
                        <button
                            onClick={() => onStatusChange(appointment.id, AppointmentStatus.ABSENT)}
                            disabled={isPending}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Ausente"
                        >
                            <UserX size={16} />
                        </button>
                    </>
                )}
                {(appointment.status === AppointmentStatus.ATTENDED || appointment.status === AppointmentStatus.ABSENT) && (
                    <span className={cn("text-[10px] font-bold italic px-2", sc.color)}>
                        {sc.label}
                    </span>
                )}
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
        indigo: { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-500' },
        amber: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', icon: 'text-amber-500' },
        emerald: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-500' },
        green: { bg: 'bg-green-50 border-green-100', text: 'text-green-600', icon: 'text-green-500' },
        rose: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600', icon: 'text-rose-500' },
        blue: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: 'text-blue-500' },
    };
    const c = colors[color] || colors.indigo;

    return (
        <div className={cn("p-4 rounded-2xl border", c.bg)}>
            <div className={cn("mb-2", c.icon)}>{icon}</div>
            <div className={cn("text-2xl font-black", c.text)}>{value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>
        </div>
    );
}
