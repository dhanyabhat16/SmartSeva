import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Calendar, Eye, EyeOff, FileText, IdCard, Key, Loader2, Mail, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    aadhaar: "",
    age: "",
    username: "",
    password: "",
    ration_card: "",
  });

  const { signup, isSigningUp,authUser } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const validate=(data)=>{
    if(!data.name) return toast.error("Enter your name"); 
    if(!data.aadhaar) return toast.error("Enter your aadhaar number");
    if(!data.age) return toast.error("Enter your age");
    if(!data.username) return toast.error("Enter your email");
    if(!data.password) return toast.error("Enter password");
    if(data.password.length<6) return toast.error("Password must have atleast 6 characters");
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    console.log(authUser);
    const result=validate(formData);
    if(result===true){
      signup(formData);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: `url("/home.jpg")`,
      }}
    >
      {/* 🔹 Darker overlay for text contrast */}
      <div className="absolute inset-0 bg-neutral/70" />

      {/* 🔹 Card with stronger background & glow */}
      <div className="relative z-10 bg-base-100/70 backdrop-blur-md border border-primary/40 rounded-2xl shadow-2xl hover:shadow-primary/40 transition-all duration-300 p-8 w-[90%] max-w-md text-base-content">
        <div className="flex justify-center mb-4">
          <MessageSquare className="size-10 text-primary animate-bounce" />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-primary">
          Citizen Signup
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="size-6 text-base-content/70"/>
            </div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full pl-10 bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IdCard className="size-6 text-base-content/70"/>
            </div>
            <input
              type="text"
              name="aadhaar"
              placeholder="Aadhaar Number"
              value={formData.aadhaar}
              onChange={handleChange}
              className="input input-bordered pl-10 w-full bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="size-6 text-base-content/70"/>
            </div>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="input input-bordered pl-10 w-full bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="size-6 text-base-content/70"/>
            </div>
            <input
              type="email"
              name="username"
              placeholder="Email"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered pl-10 w-full bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
            />
          </div>


          <div className="relative">
            {/* Left icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="size-6 text-base-content" />
            </div>

            {/* Password input */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered pl-10 pr-10 w-full bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
            />

            {/* Right toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-primary transition-all"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="size-6 text-base-content/70"/>
            </div>
          <input
            type="text"
            name="ration_card"
            placeholder="Ration Card Number"
            value={formData.ration_card}
            onChange={handleChange}
            className="input input-bordered pl-10 w-full bg-base-200/60 focus:bg-base-200 placeholder-base-content/70"
          />
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="btn btn-primary w-full mt-2"
          >
            {isSigningUp ? (
              <>
              <Loader2 className="size-5 animate-spin"/>Signing up...</>
            ) : "Sign Up"}
          </button>
        </form>
        <div className="text-center">
          <span>Already have an account? </span>
          <Link to="/login" className="link link-primary font-medium">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;
