import { useState, useEffect } from "react";
import { getAppointmentsByDoctor, createPrescription } from "../../api";

export default function DoctorPrescription() {
  const doctor = JSON.parse(localStorage.getItem("currentUser")) || {};
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([
    { medicineName: "", dosage: "", duration: "", frequency: "", notes: "" }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctor?.id && !doctor?.userId) return;
    const loadAppointments = async () => {
      try {
        const id = doctor.id || doctor.userId;
        const data = await getAppointmentsByDoctor(id);
        setAppointments(data.filter(app => app.status === "APPROVED"));
      } catch (err) {
        console.error("Error loading appointments:", err);
      }
    };
    loadAppointments();
  }, [doctor?.id, doctor.userId]);

  const selectedAppointment = appointments.find(app => app.id.toString() === selectedAppointmentId);

  const addRow = () => {
    setMedicines([...medicines, { medicineName: "", dosage: "", duration: "", frequency: "", notes: "" }]);
  };

  const handleChange = (i, field, value) => {
    const copy = [...medicines];
    copy[i][field] = value;
    setMedicines(copy);
  };

  const savePrescription = async () => {
    if (!selectedAppointmentId || !diagnosis) {
      alert("Please select a patient and enter diagnosis");
      return;
    }

    // Check if any medicine field is empty
    for (const m of medicines) {
      if (!m.medicineName || !m.dosage || !m.duration || !m.frequency || !m.notes) {
        alert("Please fill all medicine fields (Name, Dosage, Duration, Frequency, Notes)");
        return;
      }
    }

    setSaving(true);

    try {
      const data = {
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        doctorId: doctor.id || doctor.userId,
        doctorName: doctor.name || "Doctor",
        diagnosis,
        medicines
      };

      await createPrescription(data);
      alert("Prescription saved successfully ✅");
      // Reset form
      setSelectedAppointmentId("");
      setDiagnosis("");
      setMedicines([{ medicineName: "", dosage: "", duration: "", frequency: "", notes: "" }]);
    } catch (error) {
      alert("Failed to save prescription: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const isFormInvalid = !selectedAppointmentId || !diagnosis || medicines.some(m => !m.medicineName || !m.dosage || !m.duration || !m.frequency || !m.notes);

  return (
    <div>
      <style>{css}</style>

      <div className="page">
        <h2>💊 Write Prescription</h2>

        <div className="card">
          <select
            className="form-input"
            style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px" }}
            value={selectedAppointmentId}
            onChange={(e) => setSelectedAppointmentId(e.target.value)}
          >
            <option value="">Select Patient (Approved Appointments)</option>
            {appointments.map((app) => (
              <option key={app.id} value={app.id}>
                {app.patientName} - {app.date}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Diagnosis"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
          />

          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => (
                <tr key={i}>
                  <td><input value={m.medicineName} onChange={e=>handleChange(i,"medicineName",e.target.value)} placeholder="Name" /></td>
                  <td><input value={m.dosage} onChange={e=>handleChange(i,"dosage",e.target.value)} placeholder="e.g. 500mg" /></td>
                  <td><input value={m.frequency} onChange={e=>handleChange(i,"frequency",e.target.value)} placeholder="e.g. 1-0-1" /></td>
                  <td><input value={m.duration} onChange={e=>handleChange(i,"duration",e.target.value)} placeholder="e.g. 5 days" /></td>
                  <td><input value={m.notes} onChange={e=>handleChange(i,"notes",e.target.value)} placeholder="Notes" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addRow} className="btn2">+ Add Medicine</button>
          <button onClick={savePrescription} className="btn" disabled={saving || isFormInvalid}>
            {saving ? "Saving..." : "Save Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}

const css = `
.page {
  padding: 30px;
  color: white;
  background: #0b132b;
  min-height: 100vh;
  font-family: Arial;
}

.card {
  background: linear-gradient(135deg, #0f3460, #16213e);
  padding: 25px;
  border-radius: 20px;
  max-width: 900px;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

input, textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: none;
}

textarea {
  height: 80px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

th, td {
  border-bottom: 1px solid #334;
  padding: 8px;
  text-align: left;
}

.btn {
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  border: none;
  padding: 12px 20px;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.btn2 {
  background: #444;
  margin-right: 10px;
  border: none;
  padding: 12px 15px;
  color: white;
  border-radius: 10px;
  cursor: pointer;
}
`;
