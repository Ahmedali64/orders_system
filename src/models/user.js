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
    static associate(models) {
      //one to many relation with orders 
      User.hasMany(models.Order,{
        foreignKey:"cashier_id",
        as:"cashierOrders"
      });
      User.hasMany(models.Order,{
        foreignKey:"waiter_id",
        as:"waiterOrders"
      });
    }
  }
  User.init({
    first_name: {
        type: DataTypes.STRING,
        allowNull:false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull:false
      },
      email: {
        type: DataTypes.STRING,
        allowNull:false,
        unique:true
      },
      password: {
        type: DataTypes.STRING,
        allowNull:false
      },
      role: {
        type: DataTypes.ENUM("manager","admin","cashier","waiter"),
        allowNull:false
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      email_verification_token: {
        type: DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },
      email_verification_expires: {
        type: DataTypes.DATE,
        allowNull:true,
        defaultValue:null
      }, 
      password_reset_token: {
        type: DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },
      password_reset_expires: {
        type: DataTypes.DATE,
        allowNull:true,
        defaultValue:null
      }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};