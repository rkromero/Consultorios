import { Request, Response } from 'express';
import { TenantService } from '../services/tenant.service';

const service = new TenantService();

export const getInfo = async (req: Request, res: Response) => {
    try {
        const info = await service.getInfo(req.tenantId!);
        res.json(info);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateName = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const result = await service.updateName(req.tenantId!, name);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const uploadLogo = async (req: Request, res: Response) => {
    try {
        const { logoDataUrl } = req.body;
        if (!logoDataUrl) {
            return res.status(400).json({ message: 'Se requiere logoDataUrl' });
        }
        const result = await service.updateLogo(req.tenantId!, logoDataUrl);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const removeLogo = async (req: Request, res: Response) => {
    try {
        const result = await service.removeLogo(req.tenantId!);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
