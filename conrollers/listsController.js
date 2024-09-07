const AppError = require('../utils/appError');
const pool = require('../db/db');
const { convertUuidToId } = require('../utils/uuidIdConverter');
const exportObject = {};

exportObject.getLists = async (req, res, next) => {
  const { search, completed } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = $1';
  const params = [req._userId];

  if (completed) {
    query += ' AND completed = $2';
    params.push(completed === 'true');
  }
  if (search) {
    query += ' AND text ILIKE $3';
    params.push(`%${search}%`);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Function to create a new task
exportObject.createNewList = async (req, res, next) => {
  const { title, completed, listUuid } = req.body;
  if (!title) {
    next(new AppError('Text is required', 400));
    return;
  }
  try {
    const listId = await convertUuidToId(listUuid);
    const result = await pool.query(
      'INSERT INTO tasks (title, completed, user_id, list_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, completed, req._userId, listId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Function to update a task
exportObject.updateList = async (req, res, next) => {
  const { text, completed, listUuid } = req.body;
  const { uuid } = req.params;

  try {
    const listId = listUuid ? await convertUuidToId(listUuid) : null;
    const result = await pool.query(
      'UPDATE tasks SET text = $1, completed = $2, list_id = $3 WHERE uuid = $4 AND user_id = $5 RETURNING *',
      [text, completed, listId, uuid, req._userId]
    );
    if (result.rowCount === 0) {
      next(new AppError('Task not found', 404));
    } else {
      res.json({ status: 'success', message: 'Task updated' });
    }
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

// Function to delete a task
exportObject.deleteList = async (req, res, next) => {
  const { uuid } = req.params;
  if (!uuid) {
    next(new AppError('UUID is required', 400));
    return;
  }

  try {
    const result = await pool.query('DELETE FROM tasks WHERE uuid = $1 AND user_id = $2 RETURNING *', [
      uuid,
      req._userId,
    ]);
    if (result.rowCount === 0) {
      next(new AppError('Task not found', 404));
    } else {
      res.json({ status: 'success', message: 'Task deleted' });
    }
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.getOneList = async (req, res, next) => {
  const { uuid } = req.params;

  if (!uuid) {
    next(new AppError('UUID is required', 400));
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM lists WHERE uuid = $1 AND user_id = $2', [uuid, req._userId]);

    if (result.rowCount === 0) {
      next(new AppError('List not found', 404));
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

module.exports = exportObject;
