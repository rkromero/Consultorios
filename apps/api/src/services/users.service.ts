import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@clinica/db';

export class UserService {
    async getAll(tenantId: string) {
        const tenantUsers = await prisma.tenantUser.findMany({
            where: { tenantId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        phone: true,
                        createdAt: true
                    }
                }
            }
        });

        return tenantUsers.map(tu => ({
            id: tu.user.id,
            tenantUserId: tu.id,
            email: tu.user.email,
            fullName: tu.user.fullName,
            phone: tu.user.phone,
            role: tu.role,
            createdAt: tu.user.createdAt
        }));
    }

    async invite(tenantId: string, data: {
        email: string;
        fullName: string;
        password: string;
        role: Role;
    }) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            const existingLink = await prisma.tenantUser.findUnique({
                where: {
                    tenantId_userId: {
                        tenantId,
                        userId: existingUser.id
                    }
                }
            });

            if (existingLink) {
                throw new Error('Este usuario ya pertenece a la organización');
            }

            await prisma.tenantUser.create({
                data: {
                    tenantId,
                    userId: existingUser.id,
                    role: data.role
                }
            });

            return { userId: existingUser.id, existing: true };
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    fullName: data.fullName,
                    passwordHash
                }
            });

            await tx.tenantUser.create({
                data: {
                    tenantId,
                    userId: user.id,
                    role: data.role
                }
            });

            return { userId: user.id, existing: false };
        });

        return result;
    }

    async remove(tenantId: string, userId: string, requestingUserId: string) {
        if (userId === requestingUserId) {
            throw new Error('No puedes eliminarte a ti mismo');
        }

        const tenantUser = await prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId
                }
            }
        });

        if (!tenantUser) {
            throw new Error('Usuario no encontrado en esta organización');
        }

        await prisma.tenantUser.delete({
            where: { id: tenantUser.id }
        });

        return { success: true };
    }

    async updateRole(tenantId: string, userId: string, role: Role, requestingUserId: string) {
        if (userId === requestingUserId) {
            throw new Error('No puedes cambiar tu propio rol');
        }

        const tenantUser = await prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId
                }
            }
        });

        if (!tenantUser) {
            throw new Error('Usuario no encontrado en esta organización');
        }

        await prisma.tenantUser.update({
            where: { id: tenantUser.id },
            data: { role }
        });

        return { success: true };
    }
}
