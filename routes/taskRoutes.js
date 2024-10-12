const express = require('express');
const routes = express.Router();
const controllers = require('../controllers/tasksController');
const { tokenChecker } = require('../controllers/userControllers');

routes.get('/', tokenChecker, controllers.getTasks);
routes.post('/', tokenChecker, controllers.createTask);
routes.put('/:uuid', tokenChecker, controllers.updateTask);
routes.delete('/:uuid', tokenChecker, controllers.deleteTask);
module.exports = routes;
