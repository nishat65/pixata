const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please tell us your first name!  '],
        validate: [
            validator.isAlpha,
            'A first name must only contain characters  ',
        ],
    },
    lastname: {
        type: String,
        required: [true, 'Please tell us your last name!  '],
        validate: [
            validator.isAlpha,
            'A last name must only contain characters  ',
        ],
    },
    username: {
        type: String,
        required: [true, 'Please provide a username!  '],
        unique: true,
        minLength: [5, 'A username should be atleast 5 character long!  '],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    createdAt: Date,
    passwordChangedAt: Date,
    email: {
        type: String,
        required: [true, 'Please provide a email address!  '],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!  '],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!  '],
        select: false,
        validate: {
            validator: function (value) {
                return value.length >= 8;
            },
            message: 'A password must be 8 or more characters long!  ',
        },
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password!  '],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords are not the same!  ',
        },
    },
    emailConfirmToken: {
        type: String,
        select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// userSchema.index({ username: 'text' });

userSchema.pre('save', function (next) {
    this.createdAt = new Date();
    next();
});
/*
this.isModified ->Returns true if this document was modified, else false. 
If path is given, checks if a path or any full path containing path as 
part of its path chain has been modified.
*/
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (
    currentPassword,
    savedPassword
) {
    return await bcrypt.compare(currentPassword, savedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimesStamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimesStamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
