import { Request, Response } from 'express';
import { ProfessionalService } from '../services/professionals.service';

const professionalService = new ProfessionalService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const activeOnly = req.query.activeOnly === 'true' ? true : undefined;
        const items = await professionalService.getAll(req.tenantId!, activeOnly);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const item = await professionalService.getById(req.tenantId!, req.params.id);
        if (!item) return res.status(404).json({ message: 'Professional not found' });
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = await professionalService.create(req.tenantId!, req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const item = await professionalService.update(req.tenantId!, req.params.id, req.body);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const toggleActive = async (req: Request, res: Response) => {
    try {
        const item = await professionalService.toggleActive(req.tenantId!, req.params.id);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
