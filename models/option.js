'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Option.belongsTo(models.Question,{
        foreignKey: 'questionId'
      })
    }

    static addOption( optionText , questionId) {
      return this.create({ optionText: optionText, questionId: questionId });
    }

    
    static deleteOptions(questionId) {
      return Option.destroy({
        where: {
          questionId: questionId
        }
      });
    }

    static getOptions(question_Id)
    {
      return Option.findAll({where:{questionId: question_Id}})
    }

    updateOptionText(optionText){
      return this.update({optionText: optionText});
    }
    
    deleteOption() {
      return Option.destroy({
        where: {
          id: this.id
        }
      });
    }

  }
  Option.init({
    optionText: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, 20],
          msg: "Option should be more than five characters!"
        },
        notNull: true
      }
    },
  }, {
    sequelize,
    modelName: 'Option',
  });
  return Option;
};