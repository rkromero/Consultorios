import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
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
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    fullName: fullName,
                    phone: data.phone,
                }
            });

            // 2. Create TenantUser
            const tenantUser = await tx.tenantUser.create({
                data: {
                    tenantId,
                    userId: user.id,
                    role: Role.PROFESSIONAL
                }
            });

            // 3. Create Professional profile
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
