import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class PatientService {
    async getAll(tenantId: string, search?: string, page = 1, limit = 20, professionalId?: string) {
        const skip = (page - 1) * limit;

        const where: Prisma.PatientWhereInput = {
            tenantId,
            ...(search ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { dni: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : {}),
            ...(professionalId ? {
                appointments: {
                    some: { professionalId }
                }
            } : {})
        };

        const [total, items] = await Promise.all([
            prisma.patient.count({ where }),
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getById(tenantId: string, id: string) {
        return prisma.patient.findFirst({
            where: { id, tenantId },
            include: {
                appointments: {
                    take: 5,
                    orderBy: { startTime: 'desc' }
                }
            }
        });
    }

    async create(tenantId: string, data: any) {
        // Clean data: convert empty strings to null
        const cleanData: any = {};
        for (const [key, value] of Object.entries(data)) {
            cleanData[key] = value === '' ? null : value;
        }

        // Check DNI uniqueness in tenant
        const existing = await prisma.patient.findFirst({
            where: { tenantId, dni: String(cleanData.dni) }
        });

        if (existing) {
            throw new Error('Un paciente con este DNI ya existe en la organización');
        }

        return prisma.patient.create({
            data: {
                ...cleanData,
                tenantId
            }
        });
    }

    async update(tenantId: string, id: string, data: any) {
        const patient = await prisma.patient.findFirst({ where: { id, tenantId } });
        if (!patient) throw new Error('Patient not found');

        // If changing DNI, check collision
        if (data.dni && data.dni !== patient.dni) {
            const existing = await prisma.patient.findFirst({
                where: { tenantId, dni: data.dni }
            });
            if (existing) throw new Error('DNI ya registrado');
        }

        return prisma.patient.update({
            where: { id },
            data
        });
    }
}
