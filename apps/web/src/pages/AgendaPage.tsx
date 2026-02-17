import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    MoreVertical,
    Clock,
    List,
    LayoutGrid,
    Stethoscope,
    Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppointments } from '../hooks/useAppointments';
import { useAuthStore } from '../stores/auth.store';
import { useProfessionals } from '../hooks/useProfessionals';
import { AppointmentStatus, AppointmentType } from '../api/appointments.api';
import { User as UserIcon } from 'lucide-react';

import AppointmentModal from '../components/AppointmentModal';
import AppointmentDetailSidebar from '../components/AppointmentDetailSidebar';

export default function AgendaPage() {
    const { selectedSiteId, role, availableTenants, tenant } = useAuthStore();
    const effectiveRole = role || availableTenants.find(t => t.id === tenant?.id)?.role || null;
    const isProfessional = effectiveRole === 'PROFESSIONAL';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<AppointmentType>(AppointmentType.REGULAR);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    const { data: professionals = [] } = useProfessionals();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 4); // Mon to Fri
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

    const { data: appointments = [], isLoading } = useAppointments({
        start: weekStart.toISOString(),
        end: addDays(weekEnd, 1).toISOString(),
        // siteId: selectedSiteId || undefined // REMOVED: Load all sites to show overlaps
    });

    const timeSlots = [
        '09:00', '09:15', '09:30', '09:45',
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
        '12:00', '12:15', '12:30', '12:45',
        '13:00', '13:15', '13:30', '13:45',
        '14:00', '14:15', '14:30', '14:45',
        '15:00', '15:15', '15:30', '15:45',
        '16:00', '16:15', '16:30', '16:45',
        '17:00'
    ];

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    const openModal = (type: AppointmentType) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    // Group appointments by day and time for easier rendering (exclude cancelled)
    const appointmentsByDay = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        const active = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);
        const filtered = selectedProfessionalId === 'all'
            ? active
            : active.filter(a => a.professionalId === selectedProfessionalId);

        filtered.forEach(app => {
            const dayKey = format(parseISO(app.startTime), 'yyyy-MM-dd');
            if (!grouped[dayKey]) grouped[dayKey] = [];
            grouped[dayKey].push(app);
        });
        return grouped;
    }, [appointments, selectedProfessionalId]);

    const sortedAppointments = useMemo(() => {
        const active = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);
        const filtered = selectedProfessionalId === 'all'
            ? active
            : active.filter(a => a.professionalId === selectedProfessionalId);

        return [...filtered]
            .filter(a => {
                const appDate = parseISO(a.startTime);
                return weekDays.some(day => isSameDay(appDate, day));
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [appointments, selectedProfessionalId, weekDays]);

    const selectedAppointment = useMemo(() => {
        if (!selectedAppointmentId) return null;
        return appointments.find(a => a.id === selectedAppointmentId) || null;
    }, [selectedAppointmentId, appointments]);

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header Section */}
            <div className="card-premium p-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-800">
                        <CalendarIcon className="w-6 h-6 text-indigo-600" />
                        <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevWeek}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-xl text-sm font-bold text-slate-700 min-w-[140px] text-center shadow-sm">
                            {format(weekStart, "d/M")} - {format(weekEnd, "d/M")}
                        </div>
                        <button
                            onClick={nextWeek}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {!isProfessional && (
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <UserIcon size={14} className="ml-2 text-slate-400" />
                            <select
                                value={selectedProfessionalId}
                                onChange={(e) => setSelectedProfessionalId(e.target.value)}
                                className="bg-transparent text-[11px] font-bold text-slate-600 uppercase tracking-tight focus:outline-none min-w-[150px] cursor-pointer"
                            >
                                <option value="all">Todos los Profesionales</option>
                                {professionals.map(p => (
                                    <option key={p.id} value={p.id}>{p.tenantUser?.user?.fullName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'calendar'
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Vista Calendario"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list'
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                            title="Vista Listado"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <div className="hidden xl:flex items-center gap-6 mr-2 py-2 px-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
                            Cita
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                            Evaluación
                        </div>
                    </div>

                    {!isProfessional && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openModal(AppointmentType.REGULAR)}
                                className="btn-primary py-2.5 px-6 shadow-lg shadow-indigo-100 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span>Nueva Cita</span>
                            </button>
                            <button
                                onClick={() => openModal(AppointmentType.EVALUATION)}
                                className="bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-6 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                <span>Nueva Evaluación</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'calendar' ? (
                <div className="flex-1 card-premium p-0 flex flex-col overflow-hidden bg-white">
                    {/* Days Header */}
                    <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50/50 border-b border-slate-100 sticky top-0 z-30">
                        <div className="h-16 border-r border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Clock size={14} className="mr-1" /> Hora
                        </div>
                        {weekDays.map(day => (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "flex flex-col items-center justify-center h-16 border-r border-slate-100 last:border-r-0 transition-colors",
                                    isSameDay(day, new Date()) ? "bg-emerald-50/50" : ""
                                )}
                            >
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {format(day, 'EEEE', { locale: es })}
                                </span>
                                <span className={cn(
                                    "text-lg font-black tracking-tight",
                                    isSameDay(day, new Date()) ? "text-emerald-600" : "text-slate-700"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Cargando Agenda...</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-[80px_repeat(5,1fr)] min-h-full">
                            {timeSlots.map(time => (
                                <div key={`row-${time}`} className="contents">
                                    {/* Time Cell */}
                                    <div className="h-20 border-r border-b border-slate-100 flex items-start justify-center pt-3 bg-slate-50/30 sticky left-0 z-20">
                                        <span className="text-xs font-bold text-slate-400 tabular-nums">{time}</span>
                                    </div>

                                    {/* Day Cells */}
                                    {weekDays.map(day => {
                                        const dayKey = format(day, 'yyyy-MM-dd');
                                        const dayApps = appointmentsByDay[dayKey] || [];
                                        const timeApps = dayApps.filter(app => {
                                            const appDate = parseISO(app.startTime);
                                            const appMinutes = appDate.getHours() * 60 + appDate.getMinutes();
                                            const [slotH, slotM] = time.split(':').map(Number);
                                            const slotMinutes = slotH * 60 + slotM;
                                            return appMinutes >= slotMinutes && appMinutes < slotMinutes + 15;
                                        });

                                        return (
                                            <div
                                                key={`${dayKey}-${time}`}
                                                className="h-20 border-r border-b border-slate-100 last:border-r-0 p-1 group hover:bg-slate-50/50 transition-colors relative"
                                            >
                                                {timeApps.map((app, index) => {
                                                    const appStartDate = parseISO(app.startTime);
                                                    const appEndDate = parseISO(app.endTime);
                                                    const durationMin = Math.max(15, (appEndDate.getTime() - appStartDate.getTime()) / 60000);
                                                    const heightPx = (durationMin / 15) * 80 - 8;

                                                    const total = timeApps.length;
                                                    const widthPercent = 100 / total;
                                                    const leftPercent = index * widthPercent;

                                                    const minutesOffset = appStartDate.getMinutes() % 15;
                                                    const topOffsetPx = (minutesOffset / 15) * 80 + 4;

                                                    return (
                                                        <div
                                                            key={app.id}
                                                            onClick={() => setSelectedAppointmentId(app.id)}
                                                            className={cn(
                                                                "absolute z-40 rounded-xl p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4",
                                                                app.siteId !== selectedSiteId && selectedSiteId
                                                                    ? "bg-slate-50 border-slate-300 opacity-60 grayscale-[0.5]"
                                                                    : app.type === AppointmentType.REGULAR
                                                                        ? "bg-indigo-50 border-indigo-600 group-hover:bg-indigo-100"
                                                                        : "bg-amber-50 border-amber-500 group-hover:bg-amber-100"
                                                            )}
                                                            style={{
                                                                height: `${heightPx}px`,
                                                                width: total > 1 ? `calc(${widthPercent}% - 4px)` : 'calc(100% - 8px)',
                                                                left: total > 1 ? `calc(${leftPercent}% + 2px)` : '4px',
                                                                top: `${topOffsetPx}px`
                                                            }}
                                                        >
                                                            <div className="flex flex-col h-full overflow-hidden">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="text-[10px] font-black text-slate-800 leading-tight truncate uppercase">
                                                                        {app.patient?.firstName} {app.patient?.lastName}
                                                                    </span>
                                                                    {app.siteId !== selectedSiteId && selectedSiteId && (
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 px-1 rounded">
                                                                            {app.site?.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between mt-0.5">
                                                                    <span className="text-[9px] text-slate-500 font-bold leading-tight truncate">
                                                                        {app.professional?.tenantUser?.user?.fullName.split(' ')[0]}
                                                                    </span>
                                                                    <span className="text-[8px] text-slate-400 font-bold">
                                                                        {format(appStartDate, 'HH:mm')}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-auto flex items-center justify-between">
                                                                    <div className={cn(
                                                                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                                        app.siteId !== selectedSiteId && selectedSiteId
                                                                            ? "bg-slate-200 text-slate-600"
                                                                            : app.type === AppointmentType.REGULAR ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                                                                    )}>
                                                                        {app.siteId !== selectedSiteId && selectedSiteId ? 'En otra sede' : app.type === AppointmentType.REGULAR ? 'Cita' : 'Eval'}
                                                                    </div>
                                                                    <MoreVertical size={12} className="text-slate-300" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="flex-1 card-premium p-0 flex flex-col overflow-hidden bg-white">
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Cargando Agenda...</span>
                                </div>
                            </div>
                        )}

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profesional</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedAppointments.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-slate-400 text-sm">
                                            No hay turnos para esta semana.
                                        </td>
                                    </tr>
                                ) : sortedAppointments.map(app => {
                                    const startDate = parseISO(app.startTime);
                                    const endDate = parseISO(app.endTime);
                                    const isOtherSite = app.siteId !== selectedSiteId && !!selectedSiteId;

                                    return (
                                        <tr
                                            key={app.id}
                                            onClick={() => setSelectedAppointmentId(app.id)}
                                            className={cn(
                                                "hover:bg-slate-50 transition-colors cursor-pointer group",
                                                isOtherSite && "opacity-50"
                                            )}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon size={14} className={cn(
                                                        isSameDay(startDate, new Date()) ? "text-emerald-500" : "text-slate-300"
                                                    )} />
                                                    <div>
                                                        <span className={cn(
                                                            "text-sm font-bold capitalize",
                                                            isSameDay(startDate, new Date()) ? "text-emerald-600" : "text-slate-700"
                                                        )}>
                                                            {format(startDate, 'EEEE', { locale: es })}
                                                        </span>
                                                        <span className="text-xs text-slate-400 ml-1.5">
                                                            {format(startDate, 'd/M')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-slate-300" />
                                                    <span className="text-sm font-semibold text-slate-700 tabular-nums">
                                                        {format(startDate, 'HH:mm')}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        - {format(endDate, 'HH:mm')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-800">
                                                    {app.patient?.firstName} {app.patient?.lastName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope size={13} className="text-slate-300" />
                                                    <span className="text-sm text-slate-600">
                                                        {app.professional?.tenantUser?.user?.fullName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={13} className="text-slate-300" />
                                                    <span className="text-sm text-slate-600">
                                                        {app.site?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                    app.type === AppointmentType.REGULAR
                                                        ? "bg-indigo-100 text-indigo-700"
                                                        : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {app.type === AppointmentType.REGULAR ? 'Cita' : 'Evaluación'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                    app.status === AppointmentStatus.CONFIRMED ? "bg-emerald-100 text-emerald-700" :
                                                    app.status === AppointmentStatus.RESERVED ? "bg-blue-100 text-blue-700" :
                                                    app.status === AppointmentStatus.ATTENDED ? "bg-green-100 text-green-700" :
                                                    app.status === AppointmentStatus.ABSENT ? "bg-rose-100 text-rose-700" :
                                                    "bg-slate-100 text-slate-500"
                                                )}>
                                                    {app.status === AppointmentStatus.CONFIRMED ? 'Confirmado' :
                                                     app.status === AppointmentStatus.RESERVED ? 'Reservado' :
                                                     app.status === AppointmentStatus.ATTENDED ? 'Asistió' :
                                                     app.status === AppointmentStatus.ABSENT ? 'Ausente' : app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Appointment Modal */}
            {!isProfessional && (
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    type={modalType}
                />
            )}

            {/* Appointment Detail Sidebar */}
            <AppointmentDetailSidebar
                appointment={selectedAppointment}
                isOpen={!!selectedAppointmentId}
                onClose={() => setSelectedAppointmentId(null)}
            />
        </div >
    );
}
