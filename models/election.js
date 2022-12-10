'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Election.belongsTo(models.User,{
        foreignKey: 'userId'
      })
    }

    static addElection({ electionName }, userId ) {
      return this.create({ electionName: electionName, launched: false, userId: userId });
    }

    static getElections() {
      return Election.findAll();
    }

    setLaunchedStatus(status){
      return this.update({ 
        launched: status, 
        
      }
      );
    }

    deleteElection() {
      return Election.destroy({
        where: {
          id: this.id
        }
      });
    }


  }
  Election.init({
    electionName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, 20],
          msg: "Election Name should be more than five characters!"
        },
        notNull: true
      }
    },
    launched: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Election',

  });
  return Election;
};