import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getDoctorByUserId } from "../api";
import "./Login.css";

function Login() {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [rememberMe,setRememberMe]=useState(false);
  const [loading,setLoading]=useState(false);

  const navigate=useNavigate();

  async function handleLogin(e){
    e.preventDefault();
    setLoading(true);

    try{

      const storedUser = await loginUser(email,password);

      alert("Login Successful! Welcome to MediCurex");

      if(rememberMe){
        localStorage.setItem("isLoggedIn","true");
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify(storedUser)
      );

      window.dispatchEvent(
        new Event("userLogin")
      );

      const userRole=storedUser.role || "patient";

      if(userRole==="doctor"){
        try{
          await getDoctorByUserId(storedUser.id);
          navigate("/doctor");
        }catch{
          navigate("/doctor/onboarding");
        }
      }

      else if(userRole==="admin"){
        navigate("/admin/dashboard");
      }

      else if(userRole==="pharmacist"){
        navigate("/medicine");
      }

      else{
        navigate("/patient/dashboard");
      }

    }

    catch(error){
      alert(error.message || "Invalid email or password");
    }

    finally{
      setLoading(false);
    }

  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h2 className="auth-title">
            Welcome Back
          </h2>

          <p className="auth-subtitle">
            Login to continue to
            <span className="auth-subtitle__brand">
              {" "}MediCurex
            </span>
          </p>
        </div>


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
              onChange={(e)=>setEmail(e.target.value)}
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
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </div>


          <div className="form-options">

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e)=>setRememberMe(e.target.checked)}
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
            {
              loading
              ? "Logging in..."
              : "Login"
            }
          </button>

        </form>


        <p className="auth-footer">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="auth-footer__link"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
