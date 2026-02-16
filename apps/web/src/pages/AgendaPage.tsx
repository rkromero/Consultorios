import { useState } from 'react';
import { startOfWeek, endOfWeek, addDays, format, addMinutes, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { useProfessionals } from '../hooks/useProfessionals';
import { useSites } from '../hooks/useSites';
import { usePatients } from '../hooks/usePatients';
import { AppointmentType, AppointmentStatus } from '../api/appointments.api';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const appointmentSchema = z.object({
    patientId: z.string().min(1, "Paciente requerido"),
    professionalId: z.string().min(1, "Profesional requerido"),
    siteId: z.string().min(1, "Sede requerida"),
    date: z.string().min(1, "Fecha requerida"),
    time: z.string().min(1, "Hora requerida"),
    duration: z.string().min(1, "Duración requerida"), // minutes
    type: z.nativeEnum(AppointmentType),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProfessional, setSelectedProfessional] = useState<string>('');
    const [selectedSite, setSelectedSite] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null); // For details modal

    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Hooks
    const { data: professionals } = useProfessionals();
    const { data: sites } = useSites();
    const { data: patientsResponse } = usePatients({ limit: 100 });
    const { data: appointments } = useAppointments({
        start: start.toISOString(),
        end: end.toISOString(),
        professionalId: selectedProfessional,
        siteId: selectedSite
    });

    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();

    // Form
    const { register, handleSubmit, reset } = useForm<AppointmentForm>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            duration: '30',
            type: AppointmentType.IN_PERSON,
            siteId: selectedSite,
            professionalId: selectedProfessional
        }
    });

    const onSubmit = (data: AppointmentForm) => {
        const startTime = new Date(`${data.date}T${data.time}`);
        const endTime = addMinutes(startTime, parseInt(data.duration));

        createAppointment.mutate({
            ...data,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
            onError: (err: any) => {
                alert('Error: ' + (err.response?.data?.message || 'Unknown error'));
            }
        });
    };

    const handleCancel = (id: string) => {
        if (confirm('¿Estás seguro de cancelar este turno?')) {
            updateAppointment.mutate({ id, data: { status: AppointmentStatus.CANCELLED } }, {
                onSuccess: () => setSelectedAppointment(null)
            });
        }
    };

    // Calendar Logic
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    const timeSlots = Array.from({ length: 24 }).map((_, i) => i + 8).filter(h => h < 21); // 8:00 to 20:00

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Agenda
                    </h1>

                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 text-sm font-medium w-32 text-center">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                        Hoy
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="text-sm border rounded-md p-1.5 bg-gray-50"
                        value={selectedSite}
                        onChange={(e) => setSelectedSite(e.target.value)}
                    >
                        <option value="">Todas las Sedes</option>
                        {sites?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <select
                        className="text-sm border rounded-md p-1.5 bg-gray-50"
                        value={selectedProfessional}
                        onChange={(e) => setSelectedProfessional(e.target.value)}
                    >
                        <option value="">Todos los Profesionales</option>
                        {professionals?.map((p: any) => <option key={p.id} value={p.id}>{p.tenantUser?.user?.fullName}</option>)}
                    </select>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                    >
                        <Plus size={16} /> Nuevo Turno
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto bg-gray-50 relative">
                <div className="min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 border-b bg-white sticky top-0 z-10 shadow-sm">
                        <div className="w-16 p-2 text-center text-xs font-medium text-gray-400 border-r">Hora</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className={cn(
                                "p-2 text-center border-r font-medium",
                                isSameDay(day, new Date()) ? "bg-blue-50 text-blue-700" : "text-gray-700"
                            )}>
                                <div className="text-xs uppercase">{format(day, 'EEE', { locale: es })}</div>
                                <div className="text-lg">{format(day, 'd')}</div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                            <div className="w-16 border-r text-xs text-gray-400 p-2 text-right relative -top-3">
                                {hour}:00
                            </div>
                            {weekDays.map(day => {
                                const dayAppts = appointments?.filter((app: any) => {
                                    const appDate = new Date(app.startTime);
                                    return isSameDay(appDate, day) && appDate.getHours() === hour;
                                });

                                return (
                                    <div key={day.toISOString()} className="border-r relative p-1 transition-colors hover:bg-gray-100/50">
                                        {dayAppts?.map((app: any) => (
                                            <div
                                                key={app.id}
                                                onClick={() => setSelectedAppointment(app)}
                                                className={cn(
                                                    "text-xs p-1 rounded border shadow-sm overflow-hidden mb-1 cursor-pointer hover:opacity-80 transition-opacity",
                                                    app.status === AppointmentStatus.CANCELLED ? "bg-red-100 text-red-800 border-red-200 line-through opacity-70" : "bg-blue-100 text-blue-800 border-blue-200"
                                                )}
                                            >
                                                <div className="font-bold truncate">{app.patient?.firstName} {app.patient?.lastName}</div>
                                                <div className="text-[10px] opacity-80 truncate">{format(new Date(app.startTime), 'HH:mm')} - {format(new Date(app.endTime), 'HH:mm')}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal - Create */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nuevo Turno</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                                <select {...register('patientId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="">Seleccionar Paciente</option>
                                    {patientsResponse?.data?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} - {p.dni}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sede</label>
                                    <select {...register('siteId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                        <option value="">Seleccionar Sede</option>
                                        {sites?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profesional</label>
                                    <select {...register('professionalId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                        <option value="">Seleccionar Profesional</option>
                                        {professionals?.map((p: any) => <option key={p.id} value={p.id}>{p.tenantUser?.user?.fullName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                    <input type="date" {...register('date')} className="mt-1 block w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora</label>
                                    <input type="time" {...register('time')} className="mt-1 block w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duración (min)</label>
                                    <select {...register('duration')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                        <option value="15">15 min</option>
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">60 min</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select {...register('type')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value={AppointmentType.IN_PERSON}>Presencial</option>
                                    <option value={AppointmentType.VIRTUAL}>Virtual</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
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
                                    Agendar Turno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal - Details */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl relative">
                        <button
                            onClick={() => setSelectedAppointment(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold mb-1">Detalles del Turno</h3>
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full inline-block mb-3",
                            selectedAppointment.status === AppointmentStatus.CANCELLED ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                            {selectedAppointment.status}
                        </span>

                        <div className="mt-2 space-y-3 text-sm">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block">Paciente</label>
                                <p className="text-gray-900 font-medium">{selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                                {selectedAppointment.patient?.phone && <p className="text-gray-500 text-xs">{selectedAppointment.patient.phone}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block">Profesional</label>
                                <p className="text-gray-900 font-medium">{selectedAppointment.professional?.tenantUser?.user?.fullName}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold block">Horario</label>
                                <p className="text-gray-900">
                                    {format(new Date(selectedAppointment.startTime), 'dd/MM/yyyy')} <br />
                                    {format(new Date(selectedAppointment.startTime), 'HH:mm')} - {format(new Date(selectedAppointment.endTime), 'HH:mm')}
                                </p>
                            </div>
                            {selectedAppointment.notes && (
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold block">Notas</label>
                                    <p className="text-gray-700 italic">{selectedAppointment.notes}</p>
                                </div>
                            )}
                        </div>

                        {selectedAppointment.status !== AppointmentStatus.CANCELLED && (
                            <div className="mt-6 pt-4 border-t">
                                <button
                                    onClick={() => handleCancel(selectedAppointment.id)}
                                    className="w-full bg-red-50 text-red-600 py-2 rounded-md hover:bg-red-100 text-sm font-medium border border-red-200"
                                >
                                    Cancelar Turno
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
