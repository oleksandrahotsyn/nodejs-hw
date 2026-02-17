import { Student } from '../models/students.js';

// Отримати список усіх студентів
export const getStudents = async (req, res) => {
  const students = await Student.find();
  res.status(200).json(students);
};

// Отримати одного студента за id
export const getStudentById = async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error('Student not found');
  }

  res.status(200).json(student);
};
