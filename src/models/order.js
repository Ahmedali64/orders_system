'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //user table relations
      Order.belongsTo(models.User,{
        foreignKey:"cashier_id",
        as:"cashier"
      });
      Order.belongsTo(models.User,{
        foreignKey:"waiter_id",
        as:"waiter"
      });
      //items table relations
      Order.belongsToMany(models.Item,{
        through: models.OrderItem,
        foreignKey:"order_id",
        otherKey:"item_id",
        as:"items"
      })
    }
  }
  Order.init({
      cashier_id: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      waiter_id: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      status: {
        type: DataTypes.ENUM("pending","complete","expired"),
        allowNull:false
      },
      total_cost: {
        type: DataTypes.FLOAT,
        allowNull:false
      }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};