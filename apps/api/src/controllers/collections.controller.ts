import { Request, Response } from 'express';
import { CollectionsService } from '../services/collections.service';

const collectionsService = new CollectionsService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const filters = {
            status: req.query.status as any,
            dueDateFrom: req.query.dueDateFrom as string,
            dueDateTo: req.query.dueDateTo as string,
            appointmentDateFrom: req.query.appointmentDateFrom as string,
            appointmentDateTo: req.query.appointmentDateTo as string,
            professionalId: req.query.professionalId as string,
            siteId: req.query.siteId as string,
        };

        const items = await collectionsService.getAll(req.tenantId!, filters);

        // Range for KPIs (e.g. current month)
        const range = req.query.kpiFrom && req.query.kpiTo ? {
            from: req.query.kpiFrom as string,
            to: req.query.kpiTo as string
        } : undefined;

        const kpis = await collectionsService.getKPIs(req.tenantId!, range);

        res.json({ items, kpis });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDueDate = async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params;
        const { dueDate } = req.body;
        const item = await collectionsService.updateDueDate(req.tenantId!, appointmentId, dueDate, req.user!.id);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const markAsPaid = async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params;
        const { paidAt, notes } = req.body;
        const item = await collectionsService.markAsPaid(req.tenantId!, appointmentId, {
            paidAt,
            notes,
            userId: req.user!.id
        });
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
