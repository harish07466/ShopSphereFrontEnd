import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLoginStyle.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ===== Forgot Password States =====
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  // ===== Admin Login Function =====
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and Password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      console.log("Login API Response:", data);

      if (response.ok) {
        if (data.role === "ADMIN") {
          // ✅ Store token for further authenticated API calls
          if (data.token) {
            localStorage.setItem("token", data.token);
          } else {
            console.warn("⚠️ No token found in login response!");
          }

          // ✅ Redirect to admin dashboard
          navigate("/admindashboard");
        } else if (data.role === "CUSTOMER") {
          setError("Access denied! You are not an Admin.");
        } else {
          setError("Invalid role detected.");
        }
      } else {
        setError(
          data.message || data.error || "Login failed. Please try again."
        );
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // ===== Send OTP =====
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setOtpError("Please enter your registered email.");
      return;
    }

    setOtpError("");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:9090/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOtpSent(true);
        setSuccess("OTP has been sent to your registered email.");
      } else {
        const data = await response.json();
        setOtpError(data.message || "Failed to send OTP. Please check email.");
      }
    } catch (err) {
      setOtpError("Server error while sending OTP.");
    }
  };

  // ===== Verify OTP & Reset Password =====
  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      setOtpError("Please enter both OTP and new password.");
      return;
    }

    setOtpError("");
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "http://localhost:9090/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Password reset successful! Redirecting to login...");
        setOtpError("");
        setOtpSent(false);
        setEmail("");
        setOtp("");
        setNewPassword("");

        setTimeout(() => {
          setShowForgotModal(false);
          setSuccess(null);
        }, 3000);
      } else {
        setOtpError(
          data.message || "❌ Invalid OTP. Please enter correct OTP."
        );
      }
    } catch (err) {
      setOtpError("Server error while resetting password.");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <h1 className="admin-login-title">Admin Login</h1>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <form onSubmit={handleSignIn} className="admin-login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-below"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div className="forgot-link">
            <button
              type="button"
              className="forgot-btn"
              onClick={() => setShowForgotModal(true)}
            >
              <b>
                <i>Forgot Password?</i>
              </b>
            </button>
          </div>

          <button type="submit" className="admin-login-btn">
            Enter as Admin
          </button>
        </form>

        <p className="footer-text">
          <b>
            Not Admin? <a href="/">Go to Customer Login</a>
          </b>
        </p>
      </div>

      {/* ===== Forgot Password Modal ===== */}
      {showForgotModal && (
        <div className="forgot-modal">
          <div className="forgot-content">
            <h2>Reset Password</h2>

            {!otpSent ? (
              <>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleSendOtp}>Send OTP</button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="password-wrapper">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span
                    className="eye-below"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? "🙈" : "👁️"}
                  </span>
                </div>
                <button onClick={handleResetPassword}>Reset Password</button>
              </>
            )}

            {otpError && <p className="error-text">{otpError}</p>}
            {success && <p className="success-text">{success}</p>}

            <button
              className="close-center"
              onClick={() => setShowForgotModal(false)}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
