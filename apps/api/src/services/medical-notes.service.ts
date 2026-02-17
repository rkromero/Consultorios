import prisma from '../lib/prisma';

export class MedicalNoteService {
    async getByPatient(tenantId: string, patientId: string) {
        return prisma.medicalNote.findMany({
            where: {
                tenantId,
                patientId
            },
            include: {
                author: {
                    include: {
                        tenantUser: {
                            include: { user: { select: { fullName: true } } }
                        },
                        specialty: true
                    }
                },
                attachments: true
            },
            orderBy: { date: 'desc' }
        });
    }

    async create(tenantId: string, authorId: string, data: {
        patientId: string;
        content: string;
    }, files: Express.Multer.File[] = []) {
        // Check if author is valid professional
        const professional = await prisma.professional.findUnique({
            where: { id: authorId }
        });

        if (!professional) throw new Error('Professional not found');

        return prisma.medicalNote.create({
            data: {
                tenantId,
                patientId: data.patientId,
                authorId,
                content: data.content,
                attachments: {
                    create: files.map(file => ({
                        filename: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: `/uploads/${file.filename}`
                    }))
                }
            },
            include: {
                attachments: true
            }
        });
    }
}
