const { Sequelize, DataTypes } = require('sequelize');

const sqldb = new Sequelize('wssshortlist', 'wssshortlist', 'P@ssw0rd', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = sqldb.define('User', {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    user_pwd: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    check_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    photo: {
        type: DataTypes.STRING
    },
});

sqldb.sync({ force: false });

module.exports = sqldb;