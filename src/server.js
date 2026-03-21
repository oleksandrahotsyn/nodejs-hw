import express from 'express';
import 'dotenv/config';
import cors from 'cors';
// Імпортуємо middleware
import { errors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import cookieParser from "cookie-parser";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(authRoutes);
app.use(notesRoutes);

// обробка 404
app.use(notFoundHandler);
// обробка помилок від celebrate (валідація)
app.use(errors());
// глобальна обробка інших помилок
app.use(errorHandler);

await connectMongoDB();
console.log('ENV CHECK:', {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'OK' : 'MISSING',
  BREVO_API_KEY: process.env.BREVO_API_KEY ? 'OK' : 'MISSING',
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
