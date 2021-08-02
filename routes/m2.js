var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var User = require('../nosqlmodals/User');

/* POST Login */
router.post('/Login', function (req, res, next) {
    try {
        const { user_no, user_pwd } = req.body;
        if (user_no) {
            if (user_pwd) {
                User.findOne({
                    user_no
                }).then(user => {
                    if (user) {
                        bcrypt.compare(user_pwd, user.user_pwd).then(passwordCorrect => {
                            if (passwordCorrect) {
                                res.json({
                                    IsSuccess: true,
                                    Result: {
                                        
                                    }
                                });
                            } else {
                                res.json({
                                    IsSuccess: false,
                                    ErrMsg:"wrong password"
                                });
                            }
                        });
                    } else {
                        res.json({
                            IsSuccess: false,
                            ErrMsg:"no such user"
                        });
                    };
                });
            } else {
                res.json({
                    IsSuccess: false,
                    ErrMsg:"user_pwd can't be empty"
                });
            };
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

/* GET CheckNo */
router.get('/CheckNo', function (req, res, next) {
    try {
        const { mobile } = req.query;
        if (mobile) {
            User.findOne({
                mobile
            }).then(user => {
                if (user) {
                    res.json({
                        IsSuccess: true,
                        Result: {
                            check_no: user.check_no
                        }
                    });
                } else {
                    res.json({
                        IsSuccess: false,
                        ErrMsg:"no such user"
                    });
                };
            });
        } else {
            res.json({
                IsSuccess: false,
                ErrMsg:"mobile can't be empty"
            });
        };
    } catch (err) {
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

/* POST Register */
router.post('/Register', function (req, res, next) {
    try {
        const { user_no, user_name, user_pwd, mobile, check_no } = req.body;
        if (user_no) {
            if (user_name) {
                if (user_pwd) {
                    if (mobile) {
                        if (check_no) {
                            bcrypt.hash(user_pwd, 10).then(hashedPwd => {
                                User.create({
                                    user_no,
                                    user_name,
                                    user_pwd: hashedPwd,
                                    mobile,
                                    check_no
                                }).then(user => {
                                    res.json({
                                        IsSuccess: true
                                    });
                                });
                            });
                        } else {
                            res.json({
                                IsSuccess: false,
                                ErrMsg:"check_no can't be empty"
                            });
                        };
                    } else {
                        res.json({
                            IsSuccess: false,
                            ErrMsg:"mobile can't be empty"
                        });
                    };
                } else {
                    res.json({
                        IsSuccess: false,
                        ErrMsg:"user_pwd can't be empty"
                    });
                };
            } else {
                res.json({
                    IsSuccess: false,
                    ErrMsg:"user_name can't be empty"
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

/* POST UserCheck */
router.post('/UserCheck', function (req, res, next) {
    try {
        const { user_no } = req.body;
        if (user_no) {
            User.findOne({
                user_no
            }).then(user => {
                if (user) {
                    res.json({
                        IsSuccess: true,
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

/* GET UserList */
router.get('/UserList', function (req, res, next) {
    try {
        User.find().select("-user_pwd").then(users => {
            res.json({
                IsSuccess: true,
                Result: users
            });
        })
    } catch (err) {
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

/* GET UserNoList */
router.get('/CheckNoList', function (req, res, next) {
    try {
        User.find().select("check_no").then(check_nos => {
            res.json({
                IsSuccess: true,
                Result: check_nos
            });
        })
    } catch (err) {
        res.json({
            IsSuccess: false,
            ErrMsg: err
        });
    };
});

module.exports = router;