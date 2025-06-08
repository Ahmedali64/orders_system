
const db = require("../models/index");
const {User} = db;


const user = {
    async findUserByEmail(em){
        const userData = await User.findOne({
            where: {email: em},
            attributes: ["id","first_name","last_name","email","role" ,"password","email_verified"]
        });

        if(!userData) return null;
        
        return userData;
    },
    async create(Data){
        const userData = await User.create(Data);

        const user = {
            id:userData.id,
            firstName:userData.first_name,
            lastName:userData.last_name,
            email:userData.email,
            role:userData.role,
            emailVerified:userData.email_verified
        };

        return user;
    },
    async findUserByToken(tok){
        
        if(await User.findOne({where:{email_verification_token: tok}})){
            const user = await User.findOne({where:{email_verification_token: tok}});
            if((user.email_verification_expires < new Date())) return null;
            return user;
        }        
        const user = await User.findOne({where:{password_reset_token: tok}});
        if( !user || (user.password_reset_expires < new Date()) ) return null;
        return user;
    },
    async findUserById (ID){
        const userData = await User.findOne({
            where: {id: ID},
            attributes: ["id","first_name","last_name","email","role","email_verified"]
        });

        if(!userData) return null;
        
        return userData.toJSON();
    }

};


module.exports = user;