'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('loan_application', 'applicationType', {
        allowNull: false,
        type: Sequelize.STRING,
        after:'applicationId'
      }),
      queryInterface.addColumn('loan_application', 'confirmEmail', {
        allowNull: false,
        type: Sequelize.STRING,
        after:'email'
      }),
      queryInterface.addColumn('loan_application', 'resident', {
        allowNull: false,
        type: Sequelize.STRING,
        after:'date',
        validate: {
          isEmail: true
      }
      }),
    ]);
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
