'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Items', [
      {
        name: 'Cheeseburger',
        description: 'Juicy grilled beef patty with cheese, lettuce, and tomato.',
        price: 8.99,
        category: 'food',
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
        stock_quantity: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lemonade',
        description: 'Freshly squeezed lemonade.',
        price: 2.5,
        category: 'beverages',
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // 10 days from now
        stock_quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with fudge icing.',
        price: 4.75,
        category: 'food',
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
        stock_quantity: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coffee',
        description: 'Hot brewed coffee.',
        price: 1.99,
        category: 'beverages',
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days from now
        stock_quantity: 80,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Napkins Pack',
        description: 'Pack of 100 paper napkins.',
        price: 3.0,
        category: 'others',
        expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year from now
        stock_quantity: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Expired Milk',
        description: 'A carton of milk that is past its expiry date.',
        price: 1.5,
        category: 'beverages',
        expiry_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        stock_quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items', null, {});
  }
};
