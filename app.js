// PACKAGE IMPORTS
const express = require('express');
const morgan = require('morgan');
const path = require('path');

// LOCAL MODULE IMPORTS
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');

const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
    req.requestTime = new Date().toDateString();
    next();
});

app.get('/resetPassword', (req, res, next) => {
    res.status(200).render('resetPassword');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/posts', postRoutes);

app.all('*', (req, res, next) => {
    next(
        new AppError(`Cannot find the ${req.originalUrl} on this server.`, 404)
    );
});

app.use(globalErrorHandler);

module.exports = app;
