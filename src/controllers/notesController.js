import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res) => {
  const { tag, search } = req.query;

  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 10);
  const skip = (page - 1) * perPage;

  const notesQuery = Note.find({ userId: req.user._id });

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  const trimmedSearch = search !== undefined ? String(search).trim() : '';
  const hasTextSearch = trimmedSearch.length > 0;

  if (hasTextSearch) {
    notesQuery.where({ $text: { $search: trimmedSearch } });
    notesQuery
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
  } else {
    notesQuery.sort({ createdAt: -1 });
  }

  notesQuery.skip(skip).limit(perPage);

  // Promise.all: count + find одночасно
  const [totalNotes, notes] = await Promise.all([
    Note.countDocuments(notesQuery.getFilter()),
    notesQuery.exec(),
  ]);

  const totalPages = Math.ceil(totalNotes / perPage) || 1;

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
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
   });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// POST /notes
export const createNote = async (req, res) => {
  const note = await Note.create(
    {
      ...req.body,
      userId: req.user._id,
    });
  res.status(201).json(note);
};

// DELETE /notes/:noteId
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
   });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

// PATCH /notes/:noteId
export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({
    _id: noteId, 
    userId: req.user._id
   }, req.body, {
    new: true,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
