import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function ConfigurationLayout() {
    const tabs = [
        { to: ".", label: "Resumen", end: true }, // or redirect to sedes
        { to: "sedes", label: "Sedes" },
        { to: "consultorios", label: "Consultorios" },
        { to: "especialidades", label: "Especialidades" },
        { to: "profesionales", label: "Profesionales" },
        { to: "usuarios", label: "Usuarios" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <div className="flex border-b mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) => cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                            isActive
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>

            <Outlet />
        </div>
    );
}
