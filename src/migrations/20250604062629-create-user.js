'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      email: {
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
      },
      password: {
        type: Sequelize.STRING,
        allowNull:false
      },
      role: {
        type: Sequelize.ENUM("manager","admin","cashier","waiter"),
        allowNull:false
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      email_verification_token: {
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue:null
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull:true,
        defaultValue:null
      }, 
      password_reset_token: {
        type: Sequelize.STRING,
        allowNull:true,
        defaultValue:null
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull:true,
        defaultValue:null
      }, 
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};