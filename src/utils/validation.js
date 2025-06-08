const joi = require("joi");

const registerValidation = joi.object({
    firstName: joi.string()
    .min(2)
    .max(10)
    .pattern(/^[a-zA-Z\s-]+$/)
    .trim()
    .required()
    .messages({"string.pattern.base": "firstName can only contain letters, spaces, and hyphens."}),

    lastName: joi.string()
    .min(3)
    .max(10)
    .pattern(/^[a-zA-Z\s-]+$/)
    .trim()
    .required()
    .messages({"string.pattern.base": "firstName can only contain letters, spaces, and hyphens."}),
    
    email: joi.string()
    .email()
    .trim()
    .required(),
    
    password: joi.string()
    .min(8)
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
    }),

    passwordConfirm: joi.string()
    .valid(joi.ref('password'))
    .trim()
    .required()
    .messages({
        "any.only": "Password and confirm password do not match",
    }),
    
    role: joi.string()
    .valid("manager","admin","cashier","waiter")
    .lowercase()
    .trim()
    .required(),
});
const loginValidation = joi.object( { 
    email: joi.string().email().trim().required(),
    password: joi.string().min(8).trim().required(),
});

const itemValidation = joi.object({
  name: joi.string().min(2).max(50).required(),
  description: joi.string().min(5).max(255).required(),
  price: joi.number().positive().required(),
  category: joi.string().valid("food", "beverages", "others").required(),
  expiryDate: joi.date().greater("now").required(),
  stockQuantity: joi.number().integer().min(0).required(),
});
const itemUpdateValidation = joi.object({
  name: joi.string().min(2).max(50),
  description: joi.string().min(5).max(255),
  price: joi.number().positive(),
  category: joi.string().valid("food", "beverages", "others"),
  expiryDate: joi.date().greater("now"),
  stockQuantity: joi.number().integer().min(0),
});
const filterValidation = joi.object({
  category: joi.string().valid("food", "beverages", "others"),
  sortBy: joi.string().valid("name", "price", "expiry_date", "total_stock_value"),
  order: joi.string().valid("asc", "desc")
});

module.exports = { registerValidation , loginValidation , itemValidation ,itemUpdateValidation ,filterValidation };