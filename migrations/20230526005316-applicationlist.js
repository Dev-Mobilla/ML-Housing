'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('application_list', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_reference: {
        allowNull: false,
        type: Sequelize.STRING
      },
      application_type: {
        allowNull: false,
        type: Sequelize.STRING,
        
      },
      application_date: {
        allowNull: false,
        type: Sequelize.STRING
      },
      loan_provider: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      firstname: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING
      },
      suffix: {
        allowNull: true,
        type: Sequelize.STRING
      },
      birth_date: {
        allowNull: false,
        type: Sequelize.STRING
      },
      gender: {
        allowNull: false,
        type: Sequelize.STRING
      },
      citizenship: {
        allowNull: false,
        type: Sequelize.STRING
      },
      civil_status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      mobile_number: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email_address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      source_of_funds: {
        allowNull: false,
        type: Sequelize.STRING
      },
      gross_monthly_income: {
        allowNull: false,
        type: Sequelize.STRING
      },
      mother_maiden_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      residence_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      length_of_stay: {
        allowNull: false,
        type: Sequelize.STRING
      },
      application_status: {
        allowNull: true,
        type: Sequelize.STRING,
      }
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('application_list');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
