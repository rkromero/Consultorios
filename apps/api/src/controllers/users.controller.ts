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

export const invite = async (req: Request, res: Response) => {
    try {
        const { email, fullName, password, role } = req.body;

        if (!email || !fullName || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const result = await userService.invite(req.tenantId!, { email, fullName, password, role });
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await userService.remove(req.tenantId!, userId, req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'El rol es obligatorio' });
        }

        const result = await userService.updateRole(req.tenantId!, userId, role, req.user!.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
