import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoices.service';

const service = new InvoiceService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const { patientId, status, startDate, endDate } = req.query;

        const items = await service.getAll(req.tenantId!, {
            patientId: patientId as string,
            status: status as string,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = await service.create(req.tenantId!, req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const item = await service.update(req.tenantId!, req.params.id, req.body);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await service.getStats(req.tenantId!);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
