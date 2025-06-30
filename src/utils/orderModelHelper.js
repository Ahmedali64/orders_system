const db = require("../models/index");

const {Order} = db;

const orderItem = {
    async create(cashier_id,waiter_id){
        const order = await Order.create({cashier_id,waiter_id});

        return order.toJSON();
    },
    async getOrderById(id){
        const orderData = await Order.findByPk(id);
        if(!orderData) return null;
        return orderData.toJSON();
    },
    async update ( id , data ) {
        //[affectedRows , returning: true || false]
        const [affectedRows] = await Order.update(data, {
                where: { id }
            });
        if (affectedRows === 0) return null;
            
        const updatedOrder = await Order.findByPk(id);
        return updatedOrder ? updatedOrder.toJSON() : null;
    }
};

module.exports = orderItem;