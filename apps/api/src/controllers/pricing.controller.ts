import { Request, Response } from 'express';
import { PricingService } from '../services/pricing.service';

const pricingService = new PricingService();

export const getCurrentPrice = async (req: Request, res: Response) => {
    try {
        const current = await pricingService.getCurrentPrice(req.tenantId!);
        const history = await pricingService.getPriceHistory(req.tenantId!);
        res.json({ current, history });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPriceVersion = async (req: Request, res: Response) => {
    try {
        const { priceArsInt } = req.body;
        if (!priceArsInt || isNaN(priceArsInt)) {
            return res.status(400).json({ message: 'Precio inválido' });
        }

        const newVersion = await pricingService.createPriceVersion(
            req.tenantId!,
            parseInt(priceArsInt),
            req.user!.id
        );
        res.status(201).json(newVersion);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
