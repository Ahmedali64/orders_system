'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Item.belongsToMany(models.Order,{
        through: models.OrderItem,
        foreignKey:"item_id",
        otherKey:"order_id",
        as:"orders"
      })
    }
  }
  Item.init({
      name: {
        type: DataTypes.STRING,
        allowNull:false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull:false
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull:false
      },
      category: {
        type: DataTypes.ENUM("food","beverages","others"),
        allowNull:false
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull:false
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};