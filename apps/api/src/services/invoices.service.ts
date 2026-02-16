import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class InvoiceService {
    async getAll(tenantId: string, params: { patientId?: string; status?: string; startDate?: Date; endDate?: Date }) {
        const where: Prisma.InvoiceWhereInput = {
            tenantId,
        };

        if (params.patientId) where.patientId = params.patientId;
        if (params.status) where.status = params.status;
        if (params.startDate && params.endDate) {
            where.createdAt = {
                gte: params.startDate,
                lte: params.endDate
            };
        }

        return prisma.invoice.findMany({
            where,
            include: {
                patient: {
                    select: { firstName: true, lastName: true, dni: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(tenantId: string, data: {
        patientId: string;
        amount: number;
        concept: string;
        status: string;
        paymentMethod?: string;
    }) {
        return prisma.invoice.create({
            data: {
                tenantId,
                patientId: data.patientId,
                amount: data.amount,
                concept: data.concept,
                status: data.status,
                paymentMethod: data.paymentMethod
            }
        });
    }

    async update(tenantId: string, id: string, data: { status?: string; paymentMethod?: string }) {
        return prisma.invoice.update({
            where: { id, tenantId },
            data
        });
    }

    async getStats(tenantId: string) {
        // Simple stats for dashboard
        const totalRevenue = await prisma.invoice.aggregate({
            where: { tenantId, status: 'PAID' },
            _sum: { amount: true }
        });

        const countByStatus = await prisma.invoice.groupBy({
            by: ['status'],
            where: { tenantId },
            _count: { id: true }
        });

        return {
            revenue: totalRevenue._sum.amount || 0,
            counts: countByStatus
        };
    }
}
