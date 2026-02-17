import { Request, Response } from 'express';
import { PatientService } from '../services/patients.service';
import { Role } from '@clinica/db';
import prisma from '../lib/prisma';

const patientService = new PatientService();

const getProfessionalId = async (userId: string, tenantId: string): Promise<string | undefined> => {
    const professional = await prisma.professional.findFirst({
        where: {
            tenantUser: {
                userId,
                tenantId
            }
        }
    });
    return professional?.id;
};

export const getById = async (req: Request, res: Response) => {
    try {
        const item = await patientService.getById(req.tenantId!, req.params.id);
        if (!item) return res.status(404).json({ message: 'Patient not found' });

        if (req.role === Role.PROFESSIONAL) {
            const professionalId = await getProfessionalId(req.user!.id, req.tenantId!);
            if (professionalId) {
                const hasAppointment = await prisma.appointment.findFirst({
                    where: {
                        patientId: req.params.id,
                        professionalId,
                        tenantId: req.tenantId!
                    }
                });
                if (!hasAppointment) {
                    return res.status(403).json({ message: 'No tiene acceso a este paciente' });
                }
            }
        }

        res.json(item);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const { q, page, limit } = req.query;

        let professionalId: string | undefined;
        if (req.role === Role.PROFESSIONAL) {
            professionalId = await getProfessionalId(req.user!.id, req.tenantId!);
            if (!professionalId) {
                return res.json({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
            }
        }

        const result = await patientService.getAll(
            req.tenantId!,
            q as string,
            Number(page) || 1,
            Number(limit) || 20,
            professionalId
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
