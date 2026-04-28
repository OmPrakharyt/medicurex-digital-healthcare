import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getDoctorByUserId, verifyLogin } from "../api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await loginUser(email, password);

      if (resp.mfaRequired === "true") {
        setStep("otp");
        return;
      }

      handleSuccessfulLogin(resp);
    } catch (error) {
      if (error.message.includes("verify your email")) {
        alert("Your email is not verified. Redirecting to registration for verification...");
        navigate("/register");
      } else {
        alert(error.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = await verifyLogin(email, otp);
      handleSuccessfulLogin(storedUser);
    } catch (error) {
      alert("❌ MFA Verification Failed: " + (error.message || "Invalid OTP"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSuccessfulLogin(storedUser) {
    alert("Login Successful! Welcome to MediCurex");

    if (rememberMe) {
      localStorage.setItem("isLoggedIn", "true");
    }

    localStorage.setItem("currentUser", JSON.stringify(storedUser));

    // Dispatch custom event to update navbar
    window.dispatchEvent(new Event("userLogin"));

    // Navigate based on user role, default to patient dashboard
    const userRole = storedUser.role || "patient";
    if (userRole === "doctor") {
      // Check if doctor has completed profile via API
      try {
        await getDoctorByUserId(storedUser.id);
        // Profile exists, go to dashboard
        navigate("/doctor");
      } catch {
        // No profile yet, go to onboarding
        navigate("/doctor/onboarding");
      }
    } else if (userRole === "admin") {
      navigate("/admin/dashboard");
    } else if (userRole === "pharmacist") {
      navigate("/medicine");
    } else {
      navigate("/patient/dashboard");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Login to continue to{" "}
            <span className="auth-subtitle__brand">MediCurex</span>
          </p>
        </div>

        {step === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
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
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span>Remember me</span>
              </label>
              <Link to="#" className="form-link">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="auth-button auth-button--primary" 
              disabled={loading || !email || !password}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">MFA Verification OTP</label>
              <input
                id="otp"
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP from email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="auth-button auth-button--primary" disabled={loading || !otp}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="auth-link-button"
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginTop: "1rem", width: "100%", opacity: 0.7 }}
              onClick={() => setStep("login")}
            >
              Back to Login
            </button>
          </form>
        )}

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-footer__link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
