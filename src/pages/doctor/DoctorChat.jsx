import React, { useState, useEffect, useCallback } from "react";
import { getAppointmentsByDoctor, getChatMessages, sendMessage as sendChatMessageApi } from "../../api";
import "./DoctorDashboard.css";

function DoctorChat() {
  const doctor = JSON.parse(localStorage.getItem("currentUser")) || {};

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in as doctor
  useEffect(() => {
    if (!doctor?.name || doctor?.role !== "doctor") {
      // Don't redirect if no doctor, just show empty state
      return;
    }
  }, [doctor]);

  // Load appointments for this doctor
  useEffect(() => {
    if (!doctor?.id && !doctor?.userId) return;

    const loadAppointments = async () => {
      try {
        const id = doctor.id || doctor.userId;
        const data = await getAppointmentsByDoctor(id);
        // Only show confirmed appointments in chat list
        setAppointments(data.filter(app => app.status === "confirmed"));
      } catch (err) {
        console.error("Error loading appointments:", err);
      }
    };

    loadAppointments();
    const interval = setInterval(loadAppointments, 5000);
    return () => clearInterval(interval);
  }, [doctor?.id, doctor?.userId]);

  const fetchMessages = useCallback(async () => {
    if (!selectedAppointmentId) return;
    try {
      const data = await getChatMessages(selectedAppointmentId);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [selectedAppointmentId]);

  // Polling for messages
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

  // Send reply
  const sendReply = async () => {
    if (!replyText.trim() || !selectedAppointment || (!doctor?.id && !doctor?.userId)) return;

    const newReply = {
      appointmentId: selectedAppointment.id,
      senderId: doctor.id || doctor.userId,
      receiverId: selectedAppointment.patientId,
      senderRole: "DOCTOR",
      message: replyText.trim()
    };

    try {
      setLoading(true);
      await sendChatMessageApi(newReply);
      setReplyText("");
      fetchMessages(); // Refresh immediately
    } catch (err) {
      alert("Failed to send reply: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Early return if no doctor
  if (!doctor?.id && !doctor?.userId) {
    return (
      <div className="doctor-dashboard no-sidebar">
        <main className="main-content">
          <h1>Patient Messages</h1>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ opacity: 0.7 }}>Please log in as a doctor to view messages.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard no-sidebar">
      <main className="main-content">
        <h1>Patient Messages</h1>
        <p className="subtitle">Chat with your patients</p>

        <div className="doctor-chat-container">
          {/* Appointment List */}
          <div className="patient-list">
            <h3>Appointments ({appointments.length})</h3>
            {appointments.length === 0 ? (
              <p style={{ opacity: 0.7, padding: "10px" }}>No active chats</p>
            ) : (
              appointments.map((app) => (
                <div
                  key={app.id}
                  className={`patient-item ${
                    selectedAppointmentId === app.id.toString() ? "active" : ""
                  }`}
                  onClick={() => setSelectedAppointmentId(app.id.toString())}
                >
                  <div className="patient-avatar">
                    {app.patientName.charAt(0).toUpperCase()}
                  </div>
                  <div className="patient-info">
                    <div className="patient-name">{app.patientName}</div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>{app.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedAppointment ? (
              <>
                <div className="chat-header">
                  <h3>Conversation with {selectedAppointment.patientName}</h3>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <div className="empty-chat">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`chat-message ${
                            msg.senderRole === "DOCTOR" ? "doctor-msg" : "patient-msg"
                          }`}
                        >
                          <div className="message-content">
                            <div className="message-text">{msg.message}</div>
                            <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                      {/* Auto-scroll to bottom */}
                      <div ref={(el) => {
                        if (el) {
                          setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
                        }
                      }} />
                    </>
                  )}
                </div>

                <div className="chat-input-area">
                  <textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    rows="3"
                  />
                  <button onClick={sendReply} disabled={!replyText.trim() || loading}>
                    {loading ? "..." : "Send Reply"}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select an appointment to view messages</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorChat;
