import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { usePatients, useCreatePatient } from '../hooks/usePatients';
import { format } from 'date-fns';

// --- Form Schema ---
const patientSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    dni: z.string().min(1, "El DNI es requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    birthDate: z.string().optional(), // YYYY-MM-DD
    gender: z.string().optional(),
    address: z.string().optional(),
});
type PatientForm = z.infer<typeof patientSchema>;

export default function PatientsPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data: response, isLoading } = usePatients({ q: search, page, limit: 10 });
    const createPatient = useCreatePatient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form handling
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PatientForm>({
        resolver: zodResolver(patientSchema)
    });

    const onSubmit = (data: PatientForm) => {
        const payload = {
            ...data,
            birthDate: data.birthDate && data.birthDate !== ''
                ? new Date(data.birthDate).toISOString()
                : undefined
        };

        createPatient.mutate(payload, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Directorio de Pacientes</h1>
                    <p className="text-xs text-slate-500 font-medium">{response?.meta?.total || 0} pacientes registrados</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    Nuevo Paciente
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, DNI o email..."
                    className="input-premium pl-11 py-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List / Table */}
            {isLoading ? (
                <div>Cargando pacientes...</div>
            ) : (
                <div className="card-premium p-0 overflow-hidden border-slate-200">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">DNI</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {response?.data?.map((patient: any) => (
                                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{patient.firstName} {patient.lastName}</div>
                                                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                    {patient.birthDate && format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                                                    {patient.gender && ` • ${patient.gender}`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600">
                                        {patient.dni}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {patient.email && (
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Mail size={14} className="text-slate-300" />
                                                <span className="text-xs font-medium text-slate-500">{patient.email}</span>
                                            </div>
                                        )}
                                        {patient.phone && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone size={14} className="text-slate-300" />
                                                <span className="text-xs font-medium text-slate-500">{patient.phone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => navigate(`/dashboard/pacientes/${patient.id}`)}
                                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wider"
                                        >
                                            Ver Ficha
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {response?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="bg-slate-50 p-3 rounded-full">
                                                <Search size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-400">No se encontraron pacientes registrados.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls could go here */}
                    {response?.meta && response.meta.totalPages > 1 && (
                        <div className="px-6 py-3 border-t bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                            <span>Página {response.meta.page} de {response.meta.totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={page === response.meta.totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1 border rounded bg-white disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-2 rounded-xl">
                                <Plus size={24} className="text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Nuevo Paciente</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre *</label>
                                    <input {...register('firstName')} className="input-premium" placeholder="Ej: Juan" />
                                    {errors.firstName && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.firstName.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Apellido *</label>
                                    <input {...register('lastName')} className="input-premium" placeholder="Ej: Perez" />
                                    {errors.lastName && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">DNI *</label>
                                    <input {...register('dni')} className="input-premium" placeholder="Solo números" />
                                    {errors.dni && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.dni.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fecha de Nacimiento</label>
                                    <input type="date" {...register('birthDate')} className="input-premium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Teléfono</label>
                                    <input {...register('phone')} className="input-premium" placeholder="Ej: 11223344" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                                    <input type="email" {...register('email')} className="input-premium" placeholder="ejemplo@correo.com" />
                                    {errors.email && <span className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dirección</label>
                                <input {...register('address')} className="input-premium" placeholder="Calle, Número, Ciudad" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Género</label>
                                <select {...register('gender')} className="input-premium appearance-none bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-8"
                                >
                                    Guardar Paciente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
