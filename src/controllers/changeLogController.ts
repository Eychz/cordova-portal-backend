import { Request, Response } from 'express';
import prisma from '../config/database';

export const changeLogController = {
    async getAllChangeLogs(req: Request, res: Response) {
        try {
            // Check if database table is empty, auto-populate with historical logs if so
            const count = await prisma.changeLog.count();
            if (count === 0) {
                const historicalLogs = [
                    {
                        description: 'Integrated Google reCAPTCHA v2 token verification on auth flows and updated CORS for X-Recaptcha-Token.',
                        date: new Date('2026-06-25'),
                        contributor: 'Antigravity AI & DevOps team',
                        approvedBy: 'Lead Tech Administrator'
                    },
                    {
                        description: 'Optimized PostgreSQL pooler configuration using Neon serverless connection strings (?pgbouncer=true).',
                        date: new Date('2026-06-25'),
                        contributor: 'Lead DBA',
                        approvedBy: 'System Architect'
                    },
                    {
                        description: 'Migrated main visual brand color scheme from red palette to premium brand blue #0036C5.',
                        date: new Date('2026-06-26'),
                        contributor: 'Antigravity AI & UI Designer',
                        approvedBy: 'Product Manager'
                    },
                    {
                        description: 'Implemented direct external redirection URLs and image thumbnails upload for municipal services.',
                        date: new Date('2026-06-27'),
                        contributor: 'Antigravity AI & Product Engineer',
                        approvedBy: 'Product Manager'
                    },
                    {
                        description: 'Simplified admin services overview table layout and input forms to show core details only.',
                        date: new Date('2026-06-27'),
                        contributor: 'Antigravity AI & Frontend Dev',
                        approvedBy: 'Lead Admin Administrator'
                    },
                    {
                        description: 'Integrated TanStack Query state caching & data retention across all admin panel tab screens.',
                        date: new Date('2026-06-28'),
                        contributor: 'Antigravity AI & Senior Frontend Architect',
                        approvedBy: 'Technical Director'
                    },
                    {
                        description: 'Implemented React Query client caching across all public guest-facing directory views and routes.',
                        date: new Date('2026-06-28'),
                        contributor: 'Antigravity AI & Frontend Dev',
                        approvedBy: 'Technical Director'
                    },
                    {
                        description: 'Updated the public site footer component to align with brand colors using a premium dark-blue gradient.',
                        date: new Date('2026-06-28'),
                        contributor: 'Antigravity AI & UI Designer',
                        approvedBy: 'Product Manager'
                    }
                ];

                await prisma.changeLog.createMany({
                    data: historicalLogs
                });
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 15;
            const skip = (page - 1) * limit;

            const total = await prisma.changeLog.count();
            const logs = await prisma.changeLog.findMany({
                orderBy: { date: 'desc' },
                skip,
                take: limit
            });

            res.json({
                data: logs,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            console.error('Error fetching change logs:', error);
            res.status(500).json({ error: 'Failed to fetch change logs' });
        }
    },

    async createChangeLog(req: Request, res: Response) {
        try {
            const { description, date, contributor, approvedBy } = req.body;
            if (!description || !date || !contributor || !approvedBy) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const log = await prisma.changeLog.create({
                data: {
                    description,
                    date: new Date(date),
                    contributor,
                    approvedBy
                }
            });

            res.status(201).json(log);
        } catch (error: any) {
            console.error('Error creating change log:', error);
            res.status(500).json({ error: 'Failed to create change log' });
        }
    },

    async updateChangeLog(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { description, date, contributor, approvedBy } = req.body;

            const log = await prisma.changeLog.update({
                where: { id },
                data: {
                    description,
                    date: date ? new Date(date) : undefined,
                    contributor,
                    approvedBy
                }
            });

            res.json(log);
        } catch (error: any) {
            console.error('Error updating change log:', error);
            res.status(500).json({ error: 'Failed to update change log' });
        }
    },

    async deleteChangeLog(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await prisma.changeLog.delete({
                where: { id }
            });

            res.json({ message: 'Change log deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting change log:', error);
            res.status(500).json({ error: 'Failed to delete change log' });
        }
    }
};
