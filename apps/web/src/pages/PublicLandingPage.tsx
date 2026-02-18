import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicLanding } from '../hooks/useLanding';
import { Loader2, Phone, Mail, MapPin, MessageCircle, Instagram, Menu, X, Calendar, Grid3X3 } from 'lucide-react';
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

function highlightAccentWord(text: string, accentWord?: string | null, color?: string) {
    if (!accentWord || !text.toLowerCase().includes(accentWord.toLowerCase())) {
        return <>{text}</>;
    }
    const idx = text.toLowerCase().indexOf(accentWord.toLowerCase());
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + accentWord.length);
    const after = text.slice(idx + accentWord.length);
    return (
        <>
            {before}
            <span style={{ color: color || '#4F46E5' }}>{match}</span>
            {after}
        </>
    );
}

/* ─── NAVBAR ─── */
function Navbar({ logoUrl, orgName, sections, primaryColor, ctaText, ctaLink, loginUrl }: {
    logoUrl?: string | null; orgName: string; sections: LandingSection[];
    primaryColor: string; ctaText?: string | null; ctaLink?: string | null; loginUrl?: string | null;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Inicio', href: '#inicio' },
        ...sections.map((s, i) => ({ label: s.title, href: `#seccion-${i}` })),
        { label: 'Contacto', href: '#contacto' },
    ].filter(n => n.label);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <a href="#inicio" className="flex items-center gap-3 shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt={orgName} className="h-10 md:h-12 w-auto object-contain" />
                        ) : (
                            <span className="text-lg font-black tracking-tight" style={{ color: primaryColor }}>{orgName}</span>
                        )}
                    </a>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item, i) => (
                            <a key={i} href={item.href}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
                                {item.label.toUpperCase()}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {ctaText && ctaLink && (
                            <a href={ctaLink} target="_blank" rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
                                style={{ backgroundColor: primaryColor }}>
                                {ctaText}
                            </a>
                        )}
                        {loginUrl && (
                            <a href={loginUrl} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                INGRESAR
                            </a>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600">
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
                    {navItems.map((item, i) => (
                        <a key={i} href={item.href} onClick={() => setMobileOpen(false)}
                            className="block px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg">
                            {item.label}
                        </a>
                    ))}
                    {ctaText && ctaLink && (
                        <a href={ctaLink} target="_blank" rel="noopener noreferrer"
                            className="block px-4 py-3 text-sm font-bold text-white rounded-xl text-center mt-2"
                            style={{ backgroundColor: primaryColor }}>
                            {ctaText}
                        </a>
                    )}
                </div>
            )}
        </header>
    );
}

