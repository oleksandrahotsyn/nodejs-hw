import { Router } from 'express';
import { celebrate } from 'celebrate';
import { createStudent } from '../controllers/studentsController.js';
import { createStudentSchema } from '../validations/studentsValidation.js';
import {
  getStudentById,
  deleteStudent,
} from '../controllers/studentsController.js';
import { studentIdParamSchema } from '../validations/studentsValidation.js';

const router = Router();

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

export default router;
