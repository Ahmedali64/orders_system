'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cashier_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:"Users",//ref to table name not the model 
          key:"id"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
      },
      waiter_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:"Users",
          key:"id"
        },
        onDelete:"CASCADE",
        onUpdate:"CASCADE"
      },
      status: {
        type: Sequelize.ENUM("pending","complete","expired"),
        allowNull:false
      },
      total_cost: {
        type: Sequelize.FLOAT,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};