import { useState, useRef, useEffect } from 'react';
import {
    Building2,
    Upload,
    Trash2,
    Save,
    Loader2,
    ImageIcon,
    AlertCircle
} from 'lucide-react';
import { useTenantInfo, useUpdateTenantName, useUploadTenantLogo, useRemoveTenantLogo } from '../../hooks/useTenant';
import { cn } from '../../lib/utils';

export default function OrganizationPage() {
    const { data: tenant, isLoading } = useTenantInfo();
    const { mutate: updateName, isPending: isUpdatingName } = useUpdateTenantName();
    const { mutate: uploadLogo, isPending: isUploadingLogo } = useUploadTenantLogo();
    const { mutate: removeLogo, isPending: isRemovingLogo } = useRemoveTenantLogo();

    const [name, setName] = useState('');
    const [nameSuccess, setNameSuccess] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoError, setLogoError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (tenant) {
            setName(tenant.name);
            setLogoPreview(tenant.logoUrl);
        }
    }, [tenant]);

    const handleSaveName = () => {
        if (!name.trim() || name.trim() === tenant?.name) return;
        setNameSuccess(false);
        updateName(name.trim(), {
            onSuccess: () => {
                setNameSuccess(true);
                setTimeout(() => setNameSuccess(false), 3000);
            }
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoError(null);

        if (!file.type.startsWith('image/')) {
            setLogoError('El archivo debe ser una imagen (PNG, JPG, SVG)');
            return;
        }

        if (file.size > 200 * 1024) {
            setLogoError('El logo no debe superar 200KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setLogoPreview(dataUrl);
            uploadLogo(dataUrl);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveLogo = () => {
        if (confirm('¿Eliminar el logo de la organización?')) {
            removeLogo(undefined, {
                onSuccess: () => setLogoPreview(null)
            });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse bg-white rounded-2xl border border-slate-200 p-8">
                    <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                </div>
                <div className="animate-pulse bg-white rounded-2xl border border-slate-200 p-8">
                    <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
                    <div className="h-32 bg-slate-100 rounded w-48" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Nombre de la Organización */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <Building2 size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Nombre de la Organización</h3>
                        <p className="text-xs text-slate-400 font-medium">Este nombre aparece en el menú lateral y en todo el sistema</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nombre de la organización"
                        className="input-premium flex-1"
                    />
                    <button
                        onClick={handleSaveName}
                        disabled={isUpdatingName || !name.trim() || name.trim() === tenant?.name}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0",
                            nameSuccess
                                ? "bg-green-500 text-white"
                                : "btn-primary"
                        )}
                    >
                        {isUpdatingName ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : nameSuccess ? (
                            <span>Guardado</span>
                        ) : (
                            <>
                                <Save size={16} />
                                Guardar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-xl">
                        <ImageIcon size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Logo</h3>
                        <p className="text-xs text-slate-400 font-medium">Si hay logo, se muestra en el menú lateral en lugar del nombre. Máximo 200KB.</p>
                    </div>
                </div>

                <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className={cn(
                        "w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 transition-all",
                        logoPreview ? "border-indigo-200 bg-white" : "border-slate-200 bg-slate-50"
                    )}>
                        {isUploadingLogo ? (
                            <Loader2 size={24} className="text-indigo-400 animate-spin" />
                        ) : logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="text-center">
                                <ImageIcon size={28} className="text-slate-300 mx-auto mb-1" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Sin logo</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex-1 space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="w-full py-3 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload size={16} />
                            {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                        </button>

                        {logoPreview && (
                            <button
                                onClick={handleRemoveLogo}
                                disabled={isRemovingLogo}
                                className="w-full py-3 px-4 border-2 border-rose-200 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isRemovingLogo ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Eliminar Logo
                            </button>
                        )}

                        {logoError && (
                            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                                <AlertCircle size={14} />
                                {logoError}
                            </div>
                        )}

                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Formatos: PNG, JPG, SVG, WebP. Recomendado: fondo transparente, mínimo 128x128px.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
