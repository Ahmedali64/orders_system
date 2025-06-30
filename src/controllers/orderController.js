const order = require("../utils/orderModelHelper");
const user = require("../utils/userModelHelper")
const item = require("../utils/itemModelHelper");
const orderItems = require("../utils/orderItemsModelHelper");
const { sequelize } = require("../models");

const createOrder = async ( req , res ) => {
    try{
        const { waiterId } = req.body;
        const cashierId = req.user.id;
        const waiterExists = await user.findUserById(waiterId);
        if(waiterExists == null) return res.status(404).json({message:"Not Valid waiter Id"});

        const finalOrder = await order.create(cashierId,waiterId);

        res.status(201).json({message: "Order created", orderData: finalOrder});
    }catch(err){
        res.status(500).json({message:"An error ocuured while creating order" , error:err.message});
    }
};
const addItem = async ( req , res ) => {
 const t = await sequelize.transaction();
    try {
        const { orderId, itemId, quantity } = req.body;

        const orderExists = await order.getOrderById(orderId, { transaction: t });
        if (!orderExists) {
            await t.rollback();
            return res.status(404).json({ message: "Order not found." });
        }

        const itemData = await item.getItemById(itemId, { transaction: t });
        if (!itemData) {
            await t.rollback();
            return res.status(404).json({ message: "Item not found." });
        }

        if (itemData.stock_quantity < quantity) {
            await t.rollback();
            return res.status(404).json({ message: "Not enough stock quantity" });
        }

        if (new Date(itemData.expiry_date) < new Date()) {
            await t.rollback();
            return res.status(400).json({ message: "Cannot add expired item to order." });
        }

        const orderData = { orderId, itemId, quantity };
        const orderItem = await orderItems.addItem(orderData, { transaction: t });
        if (!orderItem) {
            await t.rollback();
            return res.status(400).json({ message: "Error while adding item to your order." });
        }

        // Update total cost
        const itemTotalCost = itemData.price * quantity;
        const newTotalCost = orderExists.total_cost + itemTotalCost;
        const newOrder = await order.update(orderId, { total_cost: newTotalCost }, { transaction: t });
        if (!newOrder) {
            await t.rollback();
            return res.status(500).json({ message: "Server error while updating total cost." });
        }

        // Decrease stock
        const newStock = itemData.stock_quantity - quantity;
        const newItem = await item.update(itemId, { stock_quantity: newStock }, { transaction: t });
        if (!newItem) {
            await t.rollback();
            return res.status(500).json({ message: "Server error while updating stock quantity." });
        }

        await t.commit();
        res.status(200).json({ message: "Item added successfully", order: newOrder });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
const deleteItem = async ( req , res ) => {
    const t = await sequelize.transaction();
    try {
        const { orderId, itemId } = req.body;

        const orderExists = await order.getOrderById(orderId, { transaction: t });
        if (!orderExists) {
            await t.rollback();
            return res.status(404).json({ message: "Order not found." });
        }

        const itemInOrder = await orderItems.getItemInOrder(orderId, itemId, { transaction: t });
        if (!itemInOrder) {
            await t.rollback();
            return res.status(404).json({ message: "Item not found in order." });
        }

        // Delete the item from the order
        const deletedCount = await orderItems.deleteItem(orderId, itemId, { transaction: t });
        if (deletedCount === 0) {
            await t.rollback();
            return res.status(404).json({ message: "Item not found in order." });
        }

        // Update order total
        const itemData = await item.getItemById(itemId, { transaction: t });
        const itemTotalCost = itemData.price * itemInOrder.quantity;
        const newTotalCost = orderExists.total_cost - itemTotalCost;
        await order.update(orderId, { total_cost: newTotalCost }, { transaction: t });

        // Restore stock
        const newStock = itemData.stock_quantity + itemInOrder.quantity;
        await item.update(itemId, { stock_quantity: newStock }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
const updateOrderStatus = async ( req , res ) => {
    const t = await sequelize.transaction();
    try {
        const { orderId, status } = req.body;
        const validStatuses = ["pending", "complete", "expired"];
        if (!validStatuses.includes(status)) {
            await t.rollback();
            return res.status(400).json({ message: "Invalid status." });
        }

        const orderExists = await order.getOrderById(orderId, { transaction: t });
        if (!orderExists) {
            await t.rollback();
            return res.status(404).json({ message: "Order not found." });
        }

        await order.update(orderId, { status }, { transaction: t });
        await t.commit();
        res.status(200).json({ message: "Order status updated successfully." });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
const getAllWaiters = async ( req , res ) => {
    try {
        const waiters = await user.getUsersByRole("waiter");
        res.status(200).json({ waiters });
    } catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
}

module.exports = { createOrder , addItem , deleteItem , updateOrderStatus , getAllWaiters }