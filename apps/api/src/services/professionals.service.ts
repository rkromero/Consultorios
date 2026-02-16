import prisma from '../lib/prisma';
import { Role } from '@clinica/db';

export class ProfessionalService {
    async getAll(tenantId: string) {
        return prisma.professional.findMany({
            where: {
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

    async create(tenantId: string, data: { userId: string; specialtyId: string; licenseNumber?: string; color?: string }) {
        // 1. Verify user belongs to tenant
        const tenantUser = await prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId: data.userId
                }
            }
        });

        if (!tenantUser) {
            throw new Error('User does not belong to this tenant');
        }

        // 2. Check if already a professional
        const existing = await prisma.professional.findUnique({
            where: { tenantUserId: tenantUser.id }
        });

        if (existing) {
            throw new Error('User is already a professional in this tenant');
        }

        // 3. Create professional profile (and upgrade role to PROFESSIONAL if needed? Maybe keep separate)
        // For now we assume role management is separate or we auto-update role.

        return prisma.$transaction(async (tx) => {
            // Optional: Update role
            await tx.tenantUser.update({
                where: { id: tenantUser.id },
                data: { role: Role.PROFESSIONAL }
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
}
