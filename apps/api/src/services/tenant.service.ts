import prisma from '../lib/prisma';

export class TenantService {
    async getInfo(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                name: true,
                slug: true,
                config: true,
            }
        });

        if (!tenant) throw new Error('Organización no encontrada');

        const config = (tenant.config as any) || {};
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            logoUrl: config.logoUrl || null,
        };
    }

    async updateName(tenantId: string, name: string) {
        if (!name || name.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: { name: name.trim() },
            select: { id: true, name: true, config: true }
        });

        const config = (tenant.config as any) || {};
        return {
            id: tenant.id,
            name: tenant.name,
            logoUrl: config.logoUrl || null,
        };
    }

    async updateLogo(tenantId: string, logoDataUrl: string) {
        const maxSize = 300 * 1024; // 300KB in base64
        if (logoDataUrl.length > maxSize) {
            throw new Error('El logo es demasiado grande. Máximo 200KB.');
        }

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error('Organización no encontrada');

        const existingConfig = (tenant.config as any) || {};
        const newConfig = { ...existingConfig, logoUrl: logoDataUrl };

        const updated = await prisma.tenant.update({
            where: { id: tenantId },
            data: { config: newConfig },
            select: { id: true, name: true, config: true }
        });

        return {
            id: updated.id,
            name: updated.name,
            logoUrl: (updated.config as any)?.logoUrl || null,
        };
    }

    async removeLogo(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error('Organización no encontrada');

        const existingConfig = (tenant.config as any) || {};
        delete existingConfig.logoUrl;

        const updated = await prisma.tenant.update({
            where: { id: tenantId },
            data: { config: Object.keys(existingConfig).length > 0 ? existingConfig : undefined },
            select: { id: true, name: true, config: true }
        });

        return {
            id: updated.id,
            name: updated.name,
            logoUrl: null,
        };
    }
}
