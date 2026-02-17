import { useState } from 'react';
import {
    Search, UserCog, Mail, Phone, Calendar as CalendarIcon,
    ShieldCheck, Plus, Trash2, X, Loader2, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useUsers, useInviteUser, useRemoveUser, useUpdateUserRole } from '../../hooks/useUsers';
import { UserResponse } from '../../api/users.api';
import { useAuthStore } from '../../stores/auth.store';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const ROLES = [
    { value: 'ADMIN', label: 'Administrador', color: 'indigo' },
    { value: 'COORDINATOR', label: 'Coordinador', color: 'violet' },
    { value: 'RECEPTIONIST', label: 'Recepcionista', color: 'sky' },
    { value: 'PROFESSIONAL', label: 'Profesional', color: 'emerald' },
    { value: 'PATIENT', label: 'Paciente', color: 'amber' },
];

const getRoleBadge = (role: string) => {
    const r = ROLES.find(x => x.value === role);
    if (!r) return { label: role, classes: 'bg-slate-50 text-slate-500' };

    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        violet: 'bg-violet-50 text-violet-600',
        sky: 'bg-sky-50 text-sky-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return { label: r.label, classes: colorMap[r.color] || 'bg-slate-50 text-slate-500' };
};

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const currentUser = useAuthStore(s => s.user);
    const currentRole = useAuthStore(s => s.role);
    const availableTenants = useAuthStore(s => s.availableTenants);
    const currentTenant = useAuthStore(s => s.tenant);

    const effectiveRole = currentRole || availableTenants.find(t => t.id === currentTenant?.id)?.role || null;
    const isAdmin = effectiveRole === 'ADMIN';

    const { data: users, isLoading } = useUsers();
    const removeMutation = useRemoveUser();
    const roleMutation = useUpdateUserRole();

    const filteredUsers = users?.filter((user: UserResponse) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleRemove = (user: UserResponse) => {
        if (user.id === currentUser?.id) return;
        if (confirm(`¿Eliminar a ${user.fullName} de la organización? Esta acción no se puede deshacer.`)) {
            removeMutation.mutate(user.id);
        }
    };

    const handleRoleChange = (user: UserResponse, newRole: string) => {
        if (user.id === currentUser?.id) return;
        roleMutation.mutate({ userId: user.id, role: newRole });
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 animate-pulse font-medium">Cargando equipo...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Usuarios del Sistema</h1>
                    <p className="text-xs text-slate-500 font-medium">{users?.length || 0} miembros en tu organización</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Agregar Usuario
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="input-premium pl-11 py-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers?.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const isSelf = user.id === currentUser?.id;

                    return (
                        <div key={user.id} className="card-premium flex flex-col gap-4 hover:border-indigo-200 transition-all group relative">
                            {/* Delete button */}
                            {isAdmin && !isSelf && (
                                <button
                                    onClick={() => handleRemove(user)}
                                    disabled={removeMutation.isPending}
                                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Eliminar usuario"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight">
                                        {user.fullName}
                                        {isSelf && <span className="text-[9px] text-slate-400 ml-1 normal-case">(tú)</span>}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <ShieldCheck size={14} className="text-indigo-500" />
                                        {isAdmin && !isSelf ? (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                                disabled={roleMutation.isPending}
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border-0 cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-200",
                                                    badge.classes
                                                )}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", badge.classes)}>
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                                    <Mail size={14} className="text-slate-300" />
                                    <span className="text-xs font-medium truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Phone size={14} className="text-slate-300" />
                                        <span className="text-xs font-medium">{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-slate-400">
                                    <CalendarIcon size={14} className="text-slate-200" />
                                    <span className="text-[10px] font-medium uppercase tracking-tighter">Miembro desde: {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredUsers?.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <UserCog size={48} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium">No se encontraron miembros con ese criterio.</p>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteUserModal onClose={() => setShowInviteModal(false)} />
            )}
        </div>
    );
}

function InviteUserModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
        email: '',
        fullName: '',
        password: '',
        role: 'RECEPTIONIST'
    });
    const [showPassword, setShowPassword] = useState(false);
    const inviteMutation = useInviteUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        inviteMutation.mutate(form, {
            onSuccess: () => onClose()
        });
    };

    const isValid = form.email.trim() && form.fullName.trim() && form.password.length >= 6 && form.role;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Agregar Usuario</h2>
                        <p className="text-xs text-slate-400 font-medium">Invita a un nuevo miembro a tu organización</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => setForm({ ...form, fullName: e.target.value })}
                            className="input-premium"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="input-premium"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="input-premium pr-10"
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Rol
                        </label>
                        <select
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            className="input-premium appearance-none bg-white"
                        >
                            {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {inviteMutation.isError && (
                        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl">
                            <AlertCircle size={14} />
                            {(inviteMutation.error as any)?.response?.data?.message || 'Error al agregar usuario'}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || inviteMutation.isPending}
                            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {inviteMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
