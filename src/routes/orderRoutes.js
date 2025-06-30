const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authToken = require("../middlewares/authToken");
const authorizedRoles = require("../middlewares/allowedRoles");

// Create a new order
router.post("/create", 
    authToken,
    authorizedRoles("cashier"),
    orderController.createOrder
);

// Add item to order
router.post("/add-item",
    authToken,
    authorizedRoles("cashier"),
    orderController.addItem
);

// Remove item from order
router.delete("/remove-item",
    authToken,
    authorizedRoles("cashier")  ,
    orderController.deleteItem
);

// Update order status 
router.patch("/update-status",
    authToken,
    authorizedRoles("cashier")  ,
    orderController.updateOrderStatus
);

// Get all waiters 
router.get("/waiters",
    authToken,
    authorizedRoles("cashier"),
    orderController.getAllWaiters
);

module.exports = router;