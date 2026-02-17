import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    getCollections,
    markAsPaid,
    updateDueDate,
    CollectionStatus
} from '../api/collections.api';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Calendar as CalendarIcon,
    MoreVertical
} from 'lucide-react';

export default function CollectionsPage() {
    const queryClient = useQueryClient();

    const [filters, setFilters] = useState({
        status: undefined as CollectionStatus | undefined,
        appointmentDateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        appointmentDateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    });

    const { data, isLoading } = useQuery({
        queryKey: ['collections', filters],
        queryFn: () => getCollections(filters),
    });

    const markPaidMutation = useMutation({
        mutationFn: ({ id, paidAt, notes }: { id: string; paidAt: string; notes?: string }) =>
            markAsPaid(id, { paidAt, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
        },
    });

    const updateDueDateMutation = useMutation({
        mutationFn: ({ id, dueDate }: { id: string; dueDate: string }) =>
            updateDueDate(id, dueDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
        },
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status: CollectionStatus) => {
        switch (status) {
            case CollectionStatus.PAID: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case CollectionStatus.OVERDUE: return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cobranzas</h1>
                    <p className="text-slate-500 mt-1">Gestión de pagos diferidos a 90 días.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { }} // Initial Pricing setup would go here or a separate settings tab
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Configurar Precios
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    title="Pendiente Total"
                    amount={data?.kpis.pending.total || 0}
                    count={data?.kpis.pending.count || 0}
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    color="amber"
                />
                <Card
                    title="Vencido"
                    amount={data?.kpis.overdue.total || 0}
                    count={data?.kpis.overdue.count || 0}
                    icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
                    color="rose"
                />
                <Card
                    title="Cobrado (Rango)"
                    amount={data?.kpis.paid.total || 0}
                    count={data?.kpis.paid.count || 0}
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    color="emerald"
                />
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
                        <select
                            className="block w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={filters.status || ''}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                        >
                            <option value="">Todos los estados</option>
                            <option value={CollectionStatus.PENDING}>Pendientes</option>
                            <option value={CollectionStatus.PAID}>Cobrados</option>
                            <option value={CollectionStatus.OVERDUE}>Vencidos</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turnos Desde</label>
                        <input
                            type="date"
                            className="block w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={filters.appointmentDateFrom}
                            onChange={(e) => setFilters({ ...filters, appointmentDateFrom: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turnos Hasta</label>
                        <input
                            type="date"
                            className="block w-full rounded-lg border-slate-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={filters.appointmentDateTo}
                            onChange={(e) => setFilters({ ...filters, appointmentDateTo: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Profesional</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha Turno</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Cargando cobranzas...</td>
                                </tr>
                            ) : data?.items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No se encontraron cobranzas para los filtros aplicados.</td>
                                </tr>
                            ) : data?.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {item.appointment.patient.firstName} {item.appointment.patient.lastName}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono tracking-tighter">ID: {item.appointmentId.slice(0, 8)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {item.appointment.professional.tenantUser.user.fullName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                                            {format(parseISO(item.appointment.startTime), "dd/MM/yyyy HH:mm", { locale: es })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                        {formatCurrency(item.amountDueArsInt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${item.status === CollectionStatus.OVERDUE ? 'text-rose-600 font-medium' : ''}`}>
                                            {format(parseISO(item.dueDate), 'dd/MM/yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                            {item.status === CollectionStatus.PENDING ? 'Pendiente' :
                                                item.status === CollectionStatus.PAID ? 'Cobrado' : 'Vencido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status !== CollectionStatus.PAID && (
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <button
                                                    onClick={() => {
                                                        const paidAt = new Date().toISOString();
                                                        if (confirm('¿Confirmar cobro de este turno?')) {
                                                            markPaidMutation.mutate({ id: item.appointmentId, paidAt });
                                                        }
                                                    }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Marcar como cobrado"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newDate = prompt('Nuevo vencimiento (YYYY-MM-DD):', item.dueDate.split('T')[0]);
                                                        if (newDate) {
                                                            updateDueDateMutation.mutate({ id: item.appointmentId, dueDate: newDate });
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
                                                    title="Re-programar vencimiento"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                        {item.status === CollectionStatus.PAID && (
                                            <div className="text-xs text-slate-400 italic">
                                                Cobrado el {format(parseISO(item.paidAt!), 'dd/MM/yy')}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Card({ title, amount, count, icon, color }: any) {
    const bgColors: any = {
        amber: 'bg-amber-50 border-amber-100',
        rose: 'bg-rose-50 border-rose-100',
        emerald: 'bg-emerald-50 border-emerald-100'
    };

    const textColors: any = {
        amber: 'text-amber-600',
        rose: 'text-rose-600',
        emerald: 'text-emerald-600'
    };

    return (
        <div className={`p-6 rounded-2xl border ${bgColors[color]} shadow-sm space-y-3 relative overflow-hidden group`}>
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-white shadow-sm ${textColors[color]}`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${textColors[color]} opacity-60`}>
                    {count} ítems
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)}
                </h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(icon, { className: 'w-24 h-24' })}
            </div>
        </div>
    );
}
