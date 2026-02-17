// Deployment Track: 2024-02-17 UI Redesign Final
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
import UsersPage from './pages/config/UsersPage';
import OrganizationPage from './pages/config/OrganizationPage';
import PatientsPage from './pages/PatientsPage';
import AgendaPage from './pages/AgendaPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import InvoicesPage from './pages/InvoicesPage';
import CollectionsPage from './pages/CollectionsPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './stores/auth.store';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = useAuthStore(state => state.token);
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const role = useAuthStore(s => s.role);
    const tenant = useAuthStore(s => s.tenant);
    const availableTenants = useAuthStore(s => s.availableTenants);
    const effectiveRole = role || availableTenants.find(t => t.id === tenant?.id)?.role || null;
    if (effectiveRole === 'PROFESSIONAL') return <Navigate to="/dashboard" replace />;
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
                        <Route index element={<DashboardPage />} />
                        <Route path="agenda" element={<AgendaPage />} />
                        <Route path="pacientes" element={<PatientsPage />} />
                        <Route path="pacientes/:id" element={<PatientDetailsPage />} />
                        <Route path="facturacion" element={<AdminRoute><InvoicesPage /></AdminRoute>} />
                        <Route path="cobranzas" element={<AdminRoute><CollectionsPage /></AdminRoute>} />
                        <Route path="profesionales" element={<AdminRoute><ProfessionalsPage /></AdminRoute>} />
                        <Route path="configuracion" element={<AdminRoute><ConfigurationLayout /></AdminRoute>}>
                            <Route index element={<Navigate to="organizacion" replace />} />
                            <Route path="organizacion" element={<OrganizationPage />} />
                            <Route path="sedes" element={<SitesPage />} />
                            <Route path="consultorios" element={<BoxesPage />} />
                            <Route path="especialidades" element={<SpecialtiesPage />} />
                            <Route path="usuarios" element={<UsersPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
