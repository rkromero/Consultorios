import { Request, Response } from 'express';
import { MedicalNoteService } from '../services/medical-notes.service';
import prisma from '../lib/prisma'; // direct access for quick lookup if needed, but service is better

const service = new MedicalNoteService();

export const getByPatient = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const items = await service.getByPatient(req.tenantId!, patientId);
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        // We need to resolve the professional ID from the logged in user
        // The user in req.user is the tenantUser. We need to find the specific professional record associated with it.

        // Quick lookup for professional ID based on tenantUserId (which is req.user.id)
        // Actually authMiddleware sets req.user to the payload. 
        // We need to fetch the TenantUser to get the Professional ID?
        // Let's assume req.user.id is the userId from AuthStore... wait. 
        // In auth.middleware.ts, we decode the token. 

        // User needs to be a professional to write notes.
        // Let's look up the professional record for the current tenantUser.

        // We don't have the TenantUser ID directly in the request unless we enhanced middleware.
        // But we have the userId and tenantId.

        const tenantUser = await prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: {
                    tenantId: req.tenantId!,
                    userId: req.user!.id
                }
            },
            include: { professionalData: true }
        });

        if (!tenantUser || !tenantUser.professionalData) {
            return res.status(403).json({ message: 'Solo los profesionales pueden crear notas médicas' });
        }

        const files = req.files as Express.Multer.File[];
        const item = await service.create(req.tenantId!, tenantUser.professionalData.id, req.body, files);
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
