import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointments.service';
import { Role } from '@clinica/db';
import prisma from '../lib/prisma';

const service = new AppointmentService();

export const getAll = async (req: Request, res: Response) => {
    try {
        let { start, end, professionalId, patientId, siteId } = req.query;

        // Force professionalId if user is a PROFESSIONAL
        if (req.role === Role.PROFESSIONAL) {
            const professional = await prisma.professional.findFirst({
                where: {
                    tenantUser: {
                        userId: req.user!.id,
                        tenantId: req.tenantId!
                    }
                }
            });

            if (professional) {
                professionalId = professional.id;
            } else {
                // Return empty if professional profile not found but role is professional
                return res.json([]);
            }
        }

        // Ensure dates are parsed if present
        const params = {
            professionalId: professionalId as string,
            patientId: patientId as string,
            siteId: siteId as string,
            start: start ? new Date(start as string) : undefined,
            end: end ? new Date(end as string) : undefined
        };

        const items = await service.getAll(req.tenantId!, params);
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
