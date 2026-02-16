import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, FileText, Plus, Clock } from 'lucide-react';
import { usePatient } from '../hooks/usePatients';
import { useMedicalNotes, useCreateMedicalNote } from '../hooks/useMedicalNotes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const noteSchema = z.object({
    content: z.string().min(1, "La nota no puede estar vacía")
});

type NoteForm = z.infer<typeof noteSchema>;

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: patient, isLoading: isLoadingPatient } = usePatient(id!);
    const { data: notes, isLoading: isLoadingNotes } = useMedicalNotes(id!);
    const createNote = useCreateMedicalNote(id!);

    const [isAddingNote, setIsAddingNote] = useState(false);

    const { register, handleSubmit, reset } = useForm<NoteForm>({
        resolver: zodResolver(noteSchema)
    });

    const onSubmit = (data: NoteForm) => {
        createNote.mutate(data.content, {
            onSuccess: () => {
                setIsAddingNote(false);
                reset();
            },
            onError: (err: any) => {
                alert('Error: ' + (err.response?.data?.message || 'Error al guardar nota'));
            }
        });
    };

    if (isLoadingPatient) return <div className="p-6">Cargando paciente...</div>;
    if (!patient) return <div className="p-6">Paciente no encontrado</div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center gap-4 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{patient.firstName} {patient.lastName}</h1>
                    <p className="text-xs text-gray-500">DNI: {patient.dni}</p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Info */}
                <div className="w-80 bg-white border-r p-6 overflow-y-auto hidden md:block">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Información Personal</h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Nombre Completo</p>
                                <p className="text-sm text-gray-600">{patient.firstName} {patient.lastName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Fecha de Nacimiento</p>
                                <p className="text-sm text-gray-600">
                                    {patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy') : '-'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Teléfono</p>
                                <p className="text-sm text-gray-600">{patient.phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email</p>
                                <p className="text-sm text-gray-600">{patient.email || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Dirección</p>
                                <p className="text-sm text-gray-600">{patient.address || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Last 5 Appointments could go here if fetched */}
                </div>

                {/* Clinical History */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="text-blue-600" />
                                Historia Clínica
                            </h2>
                            <button
                                onClick={() => setIsAddingNote(true)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-2 hover:bg-blue-700 shadow-sm"
                            >
                                <Plus size={16} /> Nueva Evolución
                            </button>
                        </div>

                        {isAddingNote && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-sm font-bold mb-2 text-gray-700">Nueva Nota de Evolución</h3>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <textarea
                                        {...register('content')}
                                        className="w-full p-3 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                        placeholder="Escriba la evolución del paciente..."
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNote(false)}
                                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                        >
                                            Guardar Nota
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-6">
                            {isLoadingNotes ? (
                                <p className="text-center text-gray-500 py-4">Cargando historia...</p>
                            ) : notes?.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                                    <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-gray-500">No hay registros en la historia clínica.</p>
                                    <button onClick={() => setIsAddingNote(true)} className="text-blue-600 text-sm mt-1 hover:underline">
                                        Crear primera nota
                                    </button>
                                </div>
                            ) : (
                                notes?.map((note: any) => (
                                    <div key={note.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                    {note.author?.tenantUser?.user?.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{note.author?.tenantUser?.user?.fullName}</p>
                                                    <p className="text-xs text-blue-600">{note.author?.specialty?.name || 'Profesional'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-400 gap-1">
                                                <Clock size={12} />
                                                {format(new Date(note.date), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                            </div>
                                        </div>
                                        <div className="pl-10">
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                                {note.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
