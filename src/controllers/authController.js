import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // Хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створюємо користувача
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  // Відправляємо дані користувача (без пароля) у відповіді
  res.status(201).json(newUser);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Перевіряємо чи користувач з такою поштою існує
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Порівнюємо хеші паролів
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  res.status(200).json(user);
};
