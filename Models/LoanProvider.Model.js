const { DataTypes } = require('sequelize');

const dbInstance = require('../config/dbConfig');

const ApplicationListModel = require('../Models/ApplicationList.Model');

const LoanProvider = dbInstance.define("loan_provider", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    provider_code: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    provider_name: {
        allowNull: true,
        type: DataTypes.STRING,
    }
},
    {
        // createdAt: true,
        // updatedAt: true,
        // deletedAt: true,
        timestamps: false,
        tableName: "loan_provider"
    }
)


module.exports = LoanProvider;