var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var multer  = require('multer')
const secrets = require('../secrets');
var User = require('../nosqlmodals/User');
var FileModal = require('../nosqlmodals/File');

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

var file_upload_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/user_content/tmp')
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

var file_upload = multer({ 
    storage: file_upload_storage,
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
    var photo = req.file;
    try {
        var { user_no, user_name } = req.body;
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
                    if (parent_dir_guid) {
                        FileModal.find({
                            parent_dir_guid
                        }).then(files => {
                            console.log(files);
                            res.json({
                                IsSuccess: true,
                                Result: files
                            });
                        });
                    } else {
                        res.json({
                            IsSuccess: false,
                            ErrMsg: "parent_dir_guid can't be empty"
                        });
                    };
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

/* POST NewFolder */
router.post('/NewFolder', function (req, res, next) {
    try {
        const { user_no, file_name, parent_dir_guid } = req.body;
        if (user_no) {
            if (file_name) {
                User.findOne({
                    user_no
                }).then(user => {
                    if (user) {
                        if (parent_dir_guid) {
                            FileModal.findOne({
                                guid: parent_dir_guid,
                                user_id: user._id
                            }).then(parent => {
                                if (parent) {
                                    FileModal.create({
                                        file_name,
                                        is_dir: true,
                                        is_root: false,
                                        parent_dir_guid,
                                        user_id: user._id
                                    }).then(file => {
                                        file.path_to_current = `${parent.path_to_current}/${file.guid}`;
                                        file.save();
                                        fs.mkdir(`public/user_content/${parent.path_to_current}/${file.guid}`, (err, dir) => {
                                            if (err) {
                                                res.json({
                                                    IsSuccess: false,
                                                    ErrMsg: err
                                                });
                                            } else {
                                                res.json({
                                                    IsSuccess: true
                                                });
                                            };
                                        });
                                    });
                                } else {
                                    res.json({
                                        IsSuccess: false,
                                        ErrMsg: "no such parent"
                                    });
                                };
                            });
                        } else {
                            FileModal.create({
                                file_name,
                                is_dir: true,
                                is_root: true,
                                user_id: user._id
                            }).then(file => {
                                file.path_to_current = file.guid;
                                file.save();
                                fs.mkdir(`public/user_content/${file.guid}`, (err, dir) => {
                                    if (err) {
                                        res.json({
                                            IsSuccess: false,
                                            ErrMsg: err
                                        });
                                    } else {
                                        res.json({
                                            IsSuccess: true
                                        });
                                    };
                                });
                            });
                        };
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
                    ErrMsg:"file_name can't be empty"
                });
            }
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

/* POST NewFile */
router.post('/NewFile', function (req, res, next) {
    try {
        const { user_no, file_name, parent_dir_guid } = req.body;
        if (user_no) {
            if (file_name) {
                if (parent_dir_guid) {
                    User.findOne({
                        user_no
                    }).then(user => {
                        if (user) {
                            FileModal.findOne({
                                guid: parent_dir_guid,
                                user_id: user._id
                            }).then(parent => {
                                if (parent) {
                                    if (parent.is_dir) {
                                        FileModal.create({
                                            file_name,
                                            is_dir: false,
                                            is_root: false,
                                            parent_dir_guid,
                                            user_id: user._id
                                        }).then(file => {
                                            file.path_to_current = `${parent.path_to_current}/${file.guid}`;
                                            file.save();
                                            fs.open(`public/user_content/${parent.path_to_current}/${file.guid}`, 'w', (err, newFile) => {
                                                fs.closeSync(newFile);
                                                if (err) {
                                                    res.json({
                                                        IsSuccess: false,
                                                        ErrMsg: err
                                                    });
                                                } else {
                                                    res.json({
                                                        IsSuccess: true
                                                    });
                                                };
                                            });
                                        });
                                    } else {
                                        res.json({
                                            IsSuccess: false,
                                            ErrMsg: "parent not directory"
                                        });
                                    }
                                } else {
                                    res.json({
                                        IsSuccess: false,
                                        ErrMsg: "no such parent"
                                    });
                                };
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
                        ErrMsg: "parent_dir_guid can't be empty"
                    });
                };
            } else {
                res.json({
                    IsSuccess: false,
                    ErrMsg:"file_name can't be empty"
                });
            }
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

/* POST UploadFile */
router.post('/UploadFile', file_upload.single('file_content'), function (req, res, next) {
    const file_content = req.file;
    try {
        const { user_no, file_name, parent_dir_guid } = req.body;
        if (user_no) {
            if (file_name) {
                if (parent_dir_guid) {
                    if (file_content) {
                        User.findOne({
                            user_no
                        }).then(user => {
                            if (user) {
                                FileModal.findOne({
                                    guid: parent_dir_guid,
                                    user_id: user._id
                                }).then(parent => {
                                    if (parent) {
                                        if (parent.is_dir) {
                                            FileModal.create({
                                                file_name,
                                                is_dir: false,
                                                is_root: false,
                                                parent_dir_guid,
                                                user_id: user._id
                                            }).then(file => {
                                                file.path_to_current = `${parent.path_to_current}/${file.guid}`;
                                                file.save();
                                                fs.renameSync(file_content.path, `public/user_content/${parent.path_to_current}/${file.guid}`);
                                                res.json({
                                                    IsSuccess: true
                                                });
                                            });
                                        } else {
                                            res.json({
                                                IsSuccess: false,
                                                ErrMsg:"parent not directory"
                                            });
                                        }
                                    } else {
                                        res.json({
                                            IsSuccess: false,
                                            ErrMsg:"no such parent"
                                        });
                                    };
                                });
                            } else {
                                fs.rm(file_content.path, () => {});
                                res.json({
                                    IsSuccess: false,
                                    ErrMsg:"no such user"
                                });
                            };
                        });
                    } else {
                        res.json({
                            IsSuccess: false,
                            ErrMsg:"file_content can't be empty"
                        });
                    };
                } else {
                    fs.rm(file_content.path, () => {});
                    res.json({
                        IsSuccess: false,
                        ErrMsg:"parent_dir_guid can't be empty"
                    });
                };
            } else {
                fs.rm(file_content.path, () => {});
                res.json({
                    IsSuccess: false,
                    ErrMsg:"file_name can't be empty"
                });
            };
        } else {
            fs.rm(file_content.path, () => {});
            res.json({
                IsSuccess: false,
                ErrMsg:"user_no can't be empty"
            });
        };
    } catch (err) {
        fs.rm(file_content.path, () => {});
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

module.exports = router;