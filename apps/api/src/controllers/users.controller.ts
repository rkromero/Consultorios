import { Request, Response } from 'express';
import { UserService } from '../services/users.service';

const userService = new UserService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAll(req.tenantId!);
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
