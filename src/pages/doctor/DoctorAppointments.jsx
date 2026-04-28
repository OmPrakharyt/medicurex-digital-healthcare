import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointmentsByDoctor, updateAppointmentStatus } from "../../api";
import "./DoctorDashboard.css";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("currentUser")) || {};

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(null);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointmentsByDoctor(doctor.id);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctor?.id) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [doctor?.id]);

  const updateStatus = async (id, status) => {
    setLoadingStatus(id);
    try {
      await updateAppointmentStatus(id, status);
      // Refresh
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
      <main className="main-content">
        <h1>My Appointments</h1>
        <p className="subtitle">Manage your patient appointments</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ opacity: 0.7 }}>No appointments yet</p>
          </div>
        ) : (
          <div className="table-card">
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
                {appointments.map((app) => (
                  <tr key={app.id}>
                    <td>{app.patientName}</td>
                    <td>{app.date}</td>
                    <td>{app.time || app.slot}</td>
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
                            onClick={() => updateStatus(app.id, "confirmed")}
                          >
                            Accept
                          </button>
                          <button
                            className="btn reject"
                            disabled={loadingStatus === app.id}
                            onClick={() => updateStatus(app.id, "cancelled")}
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
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAppointments;
