const db = require("../models/index");
const {OrderItem} = db;

const orderItems = {
    async addItem(data){
        const order = await OrderItem.create({order_id:data.orderId , item_id:data.itemId  , quantity:data.quantity});
        return order.toJSON();
    },
    async deleteItem(orderId, itemId) {
        // Delete the order item by orderId and itemId
        const deletedCount = await OrderItem.destroy({ where: { order_id: orderId, item_id: itemId } });
        return deletedCount; // returns 1 if deleted, 0 if not found
    },
    async getItemInOrder(orderId, itemId) {
        const itemInOrder = await OrderItem.findOne({
            where: { order_id: orderId, item_id: itemId }
        });
        if (!itemInOrder) return null;
        return itemInOrder.toJSON();
    },
}

module.exports = orderItems;
