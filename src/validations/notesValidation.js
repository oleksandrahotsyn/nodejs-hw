import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

// Кастомний валідатор для ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

// Схема для перевірки параметра noteId (GET/DELETE/PATCH)
export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

// GET /notes
export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS),
    // дозволяємо порожній рядок
    search: Joi.string().allow('').optional(),
  }),
};

// POST /notes
export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).required().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least {#limit} characters',
      'any.required': 'Title is required',
    }),
    content: Joi.string().allow('').optional().messages({
      'string.base': 'Content must be a string',
    }),
    tag: Joi.string()
      .valid(...TAGS)
      .optional()
      .messages({
        'any.only': `Tag must be one of: ${TAGS.join(', ')}`,
        'string.base': 'Tag must be a string',
      }),
  }),
};

// PATCH /notes/:noteId  (params + body в ОДНІЙ схемі)
export const updateNoteSchema = {
  ...noteIdSchema,
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).optional().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title should have at least {#limit} characters',
    }),
    content: Joi.string().allow('').optional().messages({
      'string.base': 'Content must be a string',
    }),
    tag: Joi.string()
      .valid(...TAGS)
      .optional()
      .messages({
        'any.only': `Tag must be one of: ${TAGS.join(', ')}`,
        'string.base': 'Tag must be a string',
      }),
  }).min(1), // важливо: не дозволяємо порожнє тіло
};
