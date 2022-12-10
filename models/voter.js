'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voter.belongsTo(models.Election,{
        foreignKey: 'electionId'
      })
    }

    static addVoter({ voterId, password }, electionId) {
      
      return this.create({ voterId:voterId,password:password, electionId: electionId });
    }

    deleteVoter() {
      return Voter.destroy({
        where: {
          id: this.id
        }
      });
    }
    
  }
  Voter.init({
    voterId: {
      type: DataTypes.STRING,
      unique: {
        msg: "Voter ID already exists!" 
      },
      allowNull: false,
      validate: {
        len: {
          args: [5],
          msg: "Voter ID required five characters!"
        },
        notNull: true
      }
      
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true
      }
    }
  }, {
    sequelize,
    modelName: 'Voter',
  });
  return Voter;
};