import { Request, Response } from 'express';
import { BoxService } from '../services/boxes.service';

const boxService = new BoxService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const { siteId } = req.query;
        const boxes = await boxService.getAll(req.tenantId!, siteId as string);
        res.json(boxes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const box = await boxService.getById(req.tenantId!, req.params.id);
        if (!box) return res.status(404).json({ message: 'Box not found' });
        res.json(box);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const box = await boxService.create(req.tenantId!, req.body);
        res.status(201).json(box);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const box = await boxService.update(req.tenantId!, req.params.id, req.body);
        res.json(box);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        await boxService.delete(req.tenantId!, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
