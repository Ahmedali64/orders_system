'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
      OrderItem.belongsTo(models.Item, { foreignKey: 'item_id' });
    }
  }
  OrderItem.init({
    order_id: {
        type: DataTypes.INTEGER,
        allowNull:false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull:false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};