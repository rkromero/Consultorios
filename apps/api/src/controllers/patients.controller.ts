import { Request, Response } from 'express';
import { PatientService } from '../services/patients.service';

const patientService = new PatientService();

export const getById = async (req: Request, res: Response) => {
    try {
        const item = await patientService.getById(req.tenantId!, req.params.id);
        if (!item) return res.status(404).json({ message: 'Patient not found' });
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const { q, page, limit } = req.query;
        const result = await patientService.getAll(
            req.tenantId!,
            q as string,
            Number(page) || 1,
            Number(limit) || 20
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = await patientService.create(req.tenantId!, req.body);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const item = await patientService.update(req.tenantId!, req.params.id, req.body);
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
