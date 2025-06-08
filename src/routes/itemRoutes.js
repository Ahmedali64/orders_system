const authorizedRoles = require("../middlewares/allowedRoles");
const {
  addItems,
  getItem,
  getAllItems,
  getFilteredAndSortedItems,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const validation = require("../middlewares/validationMiddleware");
const { itemValidation , itemUpdateValidation , filterValidation } = require("../utils/validation");
const authToken = require("../middlewares/authToken");
const express = require("express");
const joi = require("joi");

const router = express.Router();
const bulkItemValidation = joi.array().items(itemValidation);




router.post("/add", authToken ,  authorizedRoles("admin", "manager") , validation( bulkItemValidation , true ) , addItems);

router.get("/get/:id", authToken , authorizedRoles("admin", "manager", "cashier") , getItem);

router.get("/getAll", authToken , authorizedRoles("admin", "manager", "cashier") , getAllItems);

router.get("/filter" , authToken , authorizedRoles("admin", "manager", "cashier") , validation(filterValidation) , getFilteredAndSortedItems);

router.put("/update/:id", authToken ,authorizedRoles("admin", "manager") , validation( itemUpdateValidation ) ,  updateItem);

router.delete("/delete/:id", authToken , authorizedRoles("admin", "manager") , deleteItem);

module.exports = router;