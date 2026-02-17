import { useState } from 'react';
import { useInvoices, useInvoiceStats, useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import { usePatients } from '../hooks/usePatients';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, DollarSign, Filter, TrendingUp, CreditCard, Wallet, Banknote, Clock, CheckCircle2, XCircle } from 'lucide-react';
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

    const { register, handleSubmit, reset, formState: { errors } } = useForm<InvoiceForm>({
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
        <div className="p-8 h-full flex flex-col overflow-hidden bg-slate-50/50">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                            <DollarSign size={24} />
                        </div>
                        Facturación y Pagos
                    </h1>
                    <p className="text-slate-500 text-sm font-medium ml-12">Control de ingresos y gestión de cobros</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary px-6"
                >
                    <Plus size={18} /> Nuevo Cobro
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="card-premium p-6 border-l-4 border-l-emerald-500 hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ingresos Totales (Mes)</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">
                                ${stats?.revenue?.toLocaleString() || '0'}
                            </h3>
                            <div className="flex items-center gap-1 mt-2 text-emerald-600">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">+12.5% vs mes anterior</span>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <TrendingUp size={28} />
                        </div>
                    </div>
                </div>

                <div className="card-premium p-6 border-l-4 border-l-amber-500 hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pagos Pendientes</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">
                                {invoices?.filter((i: any) => i.status === 'PENDING').length || 0}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Requieren seguimiento</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                            <Clock size={28} />
                        </div>
                    </div>
                </div>

                <div className="card-premium p-6 border-l-4 border-l-indigo-500 hover:translate-y-[-2px] transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transacciones Totales</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-1">
                                {invoices?.length || 0}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Historial completo</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Banknote size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and List */}
            <div className="card-premium p-0 flex-1 flex flex-col overflow-hidden border-slate-200 shadow-xl">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Filter size={18} className="text-indigo-500" />
                            <span className="text-xs font-bold uppercase tracking-widest">Filtrar:</span>
                        </div>
                        <div className="flex gap-2">
                            {['', 'PENDING', 'PAID'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                                        filterStatus === status
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                                    )}
                                >
                                    {status === '' ? 'Todos' : status === 'PENDING' ? 'Pendientes' : 'Pagados'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Mostrando {invoices?.length || 0} movimientos
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concepto</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {invoices?.map((inv: any) => (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-slate-500">
                                        {format(new Date(inv.createdAt), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {inv.patient.firstName[0]}{inv.patient.lastName[0]}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{inv.patient.firstName} {inv.patient.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                            {inv.concept}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="text-base font-black text-slate-800">
                                            ${inv.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className={cn(
                                            "flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                                            inv.status === 'PAID'
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                : inv.status === 'PENDING'
                                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                        )}>
                                            {inv.status === 'PAID' ? <CheckCircle2 size={12} /> : inv.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                                            {inv.status === 'PAID' ? 'PAGADO' : inv.status === 'PENDING' ? 'PENDIENTE' : 'CANCELADO'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        {inv.status === 'PENDING' ? (
                                            <button
                                                onClick={() => markAsPaid(inv.id)}
                                                className="btn-primary py-1.5 px-4 text-xs"
                                            >
                                                Registrar Pago
                                            </button>
                                        ) : (
                                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                <FileText size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invoices?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-slate-50 rounded-full mb-4">
                                                <DollarSign size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay movimientos registrados</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-emerald-100 p-2 rounded-xl">
                                <Plus size={24} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Registar Nuevo Cobro</h3>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Paciente</label>
                                <select {...register('patientId')} className="input-premium appearance-none bg-white">
                                    <option value="">Seleccionar Paciente</option>
                                    {patients?.data?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                                    ))}
                                </select>
                                {errors.patientId && <span className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.patientId.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Concepto</label>
                                <input {...register('concept')} placeholder="Ej. Consulta Médica" className="input-premium" />
                                {errors.concept && <span className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.concept.message}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monto ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="number" {...register('amount')} className="input-premium pl-12" placeholder="0.00" />
                                </div>
                                {errors.amount && <span className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.amount.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                                    <select {...register('status')} className="input-premium appearance-none bg-white">
                                        <option value="PENDING">Pendiente</option>
                                        <option value="PAID">Pagado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Método</label>
                                    <select {...register('paymentMethod')} className="input-premium appearance-none bg-white">
                                        <option value="CASH">Efectivo</option>
                                        <option value="CARD">Tarjeta</option>
                                        <option value="TRANSFER">Transferencia</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-10"
                                >
                                    Confirmar Cobro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
