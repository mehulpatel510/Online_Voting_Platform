'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Voters','electionId',{
      type: Sequelize.DataTypes.INTEGER
    });

    await queryInterface.addConstraint('Voters',{
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
    await queryInterface.removeColumn('Voters','electionId');
  }
};
