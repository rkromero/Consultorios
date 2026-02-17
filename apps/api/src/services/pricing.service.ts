import prisma from '../lib/prisma';

export class PricingService {
    async getCurrentPrice(tenantId: string) {
        // Get the latest active price version
        const currentVersion = await prisma.appointmentPriceVersion.findFirst({
            where: { tenantId, isActive: true },
            orderBy: { effectiveFrom: 'desc' }
        });

        return currentVersion;
    }

    async createPriceVersion(tenantId: string, priceArsInt: number, userId: string) {
        // We'll just create a new one with now() as effectiveFrom.
        return prisma.appointmentPriceVersion.create({
            data: {
                tenantId,
                priceArsInt,
                createdByUserId: userId,
                effectiveFrom: new Date(),
                isActive: true
            }
        });
    }

    async getPriceHistory(tenantId: string) {
        return prisma.appointmentPriceVersion.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    /**
     * Ensures an initial price version exists for a tenant.
     * To be used during backfill or when a new tenant is created.
     */
    async ensureInitialPrice(tenantId: string, userId: string) {
        const existing = await this.getCurrentPrice(tenantId);
        if (!existing) {
            return this.createPriceVersion(tenantId, 30000, userId);
        }
        return existing;
    }
}
