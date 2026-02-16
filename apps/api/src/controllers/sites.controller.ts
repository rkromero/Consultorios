import { Request, Response } from 'express';
import { SiteService } from '../services/sites.service';

const siteService = new SiteService();

export const getAll = async (req: Request, res: Response) => {
    try {
        const sites = await siteService.getAll(req.tenantId!); // TenandId guaranteed by middleware
        res.json(sites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const site = await siteService.getById(req.tenantId!, req.params.id);
        if (!site) return res.status(404).json({ message: 'Site not found' });
        res.json(site);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const site = await siteService.create(req.tenantId!, req.body);
        res.status(201).json(site);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const site = await siteService.update(req.tenantId!, req.params.id, req.body);
        res.json(site);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req: Request, res: Response) => {
    try {
        await siteService.delete(req.tenantId!, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
