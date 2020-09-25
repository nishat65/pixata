const AppError = require('../utils/appError');

const getErrorResponse = (statusCode, err, res, customMsg = '') => {
    res.status(statusCode).json({
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        error: err,
        message: customMsg || err.message,
        stack: err.stack,
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    let error = Object.create(err);
    if (error.name === 'MongoError') {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        getErrorResponse(
            400,
            err,
            res,
            `Duplicate field value: ${value}. Please use another value!`
        );
    } else if (error.name === 'ValidationError')
        getErrorResponse(400, err, res);
    else if (error.name === 'JsonWebTokenError')
        getErrorResponse(401, err, res, 'Invalid token.Please login again!');
    else if (error.name === 'TokenExpiredError')
        getErrorResponse(
            401,
            err,
            res,
            'Your token has expired! Please log in again.'
        );
    else getErrorResponse(err.statusCode, err, res);
};
