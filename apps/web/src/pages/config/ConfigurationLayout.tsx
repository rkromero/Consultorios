import { Outlet, NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ConfigurationLayout() {
    const tabs = [
        { to: "organizacion", label: "Organización" },
        { to: "sedes", label: "Sedes" },
        { to: "consultorios", label: "Consultorios" },
        { to: "especialidades", label: "Especialidades" },
        { to: "usuarios", label: "Usuarios" },
        { to: "landing", label: "Landing" },
    ];

    return (
        <div className="p-8 h-full flex flex-col overflow-hidden bg-slate-50/50">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <div className="bg-slate-200 p-2 rounded-xl text-slate-600">
                        <Settings size={22} />
                    </div>
                    Configuración del Sistema
                </h1>
                <p className="text-slate-500 text-sm font-medium ml-12">Gestiona sedes, consultorios y parámetros generales</p>
            </div>

            <div className="flex border-b border-slate-200 mb-8 overflow-x-auto bg-white p-1 rounded-2xl shadow-sm border w-fit">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) => cn(
                            "px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xl whitespace-nowrap",
                            isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}
