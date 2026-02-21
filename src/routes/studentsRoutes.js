import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createStudent } from '../controllers/studentsController.js';
import {
  createStudentSchema,
  updateStudentSchema,
} from '../validations/studentsValidation.js';
import {
  getStudents,
  getStudentById,
  deleteStudent,
  updateStudent,
} from '../controllers/studentsController.js';

import { studentIdParamSchema } from '../validations/studentsValidation.js';
import { getStudentsSchema } from '../validations/studentsValidation.js';
const router = Router();

router.get('/students', celebrate(getStudentsSchema), getStudents);
router.post('/students', celebrate(createStudentSchema), createStudent);

router.get(
  '/students/:studentId',
  celebrate(studentIdParamSchema),
  getStudentById,
);
router.delete(
  '/students/:studentId',
  celebrate(studentIdParamSchema),
  deleteStudent,
);
router.patch(
  '/students/:studentId',
  celebrate(updateStudentSchema),
  updateStudent,
);

export default router;
