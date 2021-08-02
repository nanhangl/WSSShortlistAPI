const mongoose = require('mongoose');
const uuid = require('uuid');

const File = mongoose.model('Files', { 
    guid: {
        type: String,
        default: uuid.v4,
        required: true,
        unique: true
    },
    file_name: {
        type: String,
        required: true
    },
    is_dir: {
        type: Boolean,
        required: true
    },
    is_root: {
        type: Boolean,
        required: true
    },
    parent_dir_guid: {
        type: String
    },
    path_to_current: {
        type: String
    },
    user_id: {
        type: String,
        required: true
    }
});

module.exports = File;