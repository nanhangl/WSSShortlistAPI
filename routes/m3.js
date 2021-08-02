var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer  = require('multer')
const secrets = require('../secrets');
var User = require('../nosqlmodals/User');

var profile_photo_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/user_content/profile_photos')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

var profile_photo = multer({ 
    storage: profile_photo_storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(null, false);
        }
        callback(null, true);
    },
});

/* GET GetUserInfo */
router.get('/GetUserInfo', function (req, res, next) {
    try {
        const { user_no } = req.query;
        if (user_no) {
            User.findOne({
                user_no
            }).select("-user_pwd").then(user => {
                if (user) {
                    res.json({
                        IsSuccess: true,
                        Result: user._doc
                    });
                } else {
                    res.json({
                        IsSuccess: false,
                        ErrMsg: "no such user"
                    });
                };
            });
        } else {
            res.json({
                IsSuccess: false,
                ErrMsg:"user_no can't be empty"
            });
        };
    } catch (err) {
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

/* POST UpdateUserInfo */
router.post('/UpdateUserInfo', profile_photo.single('photo'), function (req, res, next) {
    try {
        var { user_no, user_name } = req.body;
        var photo = req.file;
        if (user_no) {
            User.findOne({
                user_no
            }).then(user => {
                if (user) {
                    user_name ? '' : user_name = user.user_name;
                    photo = photo ? `${req.headers.host}/user_content/profile_photos/${photo.filename}` : user.photo;
                    user.user_name = user_name;
                    user.photo = photo;
                    user.save();
                    res.json({
                        IsSuccess: true,
                        PhotoUrl: photo
                    });
                } else {
                    fs.rm(photo.path, () => {});
                    res.json({
                        IsSuccess: false,
                        ErrMsg:"no such user"
                    });
                };
            })
        } else {
            fs.rm(photo.path, () => {});
            res.json({
                IsSuccess: false,
                ErrMsg:"user_no can't be empty"
            });
        };
    } catch (err) {
        fs.rm(photo.path, () => {});
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

/* POST FileList */
router.post('/FileList', function (req, res, next) {
    try {
        const { user_no, parent_dir_guid } = req.body;
        if (user_no) {
            User.findOne({
                user_no
            }).then(async user => {
                if (user) {
                    try {
                        fs.readdir(`public/user_content/${user_id}`, (err, files) => {
                            if (err) {
                                res.json({
                                    IsSuccess: false,
                                    ErrMsg: 'no such directory'
                                });
                            } else {
                                console.log(files);
                                res.json({
                                    IsSuccess: true,
                                    Result: {
            
                                    }
                                });
                            }
                        });
                    } catch (err) {
                        console.log(err)
                        res.json({
                            IsSuccess: false,
                            ErrMsg: 'unknown error'
                        });
                    }
                } else {
                    res.json({
                        IsSuccess: false,
                        ErrMsg: "no such user"
                    });
                };
            });
        } else {
            res.json({
                IsSuccess: false,
                ErrMsg:"user_no can't be empty"
            });
        };
    } catch (err) {
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

module.exports = router;