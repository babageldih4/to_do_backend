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
    const listId = await convertUuidToId(listUuid);
    const query = `
    INSERT INTO tasks (text, completed, list_id, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;
    const params = [text, completed, listId, req._userId];

    const result = await pool.query(query, params);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

module.exports = exportObject;
