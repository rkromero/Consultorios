import prisma from '../lib/prisma';
import { AppointmentStatus, AppointmentType } from '@clinica/db';

export class AppointmentService {
    async getAll(tenantId: string, params: {
        start?: Date;
        end?: Date;
        professionalId?: string;
        patientId?: string;
        siteId?: string;
    }) {
        const where: any = {
            tenantId,
            status: { not: AppointmentStatus.CANCELLED } // By default hide cancelled? Or show them? Let's show all if specific filter not applied, but for calendar generally we want active.
            // Actually standard convention: return all, let frontend filter or provide status filter.
        };

        if (params.start && params.end) {
            where.startTime = {
                gte: params.start,
                lt: params.end
            };
        }

        if (params.professionalId) where.professionalId = params.professionalId;
        if (params.patientId) where.patientId = params.patientId;
        if (params.siteId) where.siteId = params.siteId;

        // Remove status filter to let frontend decide, or add status param
        delete where.status;

        return prisma.appointment.findMany({
            where,
            include: {
                patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
                professional: {
                    include: {
                        tenantUser: {
                            include: { user: { select: { fullName: true } } }
                        },
                        specialty: true
                    }
                },
                site: { select: { id: true, name: true } }
            },
            orderBy: { startTime: 'asc' }
        });
    }

    async create(tenantId: string, userId: string, data: {
        patientId: string;
        professionalId: string;
        siteId: string;
        startTime: string; // ISO string
        endTime: string;   // ISO string
        type: AppointmentType;
        notes?: string;
    }) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (start >= end) {
            throw new Error('La fecha de inicio debe ser anterior a la de fin');
        }

        // 1. Check for overlaps for the Professional
        const overlap = await prisma.appointment.findFirst({
            where: {
                tenantId,
                professionalId: data.professionalId,
                status: { not: AppointmentStatus.CANCELLED },
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            }
        });

        if (overlap) {
            throw new Error('El profesional ya tiene un turno en ese horario');
        }

        // 2. Check for overlaps for the Patient
        const patientOverlap = await prisma.appointment.findFirst({
            where: {
                tenantId,
                patientId: data.patientId,
                status: { not: AppointmentStatus.CANCELLED },
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            }
        });

        if (patientOverlap) {
            throw new Error('El paciente ya tiene un turno en ese horario');
        }

        // 3. Get current price to snapshot
        let priceVersion = await prisma.appointmentPriceVersion.findFirst({
            where: { tenantId, isActive: true },
            orderBy: { effectiveFrom: 'desc' }
        });

        if (!priceVersion) {
            // Auto-create a default price version if none exists to avoid 400 error
            priceVersion = await prisma.appointmentPriceVersion.create({
                data: {
                    tenantId,
                    priceArsInt: 30000,
                    createdByUserId: userId,
                    effectiveFrom: new Date('2020-01-01'), // Past
                    isActive: true
                }
            });
        }

        return prisma.$transaction(async (tx) => {
            // Create Appointment
            const appointment = await tx.appointment.create({
                data: {
                    tenantId,
                    patientId: data.patientId,
                    professionalId: data.professionalId,
                    siteId: data.siteId,
                    startTime: start,
                    endTime: end,
                    type: data.type,
                    notes: data.notes,
                    status: AppointmentStatus.CONFIRMED,
                    priceArsInt: priceVersion.priceArsInt,
                    priceVersionId: priceVersion.id
                }
            });

            // Create collection entry
            await tx.appointmentCollection.create({
                data: {
                    tenantId,
                    appointmentId: appointment.id,
                    amountDueArsInt: priceVersion.priceArsInt,
                    dueDate: new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
                    status: 'PENDING'
                }
            });

            return appointment;
        });
    }

    async update(tenantId: string, id: string, data: {
        status?: AppointmentStatus;
        startTime?: string;
        endTime?: string;
        notes?: string;
    }) {
        const appointment = await prisma.appointment.findFirst({
            where: { id, tenantId }
        });

        if (!appointment) throw new Error('Appointment not found');

        // If rescheduling, check overlaps again
        if (data.startTime && data.endTime) {
            const start = new Date(data.startTime);
            const end = new Date(data.endTime);

            const overlap = await prisma.appointment.findFirst({
                where: {
                    tenantId,
                    professionalId: appointment.professionalId,
                    id: { not: id }, // Exclude self
                    status: { not: AppointmentStatus.CANCELLED },
                    AND: [
                        { startTime: { lt: end } },
                        { endTime: { gt: start } }
                    ]
                }
            });

            if (overlap) {
                throw new Error('El profesional ya tiene un turno en ese horario');
            }
        }

        return prisma.appointment.update({
            where: { id },
            data: {
                ...data,
                startTime: data.startTime ? new Date(data.startTime) : undefined,
                endTime: data.endTime ? new Date(data.endTime) : undefined
            }
        });
    }
}
