const mongoose = require('mongoose');
const uuid = require('uuid');

const File = mongoose.model('Files', { 
    guid: {
        type: String,
        default: uuid.v4,
        required: true
    },
    file_name: {
        type: String,
        required: true
    },
    is_dir: {
        type: String,
        required: true
    },
    is_root: {
        type: String,
        required: true
    },
    parent_guid: {
        type: String
    }
});

module.exports = User;