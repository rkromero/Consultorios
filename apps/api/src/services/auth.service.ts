import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@clinica/db';
import { config } from '../config';

const JWT_SECRET = config.JWT_SECRET;

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
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new Error('El correo electrónico ya está registrado');
        }

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

            // Generate unique slug
            const baseSlug = data.tenantName.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

            let slug = baseSlug || 'org';
            let count = 0;

            // Check for collision and append number if needed
            while (true) {
                const currentSlug = count === 0 ? slug : `${slug}-${count}`;
                const existing = await tx.tenant.findUnique({ where: { slug: currentSlug } });
                if (!existing) {
                    slug = currentSlug;
                    break;
                }
                count++;
            }

            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenantName,
                    slug: slug,
                }
            });

            // Create default Site with business name
            await tx.site.create({
                data: {
                    tenantId: tenant.id,
                    name: data.tenantName, // Default site matches business name
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
