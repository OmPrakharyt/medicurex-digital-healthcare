import React, { useState, useEffect } from "react";
import { getAllPatients } from "../../api";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
      } catch (err) {
        setError("Failed to load patients. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const pageStyle = {
    minHeight: "80vh",
    padding: "24px",
  };

  const titleStyle = {
    fontSize: "2.4rem",
    marginBottom: "22px",
    color: "#c17bff",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    color: "#c17bff",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const tdStyle = {
    padding: "12px 16px",
    color: "#d7e2ff",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#d7e2ff" }}>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h2 style={titleStyle}>Patients</h2>

      {patients.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h1 style={{ fontSize: "2rem", color: "#f3f6ff", letterSpacing: "1px" }}>
            No patients found
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#d7e2ff", lineHeight: "1.7" }}>
            Patients will appear here once they register.
          </p>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Disease</th>
              <th style={thStyle}>Age</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.email}</td>
                <td style={tdStyle}>{p.phone}</td>
                <td style={tdStyle}>{p.disease}</td>
                <td style={tdStyle}>{p.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientList;
