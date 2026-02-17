import prisma from '../lib/prisma';
import { CollectionStatus } from '@clinica/db';
import { addDays, isPast, startOfDay } from 'date-fns';

export class CollectionsService {
    async getAll(tenantId: string, filters: {
        status?: CollectionStatus;
        dueDateFrom?: string;
        dueDateTo?: string;
        appointmentDateFrom?: string;
        appointmentDateTo?: string;
        professionalId?: string;
        siteId?: string;
    }) {
        const where: any = { tenantId };

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.dueDateFrom || filters.dueDateTo) {
            where.dueDate = {};
            if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
            if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
        }

        if (filters.appointmentDateFrom || filters.appointmentDateTo) {
            where.appointment = {
                startTime: {}
            };
            if (filters.appointmentDateFrom) where.appointment.startTime.gte = new Date(filters.appointmentDateFrom);
            if (filters.appointmentDateTo) where.appointment.startTime.lte = new Date(filters.appointmentDateTo);
        }

        if (filters.professionalId) {
            where.appointment = { ...where.appointment, professionalId: filters.professionalId };
        }

        if (filters.siteId) {
            where.appointment = { ...where.appointment, siteId: filters.siteId };
        }

        // 1. Fetch PENDING collections and update status to OVERDUE if needed
        const pendingToCheck = await prisma.appointmentCollection.findMany({
            where: {
                tenantId,
                status: CollectionStatus.PENDING,
                dueDate: { lt: startOfDay(new Date()) }
            }
        });

        if (pendingToCheck.length > 0) {
            await prisma.appointmentCollection.updateMany({
                where: { id: { in: pendingToCheck.map(c => c.id) } },
                data: { status: CollectionStatus.OVERDUE }
            });
        }

        const collections = await prisma.appointmentCollection.findMany({
            where,
            include: {
                appointment: {
                    include: {
                        patient: { select: { firstName: true, lastName: true } },
                        professional: {
                            include: { tenantUser: { include: { user: { select: { fullName: true } } } } }
                        },
                        site: { select: { name: true } }
                    }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        return collections;
    }

    async getKPIs(tenantId: string, range?: { from: string; to: string }) {
        const now = startOfDay(new Date());

        // 1. Total Pending (Pending + Overdue)
        const pending = await prisma.appointmentCollection.aggregate({
            where: { tenantId, status: CollectionStatus.PENDING },
            _sum: { amountDueArsInt: true },
            _count: { id: true }
        });

        // 2. Total Overdue
        const overdue = await prisma.appointmentCollection.aggregate({
            _sum: { amountDueArsInt: true },
            _count: { id: true },
            where: { tenantId, status: CollectionStatus.OVERDUE }
        });

        // 3. Paid in range (or total if no range)
        const paidWhere: any = { tenantId, status: CollectionStatus.PAID };
        if (range) {
            paidWhere.paidAt = {
                gte: new Date(range.from),
                lte: new Date(range.to)
            };
        }
        const paid = await prisma.appointmentCollection.aggregate({
            where: paidWhere,
            _sum: { amountDueArsInt: true },
            _count: { id: true }
        });

        return {
            pending: { count: pending._count.id, total: pending._sum.amountDueArsInt || 0 },
            overdue: { count: overdue._count.id, total: overdue._sum.amountDueArsInt || 0 },
            paid: { count: paid._count.id, total: paid._sum.amountDueArsInt || 0 }
        };
    }

    async markAsPaid(tenantId: string, appointmentId: string, data: { paidAt: string; notes?: string; userId: string }) {
        return prisma.appointmentCollection.update({
            where: { appointmentId },
            data: {
                status: CollectionStatus.PAID,
                paidAt: new Date(data.paidAt),
                notes: data.notes,
                updatedByUserId: data.userId
            }
        });
    }

    async updateDueDate(tenantId: string, appointmentId: string, dueDate: string, userId: string) {
        return prisma.appointmentCollection.update({
            where: { appointmentId },
            data: {
                dueDate: new Date(dueDate),
                updatedByUserId: userId,
                // If new due date is in future and was OVERDUE, set back to PENDING?
                // Requirement doesn't specify, but it's logical.
                status: isPast(new Date(dueDate)) ? CollectionStatus.OVERDUE : CollectionStatus.PENDING
            }
        });
    }

    /**
     * Creates a collection entry for an appointment.
     * To be used during creation or backfill.
     */
    async createForAppointment(tenantId: string, appointment: { id: string; priceArsInt: number; startTime: Date }) {
        return prisma.appointmentCollection.create({
            data: {
                tenantId,
                appointmentId: appointment.id,
                amountDueArsInt: appointment.priceArsInt,
                dueDate: addDays(appointment.startTime, 90),
                status: CollectionStatus.PENDING
            }
        });
    }
}
