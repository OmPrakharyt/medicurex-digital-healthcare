import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, getAllMedicines, getAllAppointments } from "../../api";
import "./Admin.css"

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const [userCount, setUserCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchStats = async () => {
      try {
        const [users, medicines, appointments] = await Promise.all([
          getAllUsers(),
          getAllMedicines(),
          getAllAppointments(),
        ]);
        setUserCount(users.length);
        setMedicineCount(medicines.length);
        setAppointmentCount(appointments.length);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user || user.role !== "admin") return <p>Access Denied</p>;

 return (
  <div className="admin-page">
    <h1>Admin Dashboard</h1>

    <div className="admin-stats">
      <div className="admin-stat-card">
        <h3>Total Users</h3>
        <p>{loading ? "..." : userCount}</p>
      </div>

      <div className="admin-stat-card">
        <h3>Total Medicines</h3>
        <p>{loading ? "..." : medicineCount}</p>
      </div>

      <div className="admin-stat-card">
        <h3>Total Appointments</h3>
        <p>{loading ? "..." : appointmentCount}</p>
      </div>
    </div>
    <div className="admin-links">
      <Link className="admin-link-card" to="/admin/users">
        Manage Users
      </Link>

      <Link className="admin-link-card" to="/admin/medicines">
        Manage Medicines
      </Link>

      <Link className="admin-link-card" to="/admin/orders">
        Orders
      </Link>

      <Link className="admin-link-card" to="/admin/reports">
        Reports
      </Link>
    </div>
  </div>
);

};

export default AdminDashboard;
