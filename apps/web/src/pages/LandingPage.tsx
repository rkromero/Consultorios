import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

export default function LandingPage() {
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        tenantName: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { setLogin, selectTenant: selectStoreTenant } = useAuthStore();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.register(formData);

            // Auto-login after registration
            const loginResult = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            setLogin(loginResult.token, loginResult.user, loginResult.tenants);

            // Auto-select the tenant if only one
            if (loginResult.tenants.length === 1) {
                const tenantResult = await authApi.selectTenant(
                    loginResult.tenants[0].id,
                    loginResult.token
                );
                selectStoreTenant(tenantResult.token, tenantResult.tenant, tenantResult.role);
                navigate('/dashboard');
            } else {
                navigate('/select-organization');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">{/* Hero Section */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        SUPER SAS
                    </span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                    Iniciar Sesión
                </button>
            </nav>

            <div className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                        SUPER SAS - Gestiona tu consultorio con eficiencia
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Sistema integral para la gestión de consultorios médicos. Agenda, pacientes, historias clínicas y facturación en una sola plataforma.
                    </p>
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Comenzar Gratis
                    </button>
                </div>

                {/* Features Grid */}
                <div className="mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '📅',
                            title: 'Agenda Inteligente',
                            description: 'Gestiona turnos con vista de calendario. Previene superposiciones y optimiza tu tiempo.',
                        },
                        {
                            icon: '👥',
                            title: 'Pacientes',
                            description: 'Base de datos completa con historial médico, obras sociales y datos de contacto.',
                        },
                        {
                            icon: '📝',
                            title: 'Historias Clínicas',
                            description: 'Registra consultas, notas médicas y archivos adjuntos de forma digital y segura.',
                        },
                        {
                            icon: '💰',
                            title: 'Facturación',
                            description: 'Control de pagos, facturación y reportes financieros integrados.',
                        },
                        {
                            icon: '🏥',
                            title: 'Multi-Sede',
                            description: 'Gestiona múltiples sedes y consultorios desde una sola plataforma.',
                        },
                        {
                            icon: '🔒',
                            title: 'Seguridad',
                            description: 'Datos encriptados y respaldos automáticos. Cumplimiento de normativas de privacidad.',
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-32 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 text-white">
                    <h2 className="text-4xl font-bold mb-4">¿Listo para transformar tu consultorio?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Únete a cientos de profesionales que ya confían en nuestra plataforma
                    </p>
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Crear Cuenta Gratis
                    </button>
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>

                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Crear Cuenta
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Dr. Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de tu organización
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.tenantName}
                                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Mi Consultorio"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                onClick={() => {
                                    setShowRegisterModal(false);
                                    navigate('/login');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Inicia sesión
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
