import { User, Tenant } from '@clinica/db';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            tenantId?: string;
            tenant?: Tenant;
            role?: string;
        }
    }
}
