const express = require("express");
const joi = require("joi");
const authorizedRoles = require("../middlewares/allowedRoles");
const authToken = require("../middlewares/authToken");
const validation = require("../middlewares/validationMiddleware");
const {
  itemValidation,
  itemUpdateValidation,
  filterValidation,
} = require("../utils/validation");
const {
  addItems,
  getItem,
  getAllItems,
  getFilteredAndSortedItems,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();
const bulkItemValidation = joi.array().items(itemValidation);

// Add new items 
router.post(
  "/add",
  authToken,
  authorizedRoles("admin", "manager"),
  validation(bulkItemValidation, true),
  addItems
);

// Get a single item by ID
router.get(
  "/get/:id",
  authToken,
  authorizedRoles("admin", "manager", "cashier"),
  getItem
);

// Get all items
router.get(
  "/getAll",
  authToken,
  authorizedRoles("admin", "manager", "cashier"),
  getAllItems
);

// Filter and sort items
router.get(
  "/filter",
  authToken,
  authorizedRoles("admin", "manager", "cashier"),
  validation(filterValidation),
  getFilteredAndSortedItems
);

// Update an item
router.put(
  "/update/:id",
  authToken,
  authorizedRoles("admin", "manager"),
  validation(itemUpdateValidation),
  updateItem
);

// Delete an item
router.delete(
  "/delete/:id",
  authToken,
  authorizedRoles("admin", "manager"),
  deleteItem
);

module.exports = router;