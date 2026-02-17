import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../stores/auth.store';
import { Activity } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
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
            navigate('/select-organization');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />

            <div className="max-w-md w-full relative">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100 mb-4">
                        <Activity size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Unión Salud</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Sistema de Gestión Médica</p>
                </div>

                <div className="card-premium p-10 bg-white/80 backdrop-blur-xl border-white/50 shadow-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-8 text-center">Acceso al Panel</h2>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold uppercase tracking-wider text-center animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Corporativo</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="ejemplo@unionsalud.com"
                                className="input-premium bg-white/50"
                            />
                            {errors.email && <span className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider ml-1">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="input-premium bg-white/50"
                            />
                            {errors.password && <span className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-wider ml-1">{errors.password.message}</span>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-3.5 shadow-xl shadow-indigo-100"
                            >
                                {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">¿Problemas con su acceso?</p>
                        <button className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mt-1 hover:text-indigo-800 transition-colors">
                            Contactar Soporte IT
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    &copy; 2024 Unión Salud &bull; v1.0.4
                </p>
            </div>
        </div>
    );
}
