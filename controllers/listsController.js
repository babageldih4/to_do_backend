const AppError = require('../utils/appError');
const pool = require('../db/db');
const { convertUuidToId } = require('../utils/uuidIdConverter');
const exportObject = {};

exportObject.getLists = async (req, res, next) => {
  const { search, completed } = req.query;
  let query = 'SELECT * FROM lists WHERE user_id = $1';
  const params = [req._userId];

  if (completed) {
    query += ' AND completed = $2';
    params.push(completed === 'true');
  }
  if (search) {
    query += ' AND title ILIKE $3';
    params.push(`%${search}%`);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.createNewList = async (req, res, next) => {
  const { title, completed, listUuid } = req.body;
  if (!title) {
    next(new AppError('title is required', 400));
    return;
  }
  try {
    const listId = await convertUuidToId(listUuid);
    const result = await pool.query(
      'INSERT INTO lists (title, completed, user_id, list_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, completed, req._userId, listId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.updateList = async (req, res, next) => {
  const { title, completed, listUuid } = req.body;
  const { uuid } = req.params;

  try {
    const listId = listUuid ? await convertUuidToId(listUuid) : null;
    const result = await pool.query(
      'UPDATE lists SET title = $1, completed = $2, list_id = $3 WHERE uuid = $4 AND user_id = $5 RETURNING *',
      [title, completed, listId, uuid, req._userId]
    );
    if (result.rowCount === 0) {
      next(new AppError('Task not found', 404));
    } else {
      res.json({ status: 'success', message: 'List updated' });
    }
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.deleteList = async (req, res, next) => {
  const { uuid } = req.params;
  if (!uuid) {
    next(new AppError('UUID is required', 400));
    return;
  }

  try {
    const result = await pool.query('DELETE FROM lists WHERE uuid = $1 AND user_id = $2 RETURNING *', [
      uuid,
      req._userId,
    ]);
    if (result.rowCount === 0) {
      next(new AppError('Task not found', 404));
    } else {
      res.json({ status: 'success', message: 'List deleted' });
    }
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.getOneList = async (req, res, next) => {
  const { uuid } = req.params;
  console.log(req.params);
  console.log('uuid for getList: ', uuid);

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
    console.log('result: ', result);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

exportObject.getTasksofOneList = async (req, res, next) => {
  const { uuid } = req.params;
  if (!uuid) {
    next(new AppError('UUID is required', 400));
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM lists WHERE uuid = $1', [uuid]);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

module.exports = exportObject;
