import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../stores/auth.store';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const setLogin = useAuthStore(state => state.setLogin);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInputs>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginInputs) => {
        try {
            const res = await api.post('/auth/login', data);
            setLogin(res.data.token, res.data.user, res.data.tenants);

            // If only one tenant, auto-select? For now, go to selection screen
            if (res.data.tenants.length === 1) {
                // Auto-select logic could go here, calling another API or just redirecting
                // But let's stick to flow: Login -> Select Org -> Dashboard
            }
            navigate('/select-organization');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            {...register('password')}
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Cargando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
