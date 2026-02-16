import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message || 'Login failed' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Register failed' });
    }
};

export const selectTenant = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.body;
        const userId = (req as any).user.id; // From middleware
        const result = await authService.selectTenant(userId, tenantId);
        res.json(result);
    } catch (error: any) {
        res.status(403).json({ message: error.message || 'Tenant selection failed' });
    }
};
