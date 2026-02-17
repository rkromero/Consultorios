import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    MoreVertical,
    Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentType } from '../api/appointments.api';

import AppointmentModal from '../components/AppointmentModal';

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<AppointmentType>(AppointmentType.REGULAR);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 4); // Mon to Fri
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

    const { data: appointments = [], isLoading } = useAppointments({
        start: weekStart.toISOString(),
        end: addDays(weekEnd, 1).toISOString(), // Include all of Friday
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
    const goToToday = () => setCurrentDate(new Date());

    const openModal = (type: AppointmentType) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    // Group appointments by day and time for easier rendering
    const appointmentsByDay = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        appointments.forEach(app => {
            const dayKey = format(parseISO(app.startTime), 'yyyy-MM-dd');
            if (!grouped[dayKey]) grouped[dayKey] = [];
            grouped[dayKey].push(app);
        });
        return grouped;
    }, [appointments]);

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
                        <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-xl text-sm font-bold text-slate-700 min-w-[200px] text-center shadow-sm">
                            {format(weekStart, "d/M")} - {format(weekEnd, "d/M")}
                        </div>
                        <button
                            onClick={nextWeek}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            onClick={goToToday}
                            className="ml-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Hoy
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden xl:flex items-center gap-6 mr-6 py-2 px-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
                            Cita
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                            Evaluación
                        </div>
                    </div>

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
                </div>
            </div>

            {/* Main Content Area */}
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
                                    const timeApps = dayApps.filter(app => format(parseISO(app.startTime), 'HH:mm') === time);

                                    return (
                                        <div
                                            key={`${dayKey}-${time}`}
                                            className="h-20 border-r border-b border-slate-100 last:border-r-0 p-1 group hover:bg-slate-50/50 transition-colors relative"
                                        >
                                            {timeApps.map(app => (
                                                <div
                                                    key={app.id}
                                                    className={cn(
                                                        "absolute inset-x-1 top-1 z-10 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4",
                                                        app.type === AppointmentType.REGULAR
                                                            ? "bg-indigo-50 border-indigo-600 group-hover:bg-indigo-100"
                                                            : "bg-amber-50 border-amber-500 group-hover:bg-amber-100"
                                                    )}
                                                    style={{ height: 'calc(100% - 8px)' }}
                                                >
                                                    <div className="flex flex-col h-full overflow-hidden">
                                                        <span className="text-[10px] font-black text-slate-800 leading-tight truncate uppercase">
                                                            {app.patient?.firstName} {app.patient?.lastName}
                                                        </span>
                                                        <span className="text-[9px] text-slate-500 font-bold leading-tight truncate mt-0.5">
                                                            {app.professional?.tenantUser?.user?.fullName.split(' ')[0]}
                                                        </span>
                                                        <div className="mt-auto flex items-center justify-between">
                                                            <div className={cn(
                                                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                                app.type === AppointmentType.REGULAR ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                                                            )}>
                                                                {app.type === AppointmentType.REGULAR ? 'Cita' : 'Eval'}
                                                            </div>
                                                            <MoreVertical size={12} className="text-slate-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
            />
        </div>
    );
}
