import prisma from '../lib/prisma';

export class SpecialtyService {
    async getAll(tenantId: string) {
        return prisma.specialty.findMany({
            where: { tenantId }
        });
    }

    async create(tenantId: string, data: { name: string }) {
        return prisma.specialty.create({
            data: {
                name: data.name,
                tenantId
            }
        });
    }

    async delete(tenantId: string, id: string) {
        // Check if used? For MVP, just try delete. 
        // Prisma will throw if foreign key constraints fail (potehtially) 
        // or we can just delete.
        // Professional has Specialty as relation. It will fail if used.

        // Ensure it belongs to tenant
        const specialty = await prisma.specialty.findFirst({ where: { id, tenantId } });
        if (!specialty) throw new Error('Specialty not found');

        return prisma.specialty.delete({
            where: { id }
        });
    }
}
