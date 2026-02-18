import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import { config } from './config';

// Apply database schema changes before starting
try {
    console.log('[startup] Running prisma db push...');
    execSync('npx prisma db push --schema=./packages/db/prisma/schema.prisma --skip-generate --accept-data-loss', {
        stdio: 'inherit',
        timeout: 30000
    });
    console.log('[startup] Database schema synced successfully');
} catch (error) {
    console.error('[startup] prisma db push failed:', error);
}

const app = express();
const port = config.PORT;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

import authRoutes from './routes/auth.routes';
import siteRoutes from './routes/sites.routes';
import boxRoutes from './routes/boxes.routes';
import specialtyRoutes from './routes/specialties.routes';

app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/boxes', boxRoutes);
app.use('/api/specialties', specialtyRoutes);

import professionalRoutes from './routes/professionals.routes';
import patientRoutes from './routes/patients.routes';
import userRoutes from './routes/users.routes';
import pricingRoutes from './routes/pricing.routes';
import collectionsRoutes from './routes/collections.routes';

app.use('/api/professionals', professionalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/pricing', pricingRoutes);
app.use('/api/admin/collections', collectionsRoutes);

import appointmentRoutes from './routes/appointments.routes';
app.use('/api/appointments', appointmentRoutes);

import medicalNoteRoutes from './routes/medical-notes.routes';
app.use('/api/medical-notes', medicalNoteRoutes);

import invoiceRoutes from './routes/invoices.routes';
app.use('/api/invoices', invoiceRoutes);

import tenantRoutes from './routes/tenant.routes';
app.use('/api/tenant', tenantRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../web/dist')));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all handler for React Router (must be after all API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
});

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not defined');
} else {
    console.log('DATABASE_URL is defined');
}

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
