import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Handshake,
  User,
  LogOut,
  Sun,
  Moon,
  Wrench,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <nav className="bg-base-300 shadow-sm px-8 py-5 flex justify-between items-center">
      {/* Left: Logo + Title */}
      <div className="flex items-center space-x-2">
        <Link
          to="/"
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Handshake className="w-8 h-8 text-primary" />
          <span className="text-2xl font-semibold text-base-content">
            SmartSeva
          </span>
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6 text-base-content font-medium">
        {/* If no user is logged in, show only theme toggle */}
        {!authUser && (
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
            <span className="text-xl">Theme</span>
          </button>
        )}

        {/* If logged in as citizen */}
        {authUser?.role === "citizen" && (
          <>

            <Link
              to="/profile"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <User size={22} />
              <span className="text-xl">Profile</span>
            </Link>
          </>
        )}

        {/* If logged in as admin */}
        {authUser?.role === "admin" && (
          <>

            <Link
              to="/adminProfile"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <User size={22} />
              <span className="text-xl">Profile</span>
            </Link>
          </>
        )}
        

        {/* Logout always visible when user is logged in */}
        {authUser && (
          <>
          <button
              onClick={toggleTheme}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
              <span className="text-xl">Theme</span>
            </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 hover:text-error transition-colors"
          >
            <LogOut size={22} />
            <span className="text-xl">Logout</span>
          </button></>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
