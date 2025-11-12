import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

export const connectDb=async()=>{
    try{
        const conn=await mysql.createConnection({
            host:process.env.DB_HOST,
            port:process.env.DB_PORT,
            user:process.env.DB_USER,
            password:process.env.DB_PASSWORD,
            database:process.env.DB_NAME,
        });
        console.log("Database connected successfully");
        return conn;
    }catch(error){
        console.log("Database connection failed",error);
        process.exit(1);
    }
}