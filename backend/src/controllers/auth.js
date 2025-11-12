import { connectDb } from "../lib/db.js";
import bcrypt from "bcryptjs";
import { genarateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { name, aadhaar, age, username, password, ration_card } = req.body;
  const role = "citizen";
  try {
    if (!name || !aadhaar || !age || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const conn = await connectDb();

    const [existingusers] = await conn
      .promise()
      .query("Select * from citizen where username=?", [username]);
    if (existingusers.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const [exist] = await conn
      .promise()
      .query("Select * from admin where username=?", [username]);
    if (exist.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = [
      name,
      aadhaar,
      age,
      username,
      hashedPassword,
      ration_card || "NULL",
    ];
    if (newUser) {
      const [result] = await conn
        .promise()
        .query(
          "INSERT INTO citizen (name,aadhaar,age,username,password,ration_card) VALUES (?,?,?,?,?,?)",
          newUser
        );

      const userId = result.insertId;
      genarateToken(userId, role, res);

      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signing up:", error);
    if (error.code === "ER_DUP_ENTRY" && error.sqlMessage.includes("aadhaar")) {
      return res.status(400).json({ message: "Aadhaar number already exists" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const role = "citizen";
  const conn = await connectDb();
  try {
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const [adminResults] = await conn
      .promise()
      .query("SELECT * FROM admin WHERE username = ?", [username]);

    if (adminResults.length > 0) {
      const admin = adminResults[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid admin credentials" });

      genarateToken(admin.admin_id, "admin", res);
      return res.status(200).json({
        message: "Admin logged in successfully",
        role: "admin",
      });
    }

    const [results] = await conn
      .promise()
      .query("Select * from citizen where username=?", [username]);
    const user = results[0];
    if (results.length == 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const result = await bcrypt.compare(password, user.password);
    if (!result)
      return res.status(400).json({ message: "Invalid credentials" });

    genarateToken(user.citizen_id, "citizen", res);
    return res.status(200).json({ message: "Logged in successfully" });
  } catch (error) {
    console.log("Error in logging in:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("Error in the log out controller : ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const conn = await connectDb();
    const { name, aadhaar, age, username, password, ration } = req.body;
    if (aadhaar || username || ration) {
      return res
        .status(400)
        .json({ message: "Cannot update aadhaar, username or ration card" });
    }
    if (!name && !age && !password) {
      return res
        .status(400)
        .json({
          message:
            "At least one field (name, age, password) must be provided for update",
        });
    }
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const [existing]=await conn.promise().query("Select * from citizen where citizen_id=?",[req.user.citizen_id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = existing[0];

    const updatedName = name || currentUser.name;
    const updatedAge = age || currentUser.age;
    const updatedPassword = password
      ? await bcrypt.hash(password, bcrypt.genSaltSync(10))
      : currentUser.password;

    await conn
      .promise()
      .query(
        "UPDATE citizen SET name=?, age=?, password=? WHERE citizen_id=?",
        [
          updatedName,
          updatedAge,
          updatedPassword,
          req.user.citizen_id
        ]
      );
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log("Error in updating profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminUpdateProfile = async (req, res) => {
  try {
    const conn = await connectDb();
    const { name, username, password } = req.body;
    if (username ) {
      return res
        .status(400)
        .json({ message: "Cannot update username" });
    }
    if (!name && !password) {
      return res
        .status(400)
        .json({
          message:
            "At least one field (name, password) must be provided for update",
        });
    }
    if (password && password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const [existing]=await conn.promise().query("Select * from admin where admin_id=?",[req.user.admin_id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const currentAdmin = existing[0];

    const updatedName = name || currentAdmin.name;
    const updatedPassword = password
      ? await bcrypt.hash(password, bcrypt.genSaltSync(10))
      : currentAdmin.password;

    await conn
      .promise()
      .query(
        "UPDATE admin SET full_name=?, password=? WHERE admin_id=?",
        [
          updatedName,
          updatedPassword,
          req.user.admin_id
        ]
      );
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log("Error in updating profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProfile=async(req,res)=>{
  try{
    const conn=await connectDb();
    const role=req.user.role;
    if(role==="citizen"){
      const [rows]=await conn.promise().query("Select citizen_id,name,aadhaar,age,username,ration_card from citizen where citizen_id=?",[req.user.id]);
      return res.status(200).json({profile:rows[0]});
    }
    else if(role==="admin"){
      const [rows]=await conn.promise().query("Select admin_id,full_name,username from admin where admin_id=?",[req.user.id]);
      return res.status(200).json({profile:rows[0]});
    }
  }catch(error){
    console.log("Error in fetching profile:",error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkuser=async(req,res)=>{
  try{
    return res.status(200).json(req.user);
  }catch(error){
    console.log("Error in check user controller: ",error);
    return res.status(500).json({message:"Internal server error"});
  }
};