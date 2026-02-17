import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useSites } from '../hooks/useSites';
import {
    LayoutGrid,
    Calendar,
    Users,
    Wallet,
    LogOut,
    ChevronDown,
    Menu,
    HeartPulse,
    Settings,
    Building2,
    Stethoscope
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
    const { user, tenant, selectedSiteId, setSelectedSiteId, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

    const { data: sites = [] } = useSites();

    // Auto-select first site if none selected
    useEffect(() => {
        if (!selectedSiteId && sites.length > 0) {
            setSelectedSiteId(sites[0].id);
        }
    }, [sites, selectedSiteId, setSelectedSiteId]);

    const activeSite = sites.find(s => s.id === selectedSiteId) || sites[0];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || !tenant) {
        return <div>Cargando...</div>;
    }

    const navItems = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
        { to: "/dashboard/agenda", label: "Agenda General", icon: Calendar },
        { to: "/dashboard/pacientes", label: "Directorio Pacientes", icon: Users },
        { to: "/dashboard/profesionales", label: "Profesionales", icon: Stethoscope },
        { to: "/dashboard/cobranzas", label: "Cobranzas", icon: Wallet },
        { to: "/dashboard/configuracion", label: "Configuración", icon: Settings },
    ];

    const Sidebar = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            {/* Logo & Brand */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <HeartPulse className="w-6 h-6" />
                    </div>
                    <h2 className="font-bold text-lg text-slate-800 tracking-tight uppercase">{tenant.name}</h2>
                </div>

                {/* Sede Selector */}
                <div className="relative mb-8">
                    <button
                        onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            <span className="truncate uppercase font-bold text-[11px] tracking-tight">{activeSite?.name || 'Seleccionar Sede'}</span>
                        </div>
                        <ChevronDown size={14} className={cn("transition-transform", isSiteDropdownOpen ? "rotate-180" : "")} />
                    </button>

                    {isSiteDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                            {sites.map(site => (
                                <button
                                    key={site.id}
                                    onClick={() => {
                                        setSelectedSiteId(site.id);
                                        setIsSiteDropdownOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-tight transition-colors",
                                        site.id === selectedSiteId ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
                                    )}
                                >
                                    <Building2 size={14} />
                                    {site.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 mb-8 px-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                        {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-none mb-1">{user.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Coordinador/a</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to || (item.end === false && location.pathname.startsWith(item.to));
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => cn(
                                "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                <span>{item.label}</span>
                            </div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar (Off-canvas) */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
                isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className={cn(
                    "absolute top-0 bottom-0 left-0 w-72 transition-transform duration-300 transform",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <Sidebar />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <HeartPulse className="w-6 h-6 text-indigo-600" />
                        <span className="font-bold text-slate-800">{tenant.name}</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto relative p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto h-full px-2">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

