import { useState, useEffect } from "react";
import { getAppointmentsByPatient } from "../../api";

function MyAppointment() {
  const patient = JSON.parse(localStorage.getItem("currentUser")) || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patient?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAppointmentsByPatient(patient.id);
        setAppointments(data);
      } catch (err) {
        setError("Failed to load appointments.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patient?.id]);

  if (loading) {
    return <h3>Loading appointments...</h3>;
  }

  if (error) {
    return <h3 style={{ color: "#ef4444" }}>{error}</h3>;
  }

  if (appointments.length === 0) {
    return <h3>No Appointment Found</h3>;
  }

  return (
    <div>
      <h2>My Appointments</h2>

      {appointments.map((app) => (
        <div className="appointment-card" key={app.id}>

          <p><strong>Patient:</strong> {app.patientName}</p>
          <p><strong>Doctor:</strong> {app.doctorName}</p>
          <p><strong>Specialization:</strong> {app.specialization}</p>
          <p><strong>Time Slot:</strong> {app.slot}</p>
          <p><strong>Date:</strong> {app.date}</p>
          <p><strong>Fee:</strong> ₹{app.fee}</p>

          {/* ✅ STATUS MESSAGE */}
          {app.status === "pending" && (
            <p className="status pending">Pending Approval</p>
          )}

          {app.status === "confirmed" && (
            <p className="status confirmed">Appointment Accepted</p>
          )}

          {app.status === "cancelled" && (
            <p className="status cancelled">Appointment Rejected</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyAppointment;
