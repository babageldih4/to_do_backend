// exports.convertUuidToId = async (model, uuid) => {
//   try {
//     return (await model.findOne({ where: { uuid }, attributes: ['id'] }))?.id;
//   } catch (err) {
//     return null;
//   }
// };

// exports.convertUuidsToIds = async (model, uuids) => {
//   try {
//     return (await model.findAll({ where: { uuid: uuids }, attributes: ['id'] }))?.map((data) => data.id);
//   } catch (err) {
//     return [];
//   }
// };

// exports.convertIdToUuid = async (model, id) => {
//   try {
//     return (await model.findOne({ where: { id }, attributes: ['uuid'] }))?.uuid;
//   } catch (err) {
//     return null;
//   }
// };

// exports.convertIdsToUuids = async (model, ids) => {
//   try {
//     return (await model.findAll({ where: { id: ids }, attributes: ['uuid'] }))?.map((data) => data.uuid);
//   } catch (err) {
//     return [];
//   }
// };

const pool = require('../db/db');

// Convert a UUID to ID
exports.convertUuidToId = async (table, uuid) => {
  console.log('asasas', table);
  console.log('uuid', uuid);
  try {
    const query = `SELECT id FROM ${table} WHERE uuid = $1;`;
    console.log(query);
    const { rows } = await pool.query(query, [uuid]);
    return rows[0]?.id || null;
  } catch (err) {
    console.error('err:', err.error);
    return null;
  }
};

// Convert multiple UUIDs to IDs
exports.convertUuidsToIds = async (table, uuids) => {
  try {
    const query = `SELECT id FROM "${table}" WHERE uuid = ANY($2::uuid[]);`;
    const { rows } = await pool.query(query, [uuids]);
    console.log('rows: ', rows);
    // return rows.map((row) => row.id);
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Convert an ID to UUID
exports.convertIdToUuid = async (table, id) => {
  try {
    const query = `SELECT uuid FROM ${table} WHERE id = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0]?.uuid || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Convert multiple IDs to UUIDs
exports.convertIdsToUuids = async (table, ids) => {
  try {
    const query = `SELECT uuid FROM ${table} WHERE id = ANY($1::int[]);`;
    const { rows } = await pool.query(query, [ids]);
    return rows.map((row) => row.uuid);
  } catch (err) {
    console.error(err);
    return [];
  }
};
