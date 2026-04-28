import { useState, useEffect, useCallback } from "react";
import { getAppointmentsByPatient, getChatMessages, sendMessage as sendChatMessageApi } from "../../api";
import "./ChatWithDoctor.css";

function ChatWithDoctor() {
  const patient = JSON.parse(localStorage.getItem("currentUser")) || {};

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load approved appointments
  useEffect(() => {
    if (!patient?.id) return;

    const loadAppointments = async () => {
      try {
        const data = await getAppointmentsByPatient(patient.id);
        // Filter only confirmed appointments
        setAppointments(data.filter(app => app.status === "confirmed"));
      } catch (err) {
        console.error("Error loading appointments:", err);
      }
    };

    loadAppointments();
  }, [patient?.id]);

  const fetchMessages = useCallback(async () => {
    if (!selectedAppointmentId) return;
    try {
      const data = await getChatMessages(selectedAppointmentId);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [selectedAppointmentId]);

  // Polling for new messages
  useEffect(() => {
    if (!selectedAppointmentId) {
      setMessages([]);
      return;
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedAppointmentId, fetchMessages]);

  const selectedAppointment = appointments.find(app => app.id.toString() === selectedAppointmentId);

  /* 🔹 Send message */
  const sendMessage = async () => {
    if (!message.trim() || !selectedAppointment || !patient?.id) return;

    const newMessage = {
      appointmentId: selectedAppointment.id,
      senderId: patient.id,
      receiverId: selectedAppointment.doctorUserId || selectedAppointment.doctorId,
      senderRole: "PATIENT",
      message: message.trim()
    };

    try {
      setLoading(true);
      await sendChatMessageApi(newMessage);
      setMessage("");
      fetchMessages(); // Refresh immediately
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat with Doctor</h2>

      {/* ===== Appointment Selection ===== */}
      {appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ opacity: 0.7 }}>
            No confirmed appointments available for chat.
          </p>
          <p style={{ fontSize: "0.8rem", opacity: 0.5 }}>
            Wait for the doctor to accept your appointment.
          </p>
        </div>
      ) : (
        <select
          className="doctor-select"
          value={selectedAppointmentId}
          onChange={(e) => setSelectedAppointmentId(e.target.value)}
        >
          <option value="">Select Appointment</option>
          {appointments.map((app) => (
            <option key={app.id} value={app.id}>
              {app.doctorName} - {app.date} ({app.time})
            </option>
          ))}
        </select>
      )}

      {/* ===== Chat Box ===== */}
      {selectedAppointment && (
        <div className="chat-box">
          <div className="messages">
            {messages.length === 0 && (
              <p className="empty">No messages yet</p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.senderRole === "PATIENT" ? "patient" : "doctor"
                }`}
              >
                <span>{msg.message}</span>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
            {/* Auto-scroll to bottom */}
            {messages.length > 0 && (
              <div ref={(el) => {
                if (el) {
                  setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
                }
              }} />
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} disabled={!message.trim() || loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWithDoctor;
