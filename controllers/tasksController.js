const AppError = require('../utils/appError');
const pool = require('../db/db');
const { convertUuidToId } = require('../utils/uuidIdConverter');
const exportObject = {};

exportObject.getTasks = async (req, res, next) => {
  const { search, completed } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = $1';
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

exportObject.createTask = async (req, res, next) => {
  const { text, completed = false, listUuid } = req.body;

  try {
    const listId = await convertUuidToId('lists', listUuid);
    console.log('listId: ', listId);
    const query = `
    INSERT INTO tasks (text, completed, list_id, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;
    const params = [text, completed, listId, req._userId];

    const result = await pool.query(query, params);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log('err');
    next(new AppError(err.message, 500));
  }
};

exportObject.updateTask = async (req, res, next) => {
  const { text, completed } = req.body;
  const { uuid } = req.params;
  const userId = req._userId;

  try {
    const result = await pool.query('UPDATE tasks SET text = $1, completed = $2 WHERE uuid = $3 AND user_id = $4', [
      text,
      completed,
      uuid,
      userId,
    ]);
    if (result.rowCount === 0) {
      next(new AppError('Task not found', 404));
    } else {
      res.json({ status: 'Success', message: 'Task updated' });
    }
  } catch (err) {
    console.log(err);
    next(new AppError(err.message, 500));
  }
};

exportObject.deleteTask = async (req, res, next) => {
  const { uuid } = req.params;
  const userId = req._userId;
  if (!uuid) {
    next(new AppError('UUID is required', 400));
    return;
  }
  try {
    const result = await pool.query(`SELECT * FROM tasks WHERE uuid = $1 AND user_id = $2;`, [uuid, userId]);

    if (result.rowCount === 0) {
      return next(new AppError('Task not found', 404));
    }

    await pool.query('DELETE FROM tasks WHERE uuid = $1 AND user_id = $2', [uuid, userId]);

    res.json({
      status: 'Success',
      message: 'Task deleted',
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

module.exports = exportObject;
