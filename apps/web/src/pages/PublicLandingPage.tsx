import { useParams } from 'react-router-dom';
import { usePublicLanding } from '../hooks/useLanding';
import { Loader2, Phone, Mail, MapPin, MessageCircle, Instagram, ExternalLink } from 'lucide-react';
import type { LandingSection, LandingContact, LandingTheme } from '../api/landing.api';

function getSlugFromHostname(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
    if (hostname.endsWith('.up.railway.app')) return null;
    if (parts.length < 3) return null;

    return parts[0];
}

export function useSubdomainSlug(): string | null {
    return getSlugFromHostname();
}

function HeroSection({ headline, subheadline, heroImageUrl, logoUrl, ctaText, ctaLink, theme }: {
    headline?: string | null; subheadline?: string | null; heroImageUrl?: string | null;
    logoUrl?: string | null; ctaText?: string | null; ctaLink?: string | null; theme?: LandingTheme | null;
}) {
    const primaryColor = theme?.primaryColor || '#4F46E5';

    return (
        <section
            className="relative min-h-[80vh] flex items-center justify-center px-6 py-20"
            style={{
                background: heroImageUrl
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${heroImageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            }}
        >
            <div className="relative z-10 text-center max-w-3xl mx-auto">
                {logoUrl && (
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-20 h-20 md:w-24 md:h-24 object-contain mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur p-2"
                        loading="eager"
                    />
                )}
                {headline && (
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                        {headline}
                    </h1>
                )}
                {subheadline && (
                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        {subheadline}
                    </p>
                )}
                {ctaText && ctaLink && (
                    <a
                        href={ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                        style={{ backgroundColor: '#fff', color: primaryColor }}
                    >
                        {ctaText}
                        <ExternalLink size={18} />
                    </a>
                )}
            </div>
        </section>
    );
}

function ContentSection({ section, index, theme }: { section: LandingSection; index: number; theme?: LandingTheme | null }) {
    const primaryColor = theme?.primaryColor || '#4F46E5';
    const isAlt = index % 2 !== 0;

    return (
        <section className={`py-16 md:py-24 px-6 ${isAlt ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="max-w-5xl mx-auto">
                {section.title && (
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center mb-4 tracking-tight">
                        {section.title}
                    </h2>
                )}
                {section.description && (
                    <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
                        {section.description}
                    </p>
                )}
                {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-sm"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {item.icon || (i + 1)}
                                </div>
                                {item.title && <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>}
                                {item.description && <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ContactSection({ contact, theme }: { contact: LandingContact; theme?: LandingTheme | null }) {
    const primaryColor = theme?.primaryColor || '#4F46E5';
    const hasAny = contact.phone || contact.email || contact.address || contact.whatsapp || contact.instagram;
    if (!hasAny) return null;

    return (
        <section className="py-16 md:py-24 px-6 bg-slate-50">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-12 tracking-tight">Contacto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                <Phone size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">Teléfono</p>
                                <p className="text-sm font-semibold text-slate-700">{contact.phone}</p>
                            </div>
                        </a>
                    )}
                    {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                <Mail size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                <p className="text-sm font-semibold text-slate-700">{contact.email}</p>
                            </div>
                        </a>
                    )}
                    {contact.whatsapp && (
                        <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
                                <MessageCircle size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">WhatsApp</p>
                                <p className="text-sm font-semibold text-slate-700">Enviar mensaje</p>
                            </div>
                        </a>
                    )}
                    {contact.instagram && (
                        <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                <Instagram size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">Instagram</p>
                                <p className="text-sm font-semibold text-slate-700">@{contact.instagram}</p>
                            </div>
                        </a>
                    )}
                </div>
                {contact.address && (
                    <div className="flex items-center justify-center gap-2 mt-8 text-slate-500">
                        <MapPin size={16} />
                        <span className="text-sm font-medium">{contact.address}</span>
                    </div>
                )}
            </div>
        </section>
    );
}

function Footer({ poweredBy, orgName }: { poweredBy: boolean; orgName: string }) {
    return (
        <footer className="py-8 px-6 bg-slate-900 text-center">
            <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} {orgName}. Todos los derechos reservados.
            </p>
            {poweredBy && (
                <p className="text-slate-500 text-xs mt-2">
                    Powered by <span className="font-bold text-slate-400">Turnio</span>
                </p>
            )}
        </footer>
    );
}

function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="text-center">
                <h1 className="text-6xl font-black text-slate-300 mb-4">404</h1>
                <p className="text-slate-500 text-lg font-medium mb-8">Esta página no existe o no está publicada.</p>
                <a href="https://turnio.app" className="text-indigo-600 font-bold hover:underline">
                    Ir a Turnio
                </a>
            </div>
        </div>
    );
}

function LoadingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
    );
}

export function PublicLandingByPath() {
    const { slug } = useParams<{ slug: string }>();
    if (!slug) return <NotFoundPage />;
    return <PublicLandingPage slug={slug} />;
}

export default function PublicLandingPage({ slug }: { slug: string }) {
    const { data: landing, isLoading, isError } = usePublicLanding(slug);

    if (isLoading) return <LoadingPage />;
    if (isError || !landing) return <NotFoundPage />;

    const sections = (landing.sections || []) as LandingSection[];
    const contact = (landing.contact || {}) as LandingContact;
    const theme = (landing.theme || null) as LandingTheme | null;
    const orgName = (landing as any).tenant?.name || '';

    return (
        <div className="min-h-screen">
            <HeroSection
                headline={landing.headline}
                subheadline={landing.subheadline}
                heroImageUrl={landing.heroImageUrl}
                logoUrl={landing.logoUrl}
                ctaText={landing.primaryCtaText}
                ctaLink={landing.primaryCtaLink}
                theme={theme}
            />

            {sections.map((sec, i) => (
                <ContentSection key={i} section={sec} index={i} theme={theme} />
            ))}

            <ContactSection contact={contact} theme={theme} />

            <Footer poweredBy={landing.poweredByEnabled} orgName={orgName} />
        </div>
    );
}
