const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { route } = require('./postRoutes');

const router = express.Router();

/* NON PROTECTED ROUTES */
// Forgot password route
router.route('/forgotPassword').post(authController.forgotPassword);

// reset password route
router.route('/resetPassword/:token').patch(authController.resetPassword);

// SigUp route
router.route('/signUp').post(authController.signUp);

// Confirm email route
router.route('/confirmEmail/:token').get(authController.confirmEmail);

// Sigin route
router.route('/signIn').post(authController.signIn);

/* PROTECTED ROUTES */

// Authentication middleware
router.use(authController.protect);

// Getting,updating,deleting user
router
    .route('/me')
    .get(userController.getMe)
    .patch(userController.uploadPostPhoto, userController.updateMe)
    .delete(userController.deleteMe);

// Updating password
router.patch('/updatePassword', authController.updatePassword);

module.exports = router;
