const express = require('express');
const routes = express.Router();
const controllers = require('../conrollers/listsController');
const { tokenChecker } = require('../conrollers/userControllers');

routes.get('/', tokenChecker, controllers.getLists);
routes.post('/', tokenChecker, controllers.createNewList);
routes.put('/:uuid', tokenChecker, controllers.updateList);
routes.delete('/:uuid', tokenChecker, controllers.deleteList);
routes.get('/:uuid', tokenChecker, controllers.getOneList);

module.exports = routes;
