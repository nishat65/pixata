const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

const signedToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const emailToken = crypto.randomBytes(32).toString('hex');
    const newUser = await User.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        emailConfirmToken: emailToken,
    });

    const resetURL = `${process.env.VUE_URL}confirmEmail/${emailToken}`;

    const token = signedToken(newUser._id);

    await new Email(newUser, resetURL).sendConfirmEmailLink();

    res.status(201).json({
        status: 'success',
        message:
            'Confirmation email sent successfully! Please confirm your email',
        token,
        data: {
            newUser,
        },
    });
});

//EMAIL CONFIRMATION IMPLEMENTED
exports.confirmEmail = catchAsync(async (req, res, next) => {
    const user = await User.findOne({
        emailConfirmToken: req.params.token,
    });
    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        );
    }
    user.emailConfirmToken = undefined;
    await user.save({ validateBeforeSave: false });
    let token = signedToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'Email confirmed successfully',
        token,
    });
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(
            new AppError('Please provide an username and password!', 400)
        );
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    let token = signedToken(user._id);
    res.status(200).json({
        message: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please login to get access.',
                401
            )
        );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please log in again.',
                401
            )
        );
    }

    req.user = currentUser;

    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // const resetURL = `${req.protocol}://${req.get(
    //     'host'
    // )}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `${process.env.VUE_URL}resetPassword/${resetToken}`;
    try {
        await new Email(user, resetURL).sendResetPassword();

        res.status(200).json({
            status: 'success',
            message: 'token send to email!',
        });
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending an email.Please try again later!',
                500
            )
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signedToken(user._id);
    res.status(200).send({
        message: 'success',
        token,
    });
});
