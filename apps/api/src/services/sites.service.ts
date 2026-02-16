import prisma from '../lib/prisma';
import { Site } from '@clinica/db';

export class SiteService {
    async getAll(tenantId: string) {
        return prisma.site.findMany({
            where: { tenantId, active: true },
            include: { boxes: true } // Include boxes by default for now
        });
    }

    async getById(tenantId: string, id: string) {
        return prisma.site.findFirst({
            where: { id, tenantId }
        });
    }

    async create(tenantId: string, data: { name: string; address?: string; phone?: string }) {
        return prisma.site.create({
            data: {
                ...data,
                tenantId
            }
        });
    }

    async update(tenantId: string, id: string, data: { name?: string; address?: string; phone?: string; active?: boolean }) {
        // Ensure site belongs to tenant
        const site = await prisma.site.findFirst({ where: { id, tenantId } });
        if (!site) throw new Error('Site not found');

        return prisma.site.update({
            where: { id },
            data
        });
    }

    async delete(tenantId: string, id: string) {
        // Soft delete usually preferred
        return this.update(tenantId, id, { active: false });
    }
}
