import createHttpError from 'http-errors';
import { User } from '../models/user.js';

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // Тут далі будемо додавати логіку створення користувача
  // Поки що відповідаємо порожнім об'єктом
  res.status(201).json({});
};
