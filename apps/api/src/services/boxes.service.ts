import prisma from '../lib/prisma';

export class BoxService {
    async getAll(tenantId: string, siteId?: string) {
        return prisma.box.findMany({
            where: {
                // We can filter by site if provided, but always verify site belongs to tenant if we did strict checks.
                // For now, simpler: join site and filtering by tenantId is safest or relying on siteId input correctness?
                // Better: ensure the box's site belongs to the tenant.
                site: {
                    tenantId
                },
                ...(siteId ? { siteId } : {}),
                active: true
            },
            include: { site: true }
        });
    }

    async getById(tenantId: string, id: string) {
        return prisma.box.findFirst({
            where: {
                id,
                site: { tenantId }
            },
            include: { site: true }
        });
    }

    async create(tenantId: string, data: { name: string; siteId: string }) {
        // Verify site belongs to tenant
        const site = await prisma.site.findFirst({ where: { id: data.siteId, tenantId } });
        if (!site) throw new Error('Site not found or access denied');

        return prisma.box.create({
            data: {
                name: data.name,
                siteId: data.siteId
            }
        });
    }

    async update(tenantId: string, id: string, data: { name?: string; active?: boolean }) {
        const box = await prisma.box.findFirst({
            where: { id, site: { tenantId } }
        });

        if (!box) throw new Error('Box not found');

        return prisma.box.update({
            where: { id },
            data
        });
    }

    async delete(tenantId: string, id: string) {
        return this.update(tenantId, id, { active: false });
    }
}
