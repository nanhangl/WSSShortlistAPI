const mongoose = require('mongoose');
const uuid = require('uuid');

const User = mongoose.model('Users', { 
    user_no: {
        type: String,
        unique: true,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_pwd: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    check_no: {
        type: String,
        required: true
    },
    photo: String,
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    }
});

module.exports = User;