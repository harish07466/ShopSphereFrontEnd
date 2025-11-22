import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./Pages/Register";
import LoginPage from "./Pages/LoginPage";
import ProductPageManagement from "./Pages/ProductPageManagement";
import OrderPage from "./Pages/OrderPage.jsx";
import AdminLogin from "./AdminPage/AdminLogin.jsx";
import AdminDashboard from "./AdminPage/AdminDashboard.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default path shows Login Page */}
      <Route path="/" element={<LoginPage />} />
      {/* Registration page */}
      <Route path="/register" element={<Register />} />

      <Route path="/products" element={<ProductPageManagement />} />

      <Route path="/orders" element={<OrderPage />} />

      {/* Catch-all invalid paths → redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* === Admin Routes === */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />

      {/* Add more routes here */}
    </Routes>
  );
};

export default AppRoutes;
