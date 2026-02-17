import prisma from '../lib/prisma';

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
            email: tu.user.email,
            fullName: tu.user.fullName,
            phone: tu.user.phone,
            role: tu.role,
            createdAt: tu.user.createdAt
        }));
    }
}
