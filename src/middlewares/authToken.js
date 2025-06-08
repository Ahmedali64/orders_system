const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
    //i made this casue i will put this middleware before the RBAC middleware 
    //and when an manager or admin want to access an endpoint it should pass through this 
    if(req.session.role || req.session.userid){
        return next();
    }
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = decoded; // Attach user data to the request role and id 
        
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" , err: err.message });
    }
}

module.exports = authToken;