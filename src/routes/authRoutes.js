const express = require("express");
const { register, 
        verifyEmail, 
        forgotPassword, 
        resetPassword, 
        login, 
        logout, 
        refreshToken,
        resendVerificationEmail
    } = require("../controllers/authController");
const { registerValidation , loginValidation } = require("../utils/validation");
const validation = require("../middlewares/validationMiddleware");
const { loginLimiter } = require("../middlewares/rateLimiter");



const router = express.Router();

router.post("/register", validation(registerValidation), register);
router.post("/login",loginLimiter ,validation(loginValidation) , login);
router.delete("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification", resendVerificationEmail); 

router.get("/verify-email", verifyEmail);

module.exports = router;
