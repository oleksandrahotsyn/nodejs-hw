import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { createSession } from '../services/auth.js';
import { Session } from "../models/session.js";


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
 res.status(200).json(user);
};
