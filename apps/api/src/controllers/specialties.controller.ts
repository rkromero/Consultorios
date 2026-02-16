import { Request, Response } from 'express';
import { SpecialtyService } from '../services/specialties.service';

const specialtyService = new SpecialtyService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const items = await specialtyService.getAll(req.tenantId!);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = await specialtyService.create(req.tenantId!, req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        await specialtyService.delete(req.tenantId!, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
