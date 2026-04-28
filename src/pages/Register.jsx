import React,{useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import {registerUser} from "../api";
import "./Register.css";

function Register(){

const navigate=useNavigate();

const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [confirmPassword,setConfirmPassword]=useState("");
const [role,setRole]=useState("patient");
const [loading,setLoading]=useState(false);


async function handleRegister(e){

e.preventDefault();

if(password!==confirmPassword){
alert("Passwords do not match");
return;
}

setLoading(true);

try{

const newUser={
name:name,
email:email,
password:password,
role:role,
createdAt:new Date().toISOString()
};

await registerUser(newUser);

alert("Registration Successful! Please Login.");

navigate("/login");

}

catch(error){

const msg=error.message || "Registration failed";

alert(msg);

}

finally{
setLoading(false);
}

}


return(
<div className="auth-page">
<div className="auth-card">

<div className="auth-header">
<h2 className="auth-title">
Create Account
</h2>

<p className="auth-subtitle">
Join
<span className="auth-subtitle__brand">
{" "}MediCurex
</span>
today
</p>
</div>


<form className="auth-form" onSubmit={handleRegister}>

<div className="form-group">
<label htmlFor="name" className="form-label">
Full Name
</label>

<input
id="name"
type="text"
className="form-input"
placeholder="Enter your full name"
value={name}
onChange={(e)=>setName(e.target.value)}
required
/>
</div>


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
<label className="form-label">
Register As
</label>

<select
className="form-input"
value={role}
onChange={(e)=>setRole(e.target.value)}
required
>
<option value="patient">
Patient
</option>

<option value="doctor">
Doctor
</option>

<option value="admin">
Admin
</option>

<option value="pharmacist">
Pharmacist
</option>

</select>
</div>


<div className="form-group">
<label htmlFor="password" className="form-label">
Password
</label>

<input
id="password"
type="password"
className="form-input"
placeholder="Create password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>
</div>


<div className="form-group">
<label htmlFor="confirmPassword" className="form-label">
Confirm Password
</label>

<input
id="confirmPassword"
type="password"
className="form-input"
placeholder="Confirm password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
required
/>
</div>


<button
type="submit"
className="auth-button auth-button--primary"
disabled={loading}
>
{
loading
? "Registering..."
: "Register"
}
</button>

</form>


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
