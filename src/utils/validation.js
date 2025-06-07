const joi = require("joi");

const registerValidation = joi.object({
    firstName: joi.string()
    .min(3)
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
module.exports = { registerValidation , loginValidation };