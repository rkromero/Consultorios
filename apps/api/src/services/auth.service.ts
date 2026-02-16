import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Tenant, Role } from '@clinica/db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export class AuthService {
    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                tenants: {
                    include: {
                        tenant: true
                    }
                }
            }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // Generate specific token if user has only one tenant?
        // For now, return a temporary token to select tenant, OR if only 1 tenant, auto-select.

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            tenants: user.tenants.map(tu => ({
                id: tu.tenant.id,
                name: tu.tenant.name,
                role: tu.role
            })),
            token
        };
    }

    async selectTenant(userId: string, tenantId: string) {
        const tenantUser = await prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId,
                    userId
                }
            },
            include: {
                tenant: true
            }
        });

        if (!tenantUser) {
            throw new Error('User does not belong to this tenant');
        }

        const token = jwt.sign(
            { userId, tenantId, role: tenantUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            token,
            tenant: tenantUser.tenant,
            role: tenantUser.role
        };
    }

    async register(data: { email: string; password: string; fullName: string; tenantName: string }) {
        // Transaction to create User + Tenant + Link
        return await prisma.$transaction(async (tx) => {
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    fullName: data.fullName
                }
            });

            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenantName,
                    slug: data.tenantName.toLowerCase().replace(/\s+/g, '-'),
                }
            });

            await tx.tenantUser.create({
                data: {
                    userId: user.id,
                    tenantId: tenant.id,
                    role: Role.ADMIN
                }
            });

            return { user, tenant };
        });
    }
}
