import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, MapPin, FileText, Plus, Clock } from 'lucide-react';
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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { register, handleSubmit, reset } = useForm<NoteForm>({
        resolver: zodResolver(noteSchema)
    });

    const onSubmit = (data: NoteForm) => {
        const formData = new FormData();
        formData.append('patientId', id!);
        formData.append('content', data.content);

        selectedFiles.forEach(file => {
            formData.append('attachments', file);
        });

        createNote.mutate(formData, {
            onSuccess: () => {
                setIsAddingNote(false);
                setSelectedFiles([]);
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
        <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">{patient.firstName} {patient.lastName}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">DNI: {patient.dni}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary py-2">Editar Datos</button>
                    <button className="btn-primary py-2 px-6">Nuevo Turno</button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Info */}
                <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto hidden md:block">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-xl mb-4">
                            {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{patient.firstName} {patient.lastName}</h3>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Paciente Activo</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Datos del Paciente</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                        <Calendar size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Nacimiento</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {patient.birthDate ? format(new Date(patient.birthDate), 'dd/MM/yyyy') : '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                        <Phone size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Celular</p>
                                        <p className="text-sm font-semibold text-slate-700">{patient.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                        <Mail size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Email</p>
                                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{patient.email || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                        <MapPin size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Dirección</p>
                                        <p className="text-sm font-semibold text-slate-700 leading-snug">{patient.address || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Administración</h4>
                            <button className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm mb-2 uppercase tracking-wider">
                                <span>Ver Facturación</span>
                                <FileText size={14} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Clinical History */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                        <FileText size={20} />
                                    </div>
                                    Historia Clínica
                                </h2>
                                <p className="text-xs text-slate-500 font-medium ml-11">Registro cronológico de evoluciones médicas</p>
                            </div>
                            <button
                                onClick={() => setIsAddingNote(true)}
                                className="btn-primary"
                            >
                                <Plus size={18} /> Nueva Evolución
                            </button>
                        </div>

                        {isAddingNote && (
                            <div className="card-premium p-6 border-indigo-200 shadow-lg shadow-indigo-50 mb-8 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-indigo-600">Nueva Nota de Evolución</h3>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <textarea
                                        {...register('content')}
                                        className="input-premium min-h-[150px] py-4 text-sm"
                                        placeholder="Escriba la evolución del paciente, diagnósticos, tratamientos..."
                                        autoFocus
                                    />

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <label className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 cursor-pointer text-xs font-bold uppercase tracking-wider transition-colors">
                                                <Plus size={16} />
                                                <span>Adjuntar archivos</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                                        }
                                                    }}
                                                />
                                            </label>

                                            {selectedFiles.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {selectedFiles.map((file, idx) => (
                                                        <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-2">
                                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingNote(false);
                                                    setSelectedFiles([]);
                                                }}
                                                className="btn-secondary"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-primary px-8"
                                            >
                                                Guardar Nota
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-6">
                            {isLoadingNotes ? (
                                <p className="text-center text-slate-400 py-8 animate-pulse text-sm font-medium italic">Sincronizando registros médicos...</p>
                            ) : notes?.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                    <p className="text-slate-500 font-medium bg-slate-50 inline-block px-4 py-1.5 rounded-full text-sm mb-4">La historia clínica está vacía</p>
                                    <div className="block">
                                        <button onClick={() => setIsAddingNote(true)} className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors">
                                            Crear Nota de Evolución
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                notes?.map((note: any) => (
                                    <div key={note.id} className="card-premium p-6 hover:border-indigo-100 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {note.author?.tenantUser?.user?.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{note.author?.tenantUser?.user?.fullName}</p>
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">{note.author?.specialty?.name || 'Profesional'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                <Clock size={12} className="mr-1.5 text-slate-300" />
                                                {format(new Date(note.date), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                            </div>
                                        </div>
                                        <div className="pl-1 flex gap-4">
                                            <div className="w-0.5 bg-slate-100 rounded-full my-1 group-hover:bg-indigo-100 transition-colors" />
                                            <div className="flex-1">
                                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px] font-medium">
                                                    {note.content}
                                                </p>

                                                {note.attachments && note.attachments.length > 0 && (
                                                    <div className="mt-6 flex flex-wrap gap-2">
                                                        {note.attachments.map((att: any) => (
                                                            <a
                                                                key={att.id}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100 shadow-sm group/file"
                                                            >
                                                                <FileText size={16} className="text-slate-300 group-hover/file:text-indigo-500 transition-colors" />
                                                                <span className="truncate max-w-[150px] uppercase tracking-tighter">{att.filename}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
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
