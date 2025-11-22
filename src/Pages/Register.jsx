import React, { useState } from "react";
import "./styleRegister.css";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/RegistrationFormBG.jpg";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email";
    if (formData.password.length < 8)
      return "Password must be at least 8 characters";
    if (!formData.role) return "Please select a role";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("http://localhost:9090/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Registration successful!",
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Registration failed",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <h1 className="welcome-text">🛍️ Welcome to ShopSphere 🛒</h1>

      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">🚀 Join ShopSphere Today 🚀</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select role</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
            </div>

            <button type="submit" className="btn-register" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Register"}
            </button>
          </form>

          {message.text && (
            <p className={`message ${message.type}`}>{message.text}</p>
          )}

          <p className="redirect-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} class="login-link">
              <b>
                <i>Login here</i>
              </b>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
