import prisma from '../lib/prisma';
import { CollectionStatus } from '@clinica/db';
import { addDays } from 'date-fns';

export class BackfillService {
    async runBackfill(userId: string) {
        const tenants = await prisma.tenant.findMany();
        let totalAppointmentsUpdated = 0;

        for (const tenant of tenants) {
            // 1. Ensure initial price version for tenant
            let priceVersion = await prisma.appointmentPriceVersion.findFirst({
                where: { tenantId: tenant.id, isActive: true },
                orderBy: { effectiveFrom: 'desc' }
            });

            if (!priceVersion) {
                priceVersion = await prisma.appointmentPriceVersion.create({
                    data: {
                        tenantId: tenant.id,
                        priceArsInt: 30000,
                        createdByUserId: userId,
                        effectiveFrom: new Date('2020-01-01'), // Far in the past
                        isActive: true
                    }
                });
            }

            // 2. Find appointments without priceArsInt
            const appointments = await prisma.appointment.findMany({
                where: {
                    tenantId: tenant.id,
                    priceArsInt: null
                }
            });

            for (const app of appointments) {
                await prisma.$transaction(async (tx) => {
                    await tx.appointment.update({
                        where: { id: app.id },
                        data: {
                            priceArsInt: priceVersion!.priceArsInt,
                            priceVersionId: priceVersion!.id
                        }
                    });

                    // Ensure collection exists
                    const existingCollection = await tx.appointmentCollection.findUnique({
                        where: { appointmentId: app.id }
                    });

                    if (!existingCollection) {
                        await tx.appointmentCollection.create({
                            data: {
                                tenantId: tenant.id,
                                appointmentId: app.id,
                                amountDueArsInt: priceVersion!.priceArsInt,
                                dueDate: addDays(app.startTime, 90),
                                status: CollectionStatus.PENDING
                            }
                        });
                    }
                });
                totalAppointmentsUpdated++;
            }
        }

        return { message: 'Backfill completed', totalAppointmentsUpdated };
    }
}
