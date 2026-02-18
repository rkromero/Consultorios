import prisma from '../lib/prisma';
import { uploadImage, deleteImage } from './cloudinary.service';

const RESERVED_SLUGS = new Set([
    'www', 'api', 'admin', 'app', 'mail', 'static', 'assets',
    'support', 'help', 'login', 'register', 'dashboard', 'billing',
    'status', 'docs', 'blog', 'cdn', 'ftp', 'smtp', 'pop', 'imap',
]);

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlug(slug: string): string {
    const clean = slug.toLowerCase().trim();
    if (clean.length < 3 || clean.length > 30) {
        throw new Error('El slug debe tener entre 3 y 30 caracteres.');
    }
    if (!SLUG_REGEX.test(clean)) {
        throw new Error('El slug solo puede contener letras minúsculas, números y guiones.');
    }
    if (RESERVED_SLUGS.has(clean)) {
        throw new Error(`El slug "${clean}" está reservado y no puede usarse.`);
    }
    return clean;
}

function sanitizeText(text: string | null | undefined): string | null {
    if (!text) return null;
    return text.replace(/<[^>]*>/g, '').trim();
}

function sanitizeSections(sections: any): any {
    if (!Array.isArray(sections)) return null;
    return sections.slice(0, 3).map((s: any) => ({
        title: sanitizeText(s.title) || '',
        description: sanitizeText(s.description) || '',
        items: Array.isArray(s.items)
            ? s.items.slice(0, 6).map((item: any) => ({
                icon: sanitizeText(item.icon) || '',
                title: sanitizeText(item.title) || '',
                description: sanitizeText(item.description) || '',
            }))
            : [],
    }));
}

function sanitizeContact(contact: any): any {
    if (!contact || typeof contact !== 'object') return null;
    return {
        phone: sanitizeText(contact.phone),
        email: sanitizeText(contact.email),
        address: sanitizeText(contact.address),
        whatsapp: sanitizeText(contact.whatsapp),
        instagram: sanitizeText(contact.instagram),
    };
}

export class LandingService {

    async getByTenant(tenantId: string) {
        const landing = await prisma.landingPage.findUnique({
            where: { tenantId },
        });
        return landing;
    }

    async getBySlug(slug: string) {
        const landing = await prisma.landingPage.findUnique({
            where: { slug },
            include: {
                tenant: { select: { name: true } },
            },
        });
        if (!landing || !landing.enabled) return null;
        return landing;
    }

    async upsert(tenantId: string, data: any, userId: string) {
        const existing = await prisma.landingPage.findUnique({ where: { tenantId } });

        const slug = data.slug ? validateSlug(data.slug) : undefined;

        if (slug) {
            const conflict = await prisma.landingPage.findUnique({ where: { slug } });
            if (conflict && conflict.tenantId !== tenantId) {
                throw new Error(`El slug "${slug}" ya está en uso por otra organización.`);
            }
        }

        const payload = {
            headline: sanitizeText(data.headline),
            subheadline: sanitizeText(data.subheadline),
            primaryCtaText: sanitizeText(data.primaryCtaText),
            primaryCtaLink: sanitizeText(data.primaryCtaLink),
            sections: data.sections !== undefined ? sanitizeSections(data.sections) : undefined,
            contact: data.contact !== undefined ? sanitizeContact(data.contact) : undefined,
            theme: data.theme ?? undefined,
            seo: data.seo ?? undefined,
            poweredByEnabled: typeof data.poweredByEnabled === 'boolean' ? data.poweredByEnabled : undefined,
            updatedByUserId: userId,
        };

        if (existing) {
            return prisma.landingPage.update({
                where: { tenantId },
                data: {
                    ...payload,
                    ...(slug ? { slug } : {}),
                },
            });
        }

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
        const defaultSlug = slug || validateSlug(tenant?.slug || tenantId.slice(0, 8));

        const slugConflict = await prisma.landingPage.findUnique({ where: { slug: defaultSlug } });
        if (slugConflict) {
            throw new Error(`El slug "${defaultSlug}" ya está en uso. Elegí uno diferente.`);
        }

        return prisma.landingPage.create({
            data: {
                tenantId,
                slug: defaultSlug,
                enabled: false,
                ...payload,
            },
        });
    }

    async setEnabled(tenantId: string, enabled: boolean, userId: string) {
        const existing = await prisma.landingPage.findUnique({ where: { tenantId } });
        if (!existing) throw new Error('Landing page no encontrada. Guardá el contenido primero.');

        if (enabled && !existing.headline) {
            throw new Error('Completá al menos el título principal antes de publicar.');
        }

        return prisma.landingPage.update({
            where: { tenantId },
            data: { enabled, updatedByUserId: userId },
        });
    }

    async updateSlug(tenantId: string, newSlug: string, userId: string) {
        const slug = validateSlug(newSlug);

        const conflict = await prisma.landingPage.findUnique({ where: { slug } });
        if (conflict && conflict.tenantId !== tenantId) {
            throw new Error(`El slug "${slug}" ya está en uso por otra organización.`);
        }

        const existing = await prisma.landingPage.findUnique({ where: { tenantId } });
        if (!existing) throw new Error('Landing page no encontrada. Guardá el contenido primero.');

        return prisma.landingPage.update({
            where: { tenantId },
            data: { slug, updatedByUserId: userId },
        });
    }

    async uploadImage(tenantId: string, imageDataUrl: string, field: 'logoUrl' | 'heroImageUrl', userId: string) {
        const existing = await prisma.landingPage.findUnique({ where: { tenantId } });

        if (existing && existing[field]) {
            await deleteImage(existing[field]!);
        }

        const folder = `${tenantId}/${field === 'logoUrl' ? 'logo' : 'hero'}`;
        const url = await uploadImage(imageDataUrl, folder);

        if (!existing) {
            const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
            const slug = validateSlug(tenant?.slug || tenantId.slice(0, 8));
            return prisma.landingPage.create({
                data: {
                    tenantId,
                    slug,
                    enabled: false,
                    [field]: url,
                    updatedByUserId: userId,
                },
            });
        }

        return prisma.landingPage.update({
            where: { tenantId },
            data: { [field]: url, updatedByUserId: userId },
        });
    }

    async removeImage(tenantId: string, field: 'logoUrl' | 'heroImageUrl', userId: string) {
        const existing = await prisma.landingPage.findUnique({ where: { tenantId } });
        if (!existing) throw new Error('Landing page no encontrada.');

        if (existing[field]) {
            await deleteImage(existing[field]!);
        }

        return prisma.landingPage.update({
            where: { tenantId },
            data: { [field]: null, updatedByUserId: userId },
        });
    }
}
