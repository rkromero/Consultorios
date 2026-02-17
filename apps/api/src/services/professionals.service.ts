import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@clinica/db';

export class ProfessionalService {
    async getAll(tenantId: string, activeOnly?: boolean) {
        const where: any = {
            tenantUser: { tenantId }
        };

        if (activeOnly !== undefined) {
            where.active = activeOnly;
        }

        return prisma.professional.findMany({
            where,
            include: {
                specialty: true,
                tenantUser: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: [
                { active: 'desc' },
                { tenantUser: { user: { fullName: 'asc' } } }
            ]
        });
    }

    async getById(tenantId: string, id: string) {
        return prisma.professional.findFirst({
            where: {
                id,
                tenantUser: { tenantId }
            },
            include: {
                specialty: true,
                tenantUser: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async create(tenantId: string, data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        specialtyId: string;
        licenseNumber?: string;
        color?: string
    }) {
        const hashedPassword = await bcrypt.hash('consultorio123', 10);
        const fullName = `${data.firstName} ${data.lastName}`;

        return prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    fullName: fullName,
                    phone: data.phone,
                }
            });

            const tenantUser = await tx.tenantUser.create({
                data: {
                    tenantId,
                    userId: user.id,
                    role: Role.PROFESSIONAL
                }
            });

            return tx.professional.create({
                data: {
                    tenantUserId: tenantUser.id,
                    specialtyId: data.specialtyId,
                    licenseNumber: data.licenseNumber,
                    color: data.color
                },
                include: {
                    specialty: true,
                    tenantUser: { include: { user: true } }
                }
            });
        });
    }

    async update(tenantId: string, id: string, data: { specialtyId?: string; licenseNumber?: string; color?: string }) {
        const professional = await prisma.professional.findFirst({
            where: { id, tenantUser: { tenantId } }
        });

        if (!professional) throw new Error('Professional not found');

        return prisma.professional.update({
            where: { id },
            data,
            include: { specialty: true }
        });
    }

    async toggleActive(tenantId: string, id: string) {
        const professional = await prisma.professional.findFirst({
            where: { id, tenantUser: { tenantId } }
        });

        if (!professional) throw new Error('Profesional no encontrado');

        return prisma.professional.update({
            where: { id },
            data: { active: !professional.active },
            include: {
                specialty: true,
                tenantUser: { include: { user: true } }
            }
        });
    }
}
