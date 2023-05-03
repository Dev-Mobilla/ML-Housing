const { DataTypes } = require('sequelize');

const dbInstance = require('../config/dbConfig');

const application = dbInstance.define("loan_application", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    applicationId: {
        allowNull: false,
        type: DataTypes.STRING
    },
    applicationType: {
        allowNull: false,
        type: DataTypes.STRING
    },
    date: {
        allowNull: false,
        type: DataTypes.STRING
    },
    resident: {
        allowNull: false,
        type: DataTypes.STRING
    },
    firstname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    middlename: {
        allowNull: true,
        type: DataTypes.STRING
    },
    lastname: {
        allowNull: false,
        type: DataTypes.STRING
    },
    civil_status: {
        allowNull: false,
        type: DataTypes.STRING
    },
    birth_date: {
        allowNull: false,
        type: DataTypes.STRING
    },
    name_of_mother: {
        allowNull: false,
        type: DataTypes.STRING
    },
    gender: {
        allowNull: false,
        type: DataTypes.STRING
    },
    gross_monthly_income: {
        allowNull: false,
        type: DataTypes.STRING
    },
    source_of_funds: {
        allowNull: false,
        type: DataTypes.STRING
    },
    address: {
        allowNull: false,
        type: DataTypes.STRING
    },
    length_of_stay: {
        allowNull: false,
        type: DataTypes.STRING
    },
    residence_type: {
        allowNull: false,
        type: DataTypes.STRING
    },
    mobile_number: {
        allowNull: false,
        type: DataTypes.STRING
    },
    email: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    confirmEmail: {
        allowNull: false,
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    }
},
    {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        tableName: "loan_application"
    }
)

module.exports = application;