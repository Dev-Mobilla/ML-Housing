const { DataTypes } = require('sequelize');

const dbInstance = require('../config/dbConfig');

const ApplicationListModel = require('../Models/ApplicationList.Model');

const ApplicationType = dbInstance.define("application_type", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    application_type_code: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    label: {
        allowNull: true,
        type: DataTypes.STRING,
    }
},
    {
        // createdAt: true,
        // updatedAt: true,
        // deletedAt: true,
        timestamps: false,
        tableName: "application_type"
    }
)

// ApplicationType.belongsTo(ApplicationListModel, {
//     foreignKey: "application_type_code",
//     targetKey: "application_type",
//     constraints: true
// })

module.exports = ApplicationType;