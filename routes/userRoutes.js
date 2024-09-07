const express = require('express');
const routes = express.Router();
const controllers = require('../conrollers/userControllers');
routes.post('/register', controllers.register);
routes.post('/login', controllers.login);

module.exports = routes;
