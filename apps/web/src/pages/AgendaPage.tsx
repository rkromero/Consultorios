import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    MoreVertical,
    User
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AgendaPage() {
    const [currentDate] = useState(new Date());
    const [activeDay, setActiveDay] = useState(new Date());

    // Mock data for the "Boxes" as seen in reference
    const boxes = [
        { id: 'pb1', label: 'PB-1', professional: 'Mateo Vallejos' },
        { id: 'pb2', label: 'PB-2', professional: 'Mariana Moreno' },
        { id: 'pb3', label: 'PB-3', professional: 'Alejandra Collado' },
        { id: 'pa1', label: 'PA-1', professional: 'Sofia Lopez' },
        { id: 'pa2', label: 'PA-2', professional: 'Marianela Cuenca' },
        { id: 'pa3', label: 'PA-3', professional: 'Luciana Karra' },
        { id: 'pa4', label: 'PA-4', professional: 'Jorgelina Seppaqu...' },
        { id: 'pa5', label: 'PA-5', professional: 'Sandra Flores' },
    ];

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

    const timeSlots = [
        '09:00', '09:15', '09:30', '09:45',
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
        '12:00'
    ];

    // Status chips from reference
    const statuses = [
        { label: '1º Turno', color: 'bg-indigo-600' },
        { label: '2º Turno', color: 'bg-indigo-400' },
        { label: 'Evaluación', color: 'bg-amber-500' },
        { label: 'En Sala', color: 'bg-emerald-500' },
    ];

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
                        <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg text-sm font-semibold text-slate-600 min-w-[120px] text-center">
                            16/2 - 20/2
                        </div>
                        <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Status Legend */}
                    <div className="hidden xl:flex items-center gap-4">
                        {statuses.map(s => (
                            <div key={s.label} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <div className={cn("w-2 h-2 rounded-full", s.color)} />
                                {s.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="btn-primary py-2 px-5">
                            <Plus size={18} />
                            Nueva Cita
                        </button>
                        <button className="btn-warning py-2 px-5 font-bold">
                            <Plus size={18} />
                            Nueva Evaluación
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 card-premium p-0 flex flex-col overflow-hidden">
                {/* Days Tabs */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-slate-100">
                    <div className="border-r border-slate-100 bg-slate-50/50" />
                    {weekDays.map(day => (
                        <button
                            key={day.toISOString()}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "py-4 text-sm font-bold transition-all border-b-2",
                                isSameDay(day, activeDay)
                                    ? "text-emerald-600 border-emerald-500 bg-emerald-50/20"
                                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50"
                            )}
                        >
                            {format(day, 'EEEE', { locale: es }).charAt(0).toUpperCase() + format(day, 'EEEE', { locale: es }).slice(1)}
                        </button>
                    ))}
                </div>

                {/* Grid Header (Boxes) */}
                <div className="grid grid-cols-[80px_repeat(8,1fr)] bg-white border-b border-slate-100 sticky top-0 z-10">
                    <div className="h-16 border-r border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {format(activeDay, 'd/M')}
                    </div>
                    {boxes.map(box => (
                        <div key={box.id} className="p-2 border-r border-slate-100 flex flex-col items-center justify-center text-center">
                            <span className="font-bold text-slate-800 text-sm">{box.label}</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                <User size={10} /> {box.professional.split(' ')[1]}
                            </span>
                            <button className="mt-1 text-[9px] font-bold text-slate-300 hover:text-indigo-400 flex items-center gap-0.5">
                                <Plus size={10} /> AGREGAR
                            </button>
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-[80px_repeat(8,1fr)]">
                        {timeSlots.map(time => (
                            <>
                                {/* Time Cell */}
                                <div key={`time-${time}`} className="h-20 border-r border-b border-slate-100 flex items-start justify-center pt-2">
                                    <span className="text-[11px] font-bold text-slate-400 tracking-tighter">{time}</span>
                                </div>

                                {/* Box Cells */}
                                {boxes.map(box => {
                                    // Mock appointment logic
                                    const hasEvent = (box.id === 'pb2' && time === '09:15') ||
                                        (box.id === 'pb3' && time === '09:15') ||
                                        (box.id === 'pb2' && time === '10:00') ||
                                        (box.id === 'pb2' && time === '10:45');

                                    const eventHeight = (box.id === 'pb2' && time === '09:15') ? 'h-[155px]' : 'h-[75px]';

                                    return (
                                        <div key={`${box.id}-${time}`} className="relative h-20 border-r border-b border-slate-100 p-1 group hover:bg-slate-50/50 transition-colors">
                                            {hasEvent && (
                                                <div className={cn(
                                                    "absolute inset-x-1 top-1 z-20 bg-lavender-50 border-l-[3px] border-lavender-600 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer",
                                                    eventHeight
                                                )}>
                                                    <div className="flex flex-col h-full">
                                                        <span className="text-[11px] font-bold text-indigo-900 leading-tight">MELINA BENITEZ</span>
                                                        <span className="text-[10px] text-slate-500 font-medium leading-tight">Fonoaudiología</span>
                                                        <div className="mt-auto flex items-center justify-between text-[8px] font-bold text-slate-300">
                                                            <span>T1</span>
                                                            <MoreVertical size={10} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

