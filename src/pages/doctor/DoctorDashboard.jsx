import React, { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { getAppointmentsByDoctor, updateAppointmentStatus } from "../../api";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const doctor =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const [appointments, setAppointments] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(null);

  // Fetch appointments from API
  useEffect(() => {
    if (!doctor?.name) {
      navigate("/doctor/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentsByDoctor(doctor.id);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      }
    };

    fetchAppointments();
  }, [doctor?.name, doctor?.id, navigate]);

  const isChildRoute =
    location.pathname !== "/doctor" &&
    location.pathname !== "/doctor/";

  const pending = appointments.filter(a => a.status === "pending");
  const confirmed = appointments.filter(a => a.status === "confirmed");

  const updateStatus = async (id, status) => {
    setLoadingStatus(id);
    try {
      await updateAppointmentStatus(id, status);
      // Refresh appointments
      const data = await getAppointmentsByDoctor(doctor.id);
      setAppointments(data);
    } catch (error) {
      alert("Failed to update status: " + (error.message || "Unknown error"));
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="doctor-dashboard no-sidebar">

      {!isChildRoute && (
        <main className="main-content">

          {/* HEADER */}
          <h1>Welcome, {doctor?.name || "Doctor"} 👨‍⚕️</h1>
          <p className="subtitle">Here is your daily overview</p>

          {/* FEATURE CARDS */}
          <div className="feature-grid">

            {/* ✅ PRESCRIPTION CARD FIXED */}
            <div
              className="feature-card active"
              onClick={() => navigate("/doctor/prescription")}
              style={{ cursor: "pointer" }}
            >
              <h3>📄 Prescription</h3>
              <p>Write the prescription for patients</p>
            </div>

            <div
              className="feature-card"
              onClick={() => navigate("/doctor/patients")}
              style={{ cursor: "pointer" }}
            >
              <h3>👥 My Patients</h3>
              <p>View patient profiles</p>
            </div>

            <Link to="chat" className="feature-card">
              <h3>💬 Messages</h3>
              <p>Patients Interaction</p>
            </Link>

            <div className="feature-card">
              <h3>💊 Pharmacy</h3>
              <p>Order medicines online</p>
            </div>

          </div>

          {/* STATS */}
          <div className="stats">
            <div className="card">
              <h3>Total Appointments</h3>
              <p>{appointments.length}</p>
            </div>
            <div className="card">
              <h3>Pending</h3>
              <p>{pending.length}</p>
            </div>
            <div className="card">
              <h3>Confirmed</h3>
              <p>{confirmed.length}</p>
            </div>
          </div>

          {/* RECENT APPOINTMENTS */}
          <div className="table-card">
            <h2>Recent Appointments</h2>

            {appointments.length === 0 ? (
              <p>No appointments yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td>{app.patientName}</td>
                      <td>{app.date}</td>
                      <td>{app.time}</td>
                      <td>
                        <span className={`status ${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === "pending" && (
                          <>
                            <button
                              className="btn accept"
                              disabled={loadingStatus === app.id}
                              onClick={() =>
                                updateStatus(app.id, "confirmed")
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="btn reject"
                              disabled={loadingStatus === app.id}
                              onClick={() =>
                                updateStatus(app.id, "cancelled")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      )}

      {/* REQUIRED for nested routes */}
      <Outlet />

    </div>
  );
};

export default DoctorDashboard;
