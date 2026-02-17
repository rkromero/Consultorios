import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
    const { user, tenant, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || !tenant) {
        // Should be handled by protected route wrapper, but safety check
        return <div>Loading...</div>;
    }

    const navItems = [
        { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
        { to: "/dashboard/agenda", label: "Agenda", icon: Calendar },
        { to: "/dashboard/pacientes", label: "Pacientes", icon: Users },
        { to: "/dashboard/profesionales", label: "Profesionales", icon: Building2 }, // Using Building2 or another icon
        { to: "/dashboard/configuracion", label: "Configuración", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 truncate w-32 tracking-tight" title={tenant.name}>{tenant.name}</h2>
                        <p className="text-xs text-gray-400 font-medium tracking-wide">Consultorio</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", ({ isActive }: any) => isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
