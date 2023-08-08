const { DataTypes } = require('sequelize');

const dbInstance = require('../config/dbConfig');

const ApplicationTypeModel = require('../Models/ApplicationType.Model');
const LoanProvider = require('./LoanProvider.Model');

const ApplicationList = dbInstance.define("application_list", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    application_reference: {
        allowNull: false,
        type: DataTypes.STRING
    },
    application_type: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    application_date: {
        allowNull: false,
        type: DataTypes.STRING
    },
    loan_provider: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    firstname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    lastname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    suffix: {
        allowNull: true,
        type: DataTypes.STRING
    },
    birth_date: {
        allowNull: false,
        type: DataTypes.STRING
    },
    gender: {
        allowNull: false,
        type: DataTypes.STRING
    },
    citizenship: {
        allowNull: false,
        type: DataTypes.STRING
    },
    civil_status: {
        allowNull: false,
        type: DataTypes.STRING
    },
    address: {
        allowNull: false,
        type: DataTypes.STRING
    },
    mobile_number: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email_address: {
        allowNull: true,
        type: DataTypes.STRING,
    },
    source_of_funds: {
        allowNull: false,
        type: DataTypes.STRING
    },
    gross_monthly_income: {
        allowNull: false,
        type: DataTypes.STRING
    },
    mother_maiden_name: {
        allowNull: false,
        type: DataTypes.STRING
    },
    residence_type: {
        allowNull: false,
        type: DataTypes.STRING
    },
    length_of_stay: {
        allowNull: false,
        type: DataTypes.STRING
    },
    application_status: {
        allowNull: true,
        type: DataTypes.STRING,
    }
},
    {
        // createdAt: true,
        // updatedAt: true,
        // deletedAt: true,
        timestamps: false,
        tableName: "application_list"
    }
)


// ApplicationList.hasOne(ApplicationTypeModel, { as : "application_type"});
// ApplicationList.hasOne(LoanProvider, { as: 'loan_provider'})

module.exports = ApplicationList;