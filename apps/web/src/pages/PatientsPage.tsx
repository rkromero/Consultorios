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
        // Basic date handling if needed types require Date object or ISO string
        // input type="date" returns YYYY-MM-DD string, usually fine if backend expects string or DateTime (Prisma can auto-parse ISO)
        // If Prisma expects DateTime, we might need new Date(data.birthDate)

        // For MVP, assuming backend accepts the string format or we parse it there, 
        // but Prisma typically needs DateTime object for DateTime fields.
        // Let's pass it as is and if fails we correct backend service.
        // Actually, backend service creates prisma.create({ data }) directly. 
        // Prisma Client expects Date object or ISO-8601 string. "2000-01-01" is ISO compliant enough usually.

        const payload = {
            ...data,
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined
        };

        createPatient.mutate(payload, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pacientes</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 font-medium"
                >
                    <Plus size={18} />
                    Nuevo Paciente
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, DNI o email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List / Table */}
            {isLoading ? (
                <div>Cargando pacientes...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {response?.data?.map((patient: any) => (
                                <tr key={patient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {patient.firstName[0]}{patient.lastName[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    {patient.birthDate && format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                                                    {patient.gender && ` • ${patient.gender}`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {patient.dni}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {patient.email && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <Mail size={14} /> {patient.email}
                                            </div>
                                        )}
                                        {patient.phone && (
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} /> {patient.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/dashboard/pacientes/${patient.id}`)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Ficha
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {response?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron pacientes.
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
                        <h3 className="text-xl font-bold mb-6">Nuevo Paciente</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                    <input {...register('firstName')} className="mt-1 block w-full border rounded-md p-2" />
                                    {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                                    <input {...register('lastName')} className="mt-1 block w-full border rounded-md p-2" />
                                    {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">DNI *</label>
                                    <input {...register('dni')} className="mt-1 block w-full border rounded-md p-2" />
                                    {errors.dni && <span className="text-red-500 text-sm">{errors.dni.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                                    <input type="date" {...register('birthDate')} className="mt-1 block w-full border rounded-md p-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input {...register('phone')} className="mt-1 block w-full border rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" {...register('email')} className="mt-1 block w-full border rounded-md p-2" />
                                    {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                <input {...register('address')} className="mt-1 block w-full border rounded-md p-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Género</label>
                                <select {...register('gender')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
