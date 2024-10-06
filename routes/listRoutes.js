const express = require('express');
const routes = express.Router();
const controllers = require('../controllers/listsController');
const { tokenChecker } = require('../controllers/userControllers');

routes.get('/', tokenChecker, controllers.getLists);
routes.post('/', tokenChecker, controllers.createNewList);
routes.put('/:uuid', tokenChecker, controllers.updateList);
routes.delete('/:uuid', tokenChecker, controllers.deleteList);
routes.get('/:uuid', tokenChecker, controllers.getOneList);
routes.get('/:uuid/tasks', tokenChecker, controllers.getTasksofOneList);

module.exports = routes;
