'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Questions','electionId',{
      type: Sequelize.DataTypes.INTEGER
    });

    await queryInterface.addConstraint('Questions',{
      fields: ['electionId'],
      type:'foreign key',
      references:{
        table:'Elections',
        field: 'id'
      }
    });
  },
// eslint-disable-next-line no-unused-vars
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Questions','electionId');
  }
};