/* ─── HERO ─── */
function HeroSection({ headline, subheadline, heroImageUrl, theme, ctaText, ctaLink }: {
    headline?: string | null; subheadline?: string | null; heroImageUrl?: string | null;
    theme: LandingTheme; ctaText?: string | null; ctaLink?: string | null;
}) {
    const { primaryColor, accentColor, badgeText, accentWord, secondaryCtaText, secondaryCtaLink } = theme;

    return (
        <section id="inicio" className="pt-20 md:pt-24 pb-16 md:pb-24 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: text */}
                    <div className="order-2 lg:order-1">
                        {badgeText && (
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor || primaryColor }} />
                                {badgeText}
                            </span>
                        )}

                        {headline && (
                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                                {highlightAccentWord(headline, accentWord, accentColor || primaryColor)}
                            </h1>
                        )}

                        {subheadline && (
                            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                                {subheadline}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            {ctaText && ctaLink && (
                                <a href={ctaLink} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                                    style={{ backgroundColor: primaryColor }}>
                                    <Calendar size={16} />
                                    {ctaText}
                                </a>
                            )}
                            {secondaryCtaText && secondaryCtaLink && (
                                <a href={secondaryCtaLink}
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-slate-50"
                                    style={{ borderColor: `${primaryColor}30`, color: primaryColor }}>
                                    <Grid3X3 size={16} />
                                    {secondaryCtaText}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right: image */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                        {heroImageUrl ? (
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl" style={{ backgroundColor: primaryColor }} />
                                <img
                                    src={heroImageUrl}
                                    alt="Hero"
                                    className="relative rounded-2xl shadow-2xl w-full max-w-lg object-cover aspect-[4/3]"
                                    loading="eager"
                                />
                            </div>
                        ) : (
                            <div className="w-full max-w-lg aspect-[4/3] rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}10` }}>
                                <div className="text-center opacity-40">
                                    <Calendar size={48} style={{ color: primaryColor }} className="mx-auto mb-2" />
                                    <p className="text-sm font-bold" style={{ color: primaryColor }}>Tu imagen aquí</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── CONTENT SECTION ─── */
function ContentSection({ section, index, theme }: { section: LandingSection; index: number; theme: LandingTheme }) {
    const { primaryColor } = theme;
    const isAlt = index % 2 !== 0;

    return (
        <section id={`seccion-${index}`} className={`py-20 md:py-28 ${isAlt ? 'bg-slate-50/70' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {section.title && (
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-4 tracking-tight">
                        {section.title}
                    </h2>
                )}
                {section.description && (
                    <p className="text-slate-500 text-center max-w-2xl mx-auto mb-14 text-lg leading-relaxed">
                        {section.description}
                    </p>
                )}
                {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map((item, i) => (
                            <div key={i} className="group bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-lg transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: primaryColor }}>
                                    {item.icon || String.fromCodePoint(0x2726)}
                                </div>
                                {item.title && (
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                                )}
                                {item.description && (
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── CONTACT ─── */
function ContactSection({ contact, theme, orgName }: { contact: LandingContact; theme: LandingTheme; orgName: string }) {
    const { primaryColor } = theme;
    const hasAny = contact.phone || contact.email || contact.address || contact.whatsapp || contact.instagram;
    if (!hasAny) return null;

    const items = [
        contact.phone && { icon: <Phone size={20} />, label: 'Teléfono', value: contact.phone, href: `tel:${contact.phone}` },
        contact.email && { icon: <Mail size={20} />, label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
        contact.whatsapp && { icon: <MessageCircle size={20} />, label: 'WhatsApp', value: 'Enviar mensaje', href: `https://wa.me/${contact.whatsapp}` },
        contact.instagram && { icon: <Instagram size={20} />, label: 'Instagram', value: `@${contact.instagram}`, href: `https://instagram.com/${contact.instagram}` },
    ].filter(Boolean) as { icon: JSX.Element; label: string; value: string; href: string }[];

    return (
        <section id="contacto" className="py-20 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center mb-4 tracking-tight">Contacto</h2>
                <p className="text-slate-500 text-center max-w-xl mx-auto mb-14 text-lg">
                    Comunicate con {orgName}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {items.map((item, i) => (
                        <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-3 bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all text-center group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                                style={{ backgroundColor: primaryColor }}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">{item.label}</p>
                                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                            </div>
                        </a>
                    ))}
                </div>

                {contact.address && (
                    <div className="flex items-center justify-center gap-2 mt-10 text-slate-500">
                        <MapPin size={18} style={{ color: primaryColor }} />
                        <span className="text-sm font-medium">{contact.address}</span>
                    </div>
                )}
            </div>
        </section>
    );
}

/* ─── FOOTER ─── */
function Footer({ poweredBy, orgName }: { poweredBy: boolean; orgName: string }) {
    return (
        <footer className="py-10 px-6 bg-slate-900">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-400 text-sm font-medium">
                    &copy; {new Date().getFullYear()} {orgName}. Todos los derechos reservados.
                </p>
                {poweredBy && (
                    <p className="text-slate-500 text-xs">
                        Powered by <span className="font-bold text-slate-400">Turnio</span>
                    </p>
                )}
            </div>
        </footer>
    );
}

/* ─── WHATSAPP FLOAT ─── */
function WhatsAppFloat({ whatsapp }: { whatsapp?: string | null }) {
    if (!whatsapp) return null;
    return (
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110"
            aria-label="WhatsApp">
            <MessageCircle size={26} />
        </a>
    );
}

/* ─── PAGES ─── */
function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="text-center">
                <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
                <p className="text-slate-500 text-lg font-medium mb-8">Esta página no existe o no está publicada.</p>
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
    const theme: LandingTheme = {
        primaryColor: '#4F46E5',
        accentColor: '#06B6D4',
        ...(landing.theme || {}),
    };
    const orgName = (landing as any).tenant?.name || '';

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                logoUrl={landing.logoUrl}
                orgName={orgName}
                sections={sections}
                primaryColor={theme.primaryColor}
                ctaText={landing.primaryCtaText}
                ctaLink={landing.primaryCtaLink}
                loginUrl={theme.loginUrl}
            />

            <HeroSection
                headline={landing.headline}
                subheadline={landing.subheadline}
                heroImageUrl={landing.heroImageUrl}
                theme={theme}
                ctaText={landing.primaryCtaText}
                ctaLink={landing.primaryCtaLink}
            />

            {sections.map((sec, i) => (
                <ContentSection key={i} section={sec} index={i} theme={theme} />
            ))}

            {(contact.phone || contact.email || contact.whatsapp || contact.instagram || contact.address) && (
                <ContactSection contact={contact} theme={theme} orgName={orgName} />
            )}

            <Footer poweredBy={landing.poweredByEnabled} orgName={orgName} />

            <WhatsAppFloat whatsapp={contact.whatsapp} />
        </div>
    );
}
