import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginPageStyle.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check role before redirecting
        if (data.role === "CUSTOMER") {
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => navigate("/products"), 1200);
        } else if (data.role === "ADMIN") {
          setError("These user not found."); //  Wrong page for admin login
        } else {
          setError(
            "Unknown user role. Please Check Weather You Registered CUSTOMER or ADMIN."
          );
        }
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Send OTP to email
  const handleSendOtp = async () => {
    if (!email) return setError("Please enter your registered email.");
    setError(null);

    try {
      const response = await fetch("http://localhost:9090/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setOtpSent(true);
        setSuccess("OTP sent to your registered email.");
      } else {
        throw new Error("Failed to send OTP. Please check your email.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Verify OTP and Reset Password
  const handleResetPassword = async () => {
    if (!otp || !newPassword)
      return setError("Please enter both OTP and new password.");
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

      if (response.ok) {
        setSuccess("Password reset successful! You can now log in.");
        setShowForgotModal(false);
      } else {
        throw new Error("Invalid OTP or error resetting password.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Sign In</h1>

        {success && <p className="success-text">{success}</p>}
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSignIn}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Forgot Password Link */}
          <p
            className="forgot-password-link"
            onClick={() => setShowForgotModal(true)}
          >
            Forgot Password?
          </p>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="footer-text">
          <b>New user? </b>
          <a href="/register" className="signup-link">
            <i>Sign up here</i>
          </a>
        </p>
      </div>

      {/* Forgot Password Modal */}
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

                {/* Password field with eye toggle */}
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span
                    className="eye-below"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <button onClick={handleResetPassword}>Reset Password</button>
              </>
            )}
            <button
              className="close-modal"
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
