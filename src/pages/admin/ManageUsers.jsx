import React, { useState, useEffect } from "react";
import { getAllUsers, registerUser, deleteUser as deleteUserApi } from "../../api";
import "./Admin.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [submitting, setSubmitting] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  /* ===== DELETE USER ===== */
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUserApi(id);
      setUsers(users.filter((u) => u.id !== id));
      alert("User removed");
    } catch (error) {
      alert("Failed to delete user: " + (error.message || "Unknown error"));
    }
  };

  /* ===== ADD USER ===== */
  const addUser = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const newUser = {
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString(),
      };

      await registerUser(newUser);

      // Refresh user list
      await fetchUsers();

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("patient");

      alert("User added successfully ✅");
    } catch (error) {
      alert(error.message || "Failed to add user. Email may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <h1>Manage Users</h1>

      {/* ===== ADD USER SECTION ===== */}
      <div className="admin-section">
        <h2>Add New User</h2>

        <input
          className="admin-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="admin-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="admin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="admin-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        <button className="admin-btn" onClick={addUser} disabled={submitting}>
          {submitting ? "Adding..." : "Add User"}
        </button>
      </div>

      {/* ===== USER LIST ===== */}
      <div className="admin-section">
        <h2>User List</h2>

        {/* HEADER */}
        <div className="admin-row admin-header">
          <span>Name</span>
          <span>Email</span>
          <span>Profession</span>
          <span>Action</span>
        </div>

        {loading ? (
          <p className="admin-empty">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="admin-empty">No users available</p>
        ) : (
          users.map((u) => (
            <div className="admin-row" key={u.id}>
              <span>{u.name}</span>
              <span>{u.email}</span>
              <span className={`role ${u.role}`}>{u.role}</span>
              <button
                className="admin-btn admin-btn-danger"
                onClick={() => deleteUser(u.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
