import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Globe, Copy, Check, ExternalLink, Loader2, Save, AlertCircle,
    Upload, Trash2, Plus, X, Eye, EyeOff, Image as ImageIcon,
    Phone, Mail, MapPin, MessageCircle, Instagram, Palette,
    Search, Type, Sparkles, ChevronDown, ChevronUp, GripVertical
} from 'lucide-react';
import {
    useLanding, useUpdateLanding, useEnableLanding, useDisableLanding,
    useUpdateSlug, useUploadLandingImage, useRemoveLandingImage
} from '../../hooks/useLanding';
import type { LandingSection, LandingContact, LandingTheme, LandingSeo } from '../../api/landing.api';
import { cn } from '../../lib/utils';

const LANDING_DOMAIN = 'turnio.app';

function SectionCard({ title, icon: Icon, children, defaultOpen = true }: {
    title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-5 hover:bg-slate-50/50 transition-colors"
            >
                <div className="p-2 bg-indigo-50 rounded-xl">
                    <Icon size={16} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex-1 text-left">{title}</h3>
                {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {open && <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">{children}</div>}
        </div>
    );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
    return (
        <div className="mb-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
            {hint && <p className="text-[10px] text-slate-400 font-medium">{hint}</p>}
        </div>
    );
}

export default function LandingConfigPage() {
    const { data: landing, isLoading } = useLanding();
    const updateMutation = useUpdateLanding();
    const enableMutation = useEnableLanding();
    const disableMutation = useDisableLanding();
    const slugMutation = useUpdateSlug();
    const uploadMutation = useUploadLandingImage();
    const removeMutation = useRemoveLandingImage();

    const [headline, setHeadline] = useState('');
    const [subheadline, setSubheadline] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [sections, setSections] = useState<LandingSection[]>([]);
    const [contact, setContact] = useState<LandingContact>({});
    const [theme, setTheme] = useState<LandingTheme>({ primaryColor: '#4F46E5', accentColor: '#06B6D4' });
    const [seo, setSeo] = useState<LandingSeo>({});
    const [poweredBy, setPoweredBy] = useState(true);
    const [slug, setSlug] = useState('');
    const [slugEditing, setSlugEditing] = useState(false);
    const [slugDraft, setSlugDraft] = useState('');
    const [copied, setCopied] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const heroRef = useRef<HTMLInputElement>(null);
    const logoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!landing) return;
        setHeadline(landing.headline || '');
        setSubheadline(landing.subheadline || '');
        setCtaText(landing.primaryCtaText || 'Reservar turno');
        setCtaLink(landing.primaryCtaLink || '');
        setSections(landing.sections || []);
        setContact(landing.contact || {});
        setTheme(landing.theme || { primaryColor: '#4F46E5', accentColor: '#06B6D4' });
        setSeo(landing.seo || {});
        setPoweredBy(landing.poweredByEnabled ?? true);
        setSlug(landing.slug || '');
        setSlugDraft(landing.slug || '');
    }, [landing]);

    const publicUrl = slug ? `https://${slug}.${LANDING_DOMAIN}` : '';

    const handleCopy = useCallback(() => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [publicUrl]);

    const handleToggle = () => {
        setError(null);
        if (landing?.enabled) {
            disableMutation.mutate(undefined, { onError: (e: any) => setError(e.response?.data?.message || e.message) });
        } else {
            enableMutation.mutate(undefined, { onError: (e: any) => setError(e.response?.data?.message || e.message) });
        }
    };

    const handleSaveSlug = () => {
        setError(null);
        slugMutation.mutate(slugDraft, {
            onSuccess: () => {
                setSlugEditing(false);
                setSlug(slugDraft);
            },
            onError: (e: any) => setError(e.response?.data?.message || e.message),
        });
    };

    const handleSave = () => {
        setError(null);
        setSaveSuccess(false);
        updateMutation.mutate(
            {
                headline, subheadline,
                primaryCtaText: ctaText, primaryCtaLink: ctaLink,
                sections, contact, theme, seo,
                poweredByEnabled: poweredBy,
                slug: slug || undefined,
            },
            {
                onSuccess: () => {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                },
                onError: (e: any) => setError(e.response?.data?.message || e.message),
            }
        );
    };

    const handleImageUpload = (field: 'logoUrl' | 'heroImageUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError('La imagen no debe superar 2MB.');
            return;
        }
        setError(null);
        const reader = new FileReader();
        reader.onload = () => {
            uploadMutation.mutate(
                { image: reader.result as string, field },
                { onError: (e: any) => setError(e.response?.data?.message || e.message) }
            );
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleRemoveImage = (field: 'logoUrl' | 'heroImageUrl') => {
        removeMutation.mutate(field, {
            onError: (e: any) => setError(e.response?.data?.message || e.message),
        });
    };

    const addSection = () => {
        if (sections.length >= 3) return;
        setSections([...sections, { title: '', description: '', items: [] }]);
    };

    const updateSection = (idx: number, patch: Partial<LandingSection>) => {
        setSections(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
    };

    const removeSection = (idx: number) => {
        setSections(prev => prev.filter((_, i) => i !== idx));
    };

    const addSectionItem = (sIdx: number) => {
        setSections(prev => prev.map((s, i) =>
            i === sIdx ? { ...s, items: [...(s.items || []).slice(0, 5), { icon: '', title: '', description: '' }] } : s
        ));
    };

    const updateSectionItem = (sIdx: number, iIdx: number, patch: any) => {
        setSections(prev => prev.map((s, si) =>
            si === sIdx ? { ...s, items: s.items.map((it, ii) => ii === iIdx ? { ...it, ...patch } : it) } : s
        ));
    };

    const removeSectionItem = (sIdx: number, iIdx: number) => {
        setSections(prev => prev.map((s, si) =>
            si === sIdx ? { ...s, items: s.items.filter((_, ii) => ii !== iIdx) } : s
        ));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    const isToggling = enableMutation.isPending || disableMutation.isPending;
    const isUploading = uploadMutation.isPending;

    return (
        <div className="max-w-3xl space-y-5 pb-24">
            {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-600 font-medium">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* ─── Estado + URL ─── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <Globe size={16} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Landing Pública</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Página visible para tus pacientes</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={cn(
                            "relative w-14 h-7 rounded-full transition-colors",
                            landing?.enabled ? "bg-emerald-500" : "bg-slate-300"
                        )}
                    >
                        <span className={cn(
                            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform",
                            landing?.enabled ? "translate-x-7.5 left-0" : "left-0.5"
                        )} />
                    </button>
                </div>

                {/* Slug + URL */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">https://</span>
                        {slugEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    value={slugDraft}
                                    onChange={e => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="text-sm font-bold text-indigo-700 bg-white border border-indigo-300 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="mi-clinica"
                                    maxLength={30}
                                />
                                <span className="text-xs text-slate-400 font-bold">.{LANDING_DOMAIN}</span>
                                <button
                                    onClick={handleSaveSlug}
                                    disabled={slugMutation.isPending || !slugDraft}
                                    className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {slugMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Guardar'}
                                </button>
                                <button onClick={() => { setSlugEditing(false); setSlugDraft(slug); }} className="text-xs text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-bold text-indigo-700">{slug || 'sin-configurar'}</span>
                                <span className="text-xs text-slate-400 font-bold">.{LANDING_DOMAIN}</span>
                                <button onClick={() => setSlugEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-700 font-bold ml-2">
                                    Editar
                                </button>
                            </div>
                        )}
                    </div>
                    {publicUrl && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                {copied ? 'Copiado' : 'Copiar URL'}
                            </button>
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                <ExternalLink size={12} />
                                Abrir
                            </a>
                        </div>
                    )}
                </div>

                {landing?.enabled && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-600 text-xs font-bold">
                        <Eye size={14} />
                        Tu landing está publicada y visible
                    </div>
                )}
                {landing && !landing.enabled && landing.slug && (
                    <div className="mt-3 flex items-center gap-2 text-amber-500 text-xs font-bold">
                        <EyeOff size={14} />
                        Tu landing no está publicada
                    </div>
                )}
            </div>

            {/* ─── Identidad Visual ─── */}
            <SectionCard title="Identidad Visual" icon={ImageIcon}>
                <div className="grid grid-cols-2 gap-4">
                    {/* Logo */}
                    <div>
                        <FieldLabel label="Logo" hint="Recomendado: 200x200px, fondo transparente" />
                        <div className="relative w-full aspect-square max-w-[160px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                            {isUploading ? (
                                <Loader2 size={24} className="animate-spin text-indigo-400" />
                            ) : landing?.logoUrl ? (
                                <img src={landing.logoUrl} alt="Logo" className="w-full h-full object-contain p-3" />
                            ) : (
                                <ImageIcon size={28} className="text-slate-300" />
                            )}
                        </div>
                        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('logoUrl')} />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => logoRef.current?.click()} disabled={isUploading} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                <Upload size={12} className="inline mr-1" />{landing?.logoUrl ? 'Cambiar' : 'Subir'}
                            </button>
                            {landing?.logoUrl && (
                                <button onClick={() => handleRemoveImage('logoUrl')} className="text-xs font-bold text-rose-500 hover:text-rose-700">
                                    <Trash2 size={12} className="inline mr-1" />Eliminar
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Hero */}
                    <div>
                        <FieldLabel label="Imagen Hero" hint="Recomendado: 1200x600px, se muestra como fondo" />
                        <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                            {isUploading ? (
                                <Loader2 size={24} className="animate-spin text-indigo-400" />
                            ) : landing?.heroImageUrl ? (
                                <img src={landing.heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={28} className="text-slate-300" />
                            )}
                        </div>
                        <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload('heroImageUrl')} />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => heroRef.current?.click()} disabled={isUploading} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                                <Upload size={12} className="inline mr-1" />{landing?.heroImageUrl ? 'Cambiar' : 'Subir'}
                            </button>
                            {landing?.heroImageUrl && (
                                <button onClick={() => handleRemoveImage('heroImageUrl')} className="text-xs font-bold text-rose-500 hover:text-rose-700">
                                    <Trash2 size={12} className="inline mr-1" />Eliminar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <FieldLabel label="Título Principal" />
                    <input
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        placeholder="Cuidamos tu bienestar"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        maxLength={120}
                    />
                </div>
                <div>
                    <FieldLabel label="Subtítulo" />
                    <textarea
                        value={subheadline}
                        onChange={e => setSubheadline(e.target.value)}
                        placeholder="Atención profesional personalizada para toda la familia"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={2}
                        maxLength={300}
                    />
                </div>
            </SectionCard>

            {/* ─── CTA Principal ─── */}
            <SectionCard title="Botón Principal (CTA)" icon={Sparkles}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel label="Texto del Botón" />
                        <input
                            value={ctaText}
                            onChange={e => setCtaText(e.target.value)}
                            placeholder="Reservar turno"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            maxLength={50}
                        />
                    </div>
                    <div>
                        <FieldLabel label="Link del Botón" hint="URL completa o teléfono con wa.me" />
                        <input
                            value={ctaLink}
                            onChange={e => setCtaLink(e.target.value)}
                            placeholder="https://wa.me/5491112345678"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* ─── Secciones ─── */}
            <SectionCard title={`Secciones (${sections.length}/3)`} icon={GripVertical} defaultOpen={sections.length > 0}>
                {sections.map((sec, sIdx) => (
                    <div key={sIdx} className="bg-slate-50 rounded-xl p-4 space-y-3 relative">
                        <button
                            onClick={() => removeSection(sIdx)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <input
                            value={sec.title}
                            onChange={e => updateSection(sIdx, { title: e.target.value })}
                            placeholder="Título de la sección"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <textarea
                            value={sec.description}
                            onChange={e => updateSection(sIdx, { description: e.target.value })}
                            placeholder="Descripción"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={2}
                        />
                        {sec.items?.map((item, iIdx) => (
                            <div key={iIdx} className="flex gap-2 items-start">
                                <input
                                    value={item.title}
                                    onChange={e => updateSectionItem(sIdx, iIdx, { title: e.target.value })}
                                    placeholder="Título item"
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    value={item.description}
                                    onChange={e => updateSectionItem(sIdx, iIdx, { description: e.target.value })}
                                    placeholder="Descripción item"
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button onClick={() => removeSectionItem(sIdx, iIdx)} className="text-slate-400 hover:text-rose-500 mt-1">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {(sec.items?.length || 0) < 6 && (
                            <button onClick={() => addSectionItem(sIdx)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                <Plus size={12} /> Agregar item
                            </button>
                        )}
                    </div>
                ))}
                {sections.length < 3 && (
                    <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Agregar sección
                    </button>
                )}
            </SectionCard>

            {/* ─── Contacto ─── */}
            <SectionCard title="Información de Contacto" icon={Phone} defaultOpen={false}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel label="Teléfono" />
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={contact.phone || ''} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+54 11 1234-5678" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="Email" />
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={contact.email || ''} onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                                placeholder="contacto@clinica.com" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="WhatsApp" hint="Número sin + ni espacios" />
                        <div className="relative">
                            <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={contact.whatsapp || ''} onChange={e => setContact(p => ({ ...p, whatsapp: e.target.value }))}
                                placeholder="5491112345678" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="Instagram" hint="Solo el usuario, sin @" />
                        <div className="relative">
                            <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={contact.instagram || ''} onChange={e => setContact(p => ({ ...p, instagram: e.target.value }))}
                                placeholder="mi_clinica" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
                <div>
                    <FieldLabel label="Dirección" />
                    <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input value={contact.address || ''} onChange={e => setContact(p => ({ ...p, address: e.target.value }))}
                            placeholder="Av. Corrientes 1234, CABA" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </SectionCard>

            {/* ─── Tema ─── */}
            <SectionCard title="Colores del Tema" icon={Palette} defaultOpen={false}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FieldLabel label="Color Primario" />
                        <div className="flex items-center gap-3">
                            <input type="color" value={theme.primaryColor} onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                            <input value={theme.primaryColor} onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel label="Color Acento" />
                        <div className="flex items-center gap-3">
                            <input type="color" value={theme.accentColor} onChange={e => setTheme(p => ({ ...p, accentColor: e.target.value }))}
                                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                            <input value={theme.accentColor} onChange={e => setTheme(p => ({ ...p, accentColor: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ─── SEO ─── */}
            <SectionCard title="SEO y Redes Sociales" icon={Search} defaultOpen={false}>
                <div>
                    <FieldLabel label="Título SEO" hint="Aparece en la pestaña del navegador y en resultados de búsqueda" />
                    <input value={seo.title || ''} onChange={e => setSeo(p => ({ ...p, title: e.target.value }))}
                        placeholder="Mi Clínica - Atención profesional" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" maxLength={70} />
                </div>
                <div>
                    <FieldLabel label="Descripción SEO" hint="Aparece debajo del título en Google" />
                    <textarea value={seo.description || ''} onChange={e => setSeo(p => ({ ...p, description: e.target.value }))}
                        placeholder="Centro de salud especializado en..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} maxLength={160} />
                </div>
            </SectionCard>

            {/* ─── Powered by ─── */}
            <SectionCard title="Powered by Turnio" icon={Type} defaultOpen={false}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-700">Mostrar "Powered by Turnio"</p>
                        <p className="text-xs text-slate-400">Se muestra al pie de la landing pública</p>
                    </div>
                    <button
                        onClick={() => setPoweredBy(!poweredBy)}
                        className={cn(
                            "relative w-12 h-6 rounded-full transition-colors",
                            poweredBy ? "bg-indigo-500" : "bg-slate-300"
                        )}
                    >
                        <span className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                            poweredBy ? "left-6" : "left-0.5"
                        )} />
                    </button>
                </div>
            </SectionCard>

            {/* ─── Floating Save Bar ─── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 p-4 z-50 flex items-center justify-end gap-3">
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className={cn(
                        "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                        saveSuccess ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                    )}
                >
                    {updateMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : saveSuccess ? (
                        <><Check size={16} /> Guardado</>
                    ) : (
                        <><Save size={16} /> Guardar cambios</>
                    )}
                </button>
            </div>
        </div>
    );
}
