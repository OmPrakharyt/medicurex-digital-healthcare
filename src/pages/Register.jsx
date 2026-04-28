import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, verifyOtp, resendOtp } from "../api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient"); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("register"); // 'register' or 'otp'
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        name: name,
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString(),
      };

      await registerUser(newUser);

      setMessage("Registration Successful! A 6-digit OTP has been sent to " + email + ". Please check your inbox (and spam folder).");
      setStep("otp");
    } catch (error) {
      const msg = error.message || "Registration failed";
      if (msg.includes("Failed to fetch")) {
        alert("Could not connect to the server. Please ensure the backend is running on port 8080.");
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      alert("✅ Email verified successfully! You can now Login.");
      navigate("/login");
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        alert("Connection error. Please check if the backend is running.");
      } else {
        alert("❌ Verification Failed: " + (error.message || "Invalid OTP"));
      }
    } finally {
      setLoading(false);
    }
  }

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
      alert("OTP resent to your email.");
    } catch (error) {
      alert(error.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Join <span className="auth-subtitle__brand">MediCurex</span> today
          </p>
        </div>

        {step === "register" ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Register As</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button auth-button--primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <p style={{ color: "white", marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
              {message}
            </p>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">Verification OTP</label>
              <input
                id="otp"
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="auth-button auth-button--primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="auth-link-button"
              style={{ background: "none", border: "none", color: "#00c6ff", cursor: "pointer", marginTop: "1rem", width: "100%" }}
              onClick={handleResendOtp}
            >
              Resend OTP
            </button>
            <button
              type="button"
              className="auth-link-button"
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginTop: "0.5rem", width: "100%", opacity: 0.7 }}
              onClick={() => setStep("register")}
            >
              Back to Registration
            </button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-footer__link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
