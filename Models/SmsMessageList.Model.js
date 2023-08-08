const { DataTypes } = require('sequelize');

const dbInstance = require('../config/dbConfig');

const SmsMessageList = dbInstance.define("sms_message_list", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    sms_code: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    message: {
        allowNull: false,
        type: DataTypes.TEXT,
    },
    message_type: {
        allowNull: false,
        type: DataTypes.STRING,
    }
},
    {
        // createdAt: true,
        // updatedAt: true,
        // deletedAt: true,
        timestamps: false,
        tableName: "sms_message_list"
    }
)

module.exports = SmsMessageList;