'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Items table
    await queryInterface.addIndex('Items', ['expiry_date']);
    await queryInterface.addIndex('Items', ['category']);

    // Orders table
    await queryInterface.addIndex('Orders', ['status']);
    await queryInterface.addIndex('Orders', ['cashier_id']);
    await queryInterface.addIndex('Orders', ['waiter_id']);

    // OrderItems table
    await queryInterface.addIndex('OrderItems', ['order_id']);
    await queryInterface.addIndex('OrderItems', ['item_id']);
    await queryInterface.addConstraint('OrderItems', {
      fields: ['order_id', 'item_id'],
      type: 'unique',
      name: 'unique_order_item'
    });

    // Users table (email is already unique by schema)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Items', ['expiry_date']);
    await queryInterface.removeIndex('Items', ['category']);
    await queryInterface.removeIndex('Orders', ['status']);
    await queryInterface.removeIndex('Orders', ['cashier_id']);
    await queryInterface.removeIndex('Orders', ['waiter_id']);
    await queryInterface.removeIndex('OrderItems', ['order_id']);
    await queryInterface.removeIndex('OrderItems', ['item_id']);
    await queryInterface.removeConstraint('OrderItems', 'unique_order_item');
  }
};