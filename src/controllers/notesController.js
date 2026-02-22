import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

// GET /notes?page&perPage&tag&search
export const getAllNotes = async (req, res) => {
  const { tag, search } = req.query;

  // celebrate валідовує, але page/perPage приходять рядками => приводимо до Number
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 10);

  const filter = {};

  if (tag) {
    filter.tag = tag;
  }

  if (search !== undefined) {
    const trimmed = String(search).trim();
    if (trimmed.length > 0) {
      filter.$text = { $search: trimmed };
    }
  }

  const skip = (page - 1) * perPage;

  const totalNotes = await Note.countDocuments(filter);
  const totalPages = Math.ceil(totalNotes / perPage) || 1;

  const findQuery = Note.find(filter).skip(skip).limit(perPage);

  // якщо є текстовий пошук — можна сортувати по релевантності
  const hasTextSearch = !!filter.$text;
  if (hasTextSearch) {
    findQuery
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
  } else {
    findQuery.sort({ createdAt: -1 });
  }

  const notes = await findQuery.exec();

  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

// GET /notes/:noteId
export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// POST /notes
export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({ _id: noteId });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// PATCH /notes/:noteId
export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    new: true,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
