const user = require("../utils/userModelHelper");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const redis = require("../config/redis");
const jwt = require("jsonwebtoken");
const generateTokens = require("../utils/genTokens");
const {publishToQueue} = require("../config/rabbitmq")


const register = async ( req , res ) => {
    try{
        const {firstName, lastName, email, password, role} = req.body;
        
        if(await user.findUserByEmail(email) !== null){
            
           return res.status(400).json({message: "User already exists."}); 
        };
        
        const hasedPassword = await bcrypt.hash(password , 12);
        //make a token for email verification
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); 
        
        const userData = {
            first_name:firstName,
            last_name:lastName,
            email,
            password:hasedPassword,
            role,
            email_verified:false,
            email_verification_token: token,
            email_verification_expires: expires
        };
        //save user data 
        const finalUser = await user.create(userData);
        //make a url to redirect him to email verification endpoint 
        const verifyUrl = `http://localhost:${process.env.PORT}/auth/verify-email?token=${token}`;
        //add email to the queue and we gonna make a worker to send emails auto 
        publishToQueue({
            type: 'VERIFY_EMAIL',//FOR THE WORKER
            to: finalUser.email,
            verifyUrl
        });

        res.status(201).json({ message: "User registered successfully", 
            note:"We have sent you and email to verify your email please check it."});
    }catch(err){
        res.status(500).json({ message: "Server error", err: err.message });
    }

};

const resendVerificationEmail = async ( req , res ) => {
    try {
        const { email } = req.body;
        const userFound = await user.findUserByEmail(email);

        if (!userFound) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userFound.email_verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate new token and expiry
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        userFound.email_verification_token = token;
        userFound.email_verification_expires = expires;
        await userFound.save();

        const verifyUrl = `http://localhost:${process.env.PORT}/auth/verify-email?token=${token}`;
        publishToQueue({
            type: 'VERIFY_EMAIL',
            to: userFound.email,
            verifyUrl
        });

        res.status(200).json({ message: "Verification email resent" });
    } catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};

const verifyEmail = async ( req , res ) => {
    try{
        const token = req.query.token;
  
        if(!token){
            return res.status(400).json({ message: "Verification token is required." });;
        }

        const userFound = await user.findUserByToken(token);
         if (userFound === null) {
            return res.status(400).json({ message: "Invalid or expired verification token." });
        };

        userFound.email_verified = true;
        userFound.email_verification_token = null;
        userFound.email_verification_expires = null;
        await userFound.save();
        res.status(200).json({ message: "Email verified successfully. You can now log in." });
    }catch(err){
        res.status(500).json({ message: "Server error while varifying your token", err: err.message });
    }

};

const forgotPassword = async ( req , res ) => {
    try{
        const { email } = req.body;
        const userData = await user.findUserByEmail(email);
        if ( userData === null) return res.status(404).json({ message: "User not found" });

        //if he exists make token and send him the url 
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600 * 1000); // expires in 1 hour

        // Save token to DB
        userData.password_reset_token = token;
        userData.password_reset_expires = expires;
        await userData.save();

        // Send email
        const resetUrl = `http://localhost:${process.env.PORT}/reset-password?token=${token}`;

        publishToQueue({
            type: "RESET_PASSWORD",
            to: email,
            resetUrl
        });

        res.status(200).json({ message: 'Password reset email sent' , resetToken: token } );
    }catch(err){
        res.status(500).json({ message: "Server error", err: err.message });
    }
};

const resetPassword = async ( req , res ) => { 
    try{
        //based on the frontend u wil get the params like this  
        // const token = req.query.token;
        // const { newPassword } = req.body;
        const { token , newPassword  } = req.body;
        const userData = await user.findUserByToken(token);
        if (userData === null ) return res.status(400).json({ message: 'Invalid or expired token' });

        // Update password
        userData.password = await bcrypt.hash(newPassword , 12 );
        userData.password_reset_token = null;
        userData.password_reset_expires = null;
        await userData.save();

        res.status(200).json({ message: 'Password updated successfully' });
    }catch(err){
         res.status(500).json({ message: "Server error while updating your password", err: err.message });
    }
};

const login = async ( req , res ) => {
    try{
        const {email , password} = req.body;
        //here i did not make the 2 cons in the same if cause i have to find user to compare his pass first 
        const userData = await user.findUserByEmail(email);
        if (userData === null) {
            return res.status(400).json({ message: "Invalid credentials" });
        };
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        };

        if(userData.email_verified === false){
            return res.status(400).json({ message: "Your email is not verified" });
        };

        if (userData.role === "manager" ) {

            req.session.userId = userData.id;
            req.session.role = userData.role;
            return res.status(200).json({ message: "Manager logged in successfully" });
        }else if (userData.role === "admin") {

            req.session.userId = userData.id;
            req.session.role = userData.role;
            return res.status(200).json({ message: "Admin logged in successfully" });
        }else{

            const { accessToken, refreshToken } = await generateTokens(userData);
            return res.status(200).json({ message: "Login successful",  accessToken, refreshToken });
        };
    }catch(err){
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

const logout = async ( req , res )  => {
  try {
    // 1. Handle Session Logout (Managers/Admins)
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        res.clearCookie("connect.sid", { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === "production" 
        });
        
        return res.status(200).json({ message: "Logged out successfully" });
      });
      return; // Prevent further execution
    }

    // 2. Handle JWT Logout (waiter/cashier)
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await redis.del(decoded.id); // Remove refresh token
      } catch (err) {
        console.log("Refresh token error (likely expired):", err);
        return res.status(500).json({ message: "Server error while deleting refresh token", error: err.message });
      }
    }

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    console.error("Server error during logout:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const refreshToken = async( req , res ) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "you must send a refresh token!" });

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Check if token exists in Redis
        const storedToken = await redis.get(decoded.id);
        if (refreshToken !== storedToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        };

        // Get user data and generate new access token
        const userData = await user.findUserById(decoded.id);
        if ( userData === null ) {
            return res.status(404).json({ message: "User not found" });
        }
        const { accessToken:newAccessToken, refreshToken:newRefreshToken } = await generateTokens(userData);
        res.status(200).json({ message:"Your new tokens", newAccessToken, newRefreshToken });
    } catch (err) {
        res.status(401).json({ message: "Invalid ref token" , error: err.message });
    }
};

module.exports = { register , verifyEmail , forgotPassword , resetPassword , login , logout , refreshToken , resendVerificationEmail };
