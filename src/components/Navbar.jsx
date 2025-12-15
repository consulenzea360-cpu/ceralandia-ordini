// FILE: src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/ceralandia-logo.png";

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="flex items-center gap-3">
        <img src={logo} alt="logo" className="h-10" />
        <Link to="/" className="btn-dark">Home</Link>
      </div>

      <button onClick={onLogout} className="btn-logout">
        Logout
      </button>
    </nav>
  );
}
