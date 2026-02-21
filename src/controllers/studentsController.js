import createHttpError from 'http-errors';
import { Student } from '../models/student.js';

// Отримати список усіх студентів
export const getStudents = async (req, res) => {
  // Отримуємо параметри запиту
  const { page = 1, perPage = 10, gender, minAvgMark, search } = req.query;
  const skip = (page - 1) * perPage;

  // Створюємо базовий запит
  const studentsQuery = Student.find();

  // Текстовий пошук по name (працює лише якщо створено текстовий індекс)
  if (search) {
    studentsQuery.where({ $text: { $search: search } });
  }

  // Фільтр за статтю
  if (gender) {
    studentsQuery.where('gender').equals(gender);
  }

  // Фільтр за середнім балом
  if (minAvgMark) {
    studentsQuery.where('avgMark').gte(minAvgMark);
  }

  const [totalItems, students] = await Promise.all([
    studentsQuery.clone().countDocuments(),
    studentsQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    students,
  });
};

// Отримати одного студента за id
export const getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(200).json(student);
};

export const createStudent = async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
};

export const deleteStudent = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findOneAndDelete({
    _id: studentId,
  });

  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

  res.status(200).json(student);
};

export const updateStudent = async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findOneAndUpdate(
    { _id: studentId }, // Шукаємо по id
    req.body,
    { new: true }, // повертаємо оновлений документ
  );

  if (!student) {
    throw createHttpError(404, 'Student not found');
  }

  res.status(200).json(student);
};
