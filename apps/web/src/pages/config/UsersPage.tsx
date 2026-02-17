import { useState } from 'react';
import { Search, UserCog, Mail, Phone, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { UserResponse } from '../../api/users.api';
import { format } from 'date-fns';

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const { data: users, isLoading } = useUsers();

    const filteredUsers = users?.filter((user: UserResponse) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

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
                {filteredUsers?.map((user) => (
                    <div key={user.id} className="card-premium flex flex-col gap-4 hover:border-indigo-200 transition-all group">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight">{user.fullName}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                        {user.role}
                                    </span>
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

                        <button className="mt-2 w-full py-2 bg-slate-50 hover:bg-indigo-50 text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest rounded-lg transition-all border border-transparent hover:border-indigo-100">
                            Gestionar Permisos
                        </button>
                    </div>
                ))}

                {filteredUsers?.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <UserCog size={48} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium">No se encontraron miembros con ese criterio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
