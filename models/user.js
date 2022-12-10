'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }

    static getUsers() {
      return User.findAll();
    }

    static getEmail(id){
      return User.findOne({where:{id}}).email;
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [5, 20],
          msg: "First Name should be more than five characters!"
        },
        notNull: true
      }
    },
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: "Email id already exists!" 
      },
      allowNull: false,
      validate: {
        isEmail: true,
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
    modelName: 'User',
  });
  return User;
};