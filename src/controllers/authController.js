import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession, setSessionCookies  } from '../services/auth.js';
import { Session } from "../models/session.js";
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createHttpError(400, 'Email in use');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email,
        password: hashedPassword,
    });
    
    // Створюємо нову сесію
    const newSession = await createSession(newUser._id);

    // 2. Викликаємо, передаємо об'єкт відповіді та сесію
    setSessionCookies(res, newSession);
    
    res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(401, 'Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw createHttpError(401, 'Invalid credentials');
    }
    
    // Видаляємо стару сесію користувача
    await Session.deleteOne({ userId: user._id });

    // Створюємо нову сесію
    const newSession = await createSession(user._id);

    // 3. Викликаємо, передаємо об'єкт відповіді та сесію
    setSessionCookies(res, newSession);
    
    res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  // 1. Знаходимо поточну сесію за id сесії та рефреш токеном
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // 2. Якщо такої сесії нема, повертаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // 3. Якщо сесія існує, перевіряємо валідність рефреш токена
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  // Якщо термін дії рефреш токена вийшов, повертаємо помилку
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  // 4. Якщо всі перевірки пройшли добре, видаляємо поточну сесію
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // 5. Створюємо нову сесію та додаємо кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Якщо користувача нема — навмисно повертаємо ту саму "успішну" 
  // відповідь без відправлення листа (anti user enumeration).
  if (!user) {
    return res.status(200).json({
      message: 'If this email exists, a reset link has been sent',
    });
  }

	// Користувач є — генеруємо короткоживучий JWT і відправляємо лист
  const resetToken = jwt.sign(
    { sub: user._id, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetToken}">here</a> to reset your password!</p>`,
    });
  } catch(error) {
      console.log('❌ EMAIL ERROR:', error);
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

	// Та сама "нейтральна" відповідь
  res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
  });
};