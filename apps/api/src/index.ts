import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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

app.use('/api/professionals', professionalRoutes);
app.use('/api/patients', patientRoutes);

import appointmentRoutes from './routes/appointments.routes';
app.use('/api/appointments', appointmentRoutes);

import medicalNoteRoutes from './routes/medical-notes.routes';
app.use('/api/medical-notes', medicalNoteRoutes);

import invoiceRoutes from './routes/invoices.routes';
app.use('/api/invoices', invoiceRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
