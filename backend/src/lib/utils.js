import jwt from 'jsonwebtoken';
export const genarateToken=(userId,role,res)=>{
    const token=jwt.sign({userId,role},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"Strict",
        secure:process.env.NODE_ENV!=="development"
    })

    return token;
}