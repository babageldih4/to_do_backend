const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const errorHandling = require('./utils/errorHandling');

// Docs
const swaggerOptions = require('./swaggers/index.js');
const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// Apply middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ credentials: true, origin: '*' }));

// Routes

const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/lists', listRoutes);
app.all('*', (req, res) => {
  res
    .status(404)
    .json({ status: 'failed', message: `Can't find ${req.originalUrl ? req.originalUrl : 'Request'} on this server.` });
});

app.use(errorHandling);

module.exports = app;
