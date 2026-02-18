import { Request, Response } from 'express';
import { LandingService } from '../services/landing.service';

const landingService = new LandingService();

export const get = async (req: Request, res: Response) => {
    try {
        const landing = await landingService.getByTenant(req.tenantId!);
        res.json(landing || { enabled: false, slug: '' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const upsert = async (req: Request, res: Response) => {
    try {
        const landing = await landingService.upsert(req.tenantId!, req.body, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const enable = async (req: Request, res: Response) => {
    try {
        const landing = await landingService.setEnabled(req.tenantId!, true, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const disable = async (req: Request, res: Response) => {
    try {
        const landing = await landingService.setEnabled(req.tenantId!, false, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.body;
        if (!slug) return res.status(400).json({ message: 'Se requiere un slug.' });
        const landing = await landingService.updateSlug(req.tenantId!, slug, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const upload = async (req: Request, res: Response) => {
    try {
        const { image, field } = req.body;
        if (!image || !field) {
            return res.status(400).json({ message: 'Se requiere image (base64) y field (logoUrl o heroImageUrl).' });
        }
        if (field !== 'logoUrl' && field !== 'heroImageUrl') {
            return res.status(400).json({ message: 'field debe ser "logoUrl" o "heroImageUrl".' });
        }
        const landing = await landingService.uploadImage(req.tenantId!, image, field, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const removeImage = async (req: Request, res: Response) => {
    try {
        const { field } = req.body;
        if (field !== 'logoUrl' && field !== 'heroImageUrl') {
            return res.status(400).json({ message: 'field debe ser "logoUrl" o "heroImageUrl".' });
        }
        const landing = await landingService.removeImage(req.tenantId!, field, req.user!.id);
        res.json(landing);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getPublic = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const landing = await landingService.getBySlug(slug);
        if (!landing) {
            return res.status(404).json({ message: 'Página no encontrada.' });
        }

        const { tenantId, updatedByUserId, ...publicData } = landing;

        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.json(publicData);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
