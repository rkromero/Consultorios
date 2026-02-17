import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SelectOrganizationPage from './pages/SelectOrganizationPage';
import DashboardLayout from './layouts/DashboardLayout';
import ConfigurationLayout from './pages/config/ConfigurationLayout';
import SitesPage from './pages/config/SitesPage';
import BoxesPage from './pages/config/BoxesPage';
import SpecialtiesPage from './pages/config/SpecialtiesPage';
import ProfessionalsPage from './pages/config/ProfessionalsPage';
import PatientsPage from './pages/PatientsPage';
import AgendaPage from './pages/AgendaPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import InvoicesPage from './pages/InvoicesPage';
import { useAuthStore } from './stores/auth.store';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = useAuthStore(state => state.token);
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/select-organization" element={
                        <ProtectedRoute>
                            <SelectOrganizationPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<div className="p-6"><h1>Bienvenido al Dashboard</h1></div>} />
                        <Route path="agenda" element={<AgendaPage />} />
                        <Route path="pacientes" element={<PatientsPage />} />
                        <Route path="pacientes/:id" element={<PatientDetailsPage />} />
                        <Route path="facturacion" element={<InvoicesPage />} />
                        <Route path="configuracion" element={<ConfigurationLayout />}>
                            <Route index element={<Navigate to="sedes" replace />} />
                            <Route path="sedes" element={<SitesPage />} />
                            <Route path="consultorios" element={<BoxesPage />} />
                            <Route path="especialidades" element={<SpecialtiesPage />} />
                            <Route path="profesionales" element={<ProfessionalsPage />} />
                            <Route path="usuarios" element={<div className="p-4">Usuarios (WIP)</div>} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
