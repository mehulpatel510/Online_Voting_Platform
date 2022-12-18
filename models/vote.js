'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vote.belongsTo(models.Voter,{
        foreignKey: 'voterId'
      })
      Vote.belongsTo(models.Question,{
        foreignKey: 'questionId'
      })
      Vote.belongsTo(models.Option,{
        foreignKey: 'optionId'
      })
    }

    static async addVote( voterId, questionId , optionId) {
      return this.create({ voterId:voterId, questionId:questionId, optionId: optionId });
    }

  }
  Vote.init({
    voterId: DataTypes.INTEGER,
    questionId: DataTypes.INTEGER,
    optionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Vote',
  });
  return Vote;
};