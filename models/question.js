'use strict';
const {
  Model, Option
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.belongsTo(models.Election,{
        foreignKey: 'electionId'
      })
    }
    static addQuestion({ questionText, description }, electionId) {
      console.log("Election Id for question:" + electionId)
      return this.create({ questionText: questionText, description: description.trim(), electionId: electionId });
    }

    static async getQuestionText(id)
    {
      const question = await Question.findByPk(id);
      console.log("Question Text:" + question.questionText )
      return question.questionText;
    }

    async updateQuestion({questionText, description })
    {
      // this.questionText = questionText;
      // this.description = description;

      
      return this.update({questionText: questionText, description: description});
    }

    
    async deleteQuestion() {
      // await Option.deleteOptions(this.id)
      return Question.destroy({
        where: {
          id: this.id
        }
      });
    }
  }
  Question.init({
    questionText: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, ],
          msg: "Question Text should be more than five characters!"
        },
        notNull: true
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, ],
          msg: "Description should be more than five characters!"
        },
        notNull: true
      }
    },
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};