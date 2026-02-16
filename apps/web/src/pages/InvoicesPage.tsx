import { useState } from 'react';
import { useInvoices, useInvoiceStats, useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import { usePatients } from '../hooks/usePatients';
import { format } from 'date-fns';
import { Plus, DollarSign, Filter, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../lib/utils';

const invoiceSchema = z.object({
    patientId: z.string().min(1, "Paciente requerido"),
    amount: z.string().min(1, "Monto requerido"),
    concept: z.string().min(1, "Concepto requerido"),
    status: z.enum(['PENDING', 'PAID']),
    paymentMethod: z.string().optional()
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

export default function InvoicesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    const { data: invoices } = useInvoices({ status: filterStatus });
    const { data: stats } = useInvoiceStats();
    const { data: patients } = usePatients({ limit: 100 });

    const createInvoice = useCreateInvoice();
    const updateInvoice = useUpdateInvoice();

    const { register, handleSubmit, reset } = useForm<InvoiceForm>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: { status: 'PENDING', paymentMethod: 'CASH' }
    });

    const onSubmit = (data: InvoiceForm) => {
        createInvoice.mutate({
            ...data,
            amount: parseFloat(data.amount)
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            }
        });
    };

    const markAsPaid = (id: string) => {
        if (confirm('¿Marcar como pagado?')) {
            updateInvoice.mutate({ id, data: { status: 'PAID' } });
        }
    };

    return (
        <div className="p-6 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign className="text-green-600" />
                        Facturación y Pagos
                    </h1>
                    <p className="text-gray-500 text-sm">Gestiona cobros y estado de cuenta</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2"
                >
                    <Plus size={18} /> Nuevo Cobro
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ingresos Totales (Mes)</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                ${stats?.revenue?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>
                {/* More stats could go here */}
            </div>

            {/* Filters and List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Filter size={16} />
                        <span>Filtrar por:</span>
                    </div>
                    <select
                        className="text-sm border rounded-md p-1.5 bg-gray-50"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="PAID">Pagados</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices?.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(inv.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {inv.patient.firstName} {inv.patient.lastName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {inv.concept}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${inv.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "px-2 py-1 text-xs rounded-full font-medium",
                                            inv.status === 'PAID' ? "bg-green-100 text-green-800" :
                                                inv.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                        )}>
                                            {inv.status === 'PAID' ? 'PAGADO' : inv.status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {inv.status === 'PENDING' && (
                                            <button
                                                onClick={() => markAsPaid(inv.id)}
                                                className="text-green-600 hover:text-green-900 mx-2"
                                            >
                                                Registrar Pago
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invoices?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No hay movimientos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Registrar Nuevo Cobro</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                                <select {...register('patientId')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                    <option value="">Seleccionar Paciente</option>
                                    {patients?.data?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Concepto</label>
                                <input {...register('concept')} placeholder="Ej. Consulta Médica" className="mt-1 block w-full border rounded-md p-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
                                <input type="number" {...register('amount')} className="mt-1 block w-full border rounded-md p-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                                    <select {...register('status')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                        <option value="PENDING">Pendiente</option>
                                        <option value="PAID">Pagado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Método</label>
                                    <select {...register('paymentMethod')} className="mt-1 block w-full border rounded-md p-2 bg-white">
                                        <option value="CASH">Efectivo</option>
                                        <option value="CARD">Tarjeta</option>
                                        <option value="TRANSFER">Transferencia</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
