// FILE: src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Delivered from "./pages/Delivered";
import Stats from "./pages/Stats";

import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loginLocal, loginAdmin, logout, loading } = useAuth();

  if (loading) return <div>Caricamento...</div>;

  function PrivateRoute({ children }) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginLocal={loginLocal} />} />
        <Route path="/admin-login" element={<AdminLogin onLoginAdmin={loginAdmin} />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home user={user} onLogout={logout} />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders user={user} onLogout={logout} />
            </PrivateRoute>
          }
        />

        <Route
          path="/delivered"
          element={
            <PrivateRoute>
              <Delivered user={user} onLogout={logout} />
            </PrivateRoute>
          }
        />

        <Route
          path="/stats"
          element={
            <PrivateRoute>
              <Stats user={user} onLogout={logout} />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
