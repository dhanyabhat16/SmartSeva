import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Calendar, Eye, EyeOff, FileText, IdCard, Key, Loader2, Mail, MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const { login, isLoggingIn,authUser } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const validate=(data)=>{
    if(!data.username) return toast.error("Enter your email");
    if(!data.password) return toast.error("Enter password");
    return true;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    console.log(authUser);
    const result=validate(formData);
    if(result===true){
      login(formData);
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
          Log In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="size-6 text-base-content/70"/>
            </div>
            <input
              type="text"
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

          <button
            type="submit"
            disabled={isLoggingIn}
            className="btn btn-primary w-full mt-2"
          >
            {isLoggingIn ? (
              <>
              <Loader2 className="size-5 animate-spin"/>Logging in...</>
            ) : "Log In"}
          </button>
        </form>
        <div className="text-center">
          <span>Do not have an account? </span>
          <Link to="/signup" className="link link-primary font-medium">
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
