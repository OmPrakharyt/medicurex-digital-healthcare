import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrUpdateDoctor, updateUser } from "../../api";
import "./DoctorDashboard.css";

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("currentUser"));

  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [fee, setFee] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
  ]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doctor || doctor.role !== "doctor") {
      navigate("/login");
    }
  }, [doctor, navigate]);

  const addTimeSlot = () => {
    if (selectedSlot && !timeSlots.includes(selectedSlot)) {
      setTimeSlots([...timeSlots, selectedSlot]);
      setSelectedSlot("");
    }
  };

  const removeTimeSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!specialization || !experience || !fee || timeSlots.length === 0) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      // Create doctor profile via API
      const doctorProfile = {
        userId: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: specialization,
        experience: experience,
        fee: Number(fee),
        timeSlots: timeSlots.join(","), // stored as comma-separated in backend
        image: doctor.image || "",
        createdAt: new Date().toISOString(),
        profileCompleted: true,
      };

      await createOrUpdateDoctor(doctorProfile);

      // Update user's profileCompleted flag via API
      try {
        await updateUser(doctor.id, {
          ...doctor,
          profileCompleted: true,
        });
      } catch (err) {
        console.warn("Could not update user profile flag:", err);
      }

      // Update current user in localStorage
      const updatedCurrentUser = {
        ...doctor,
        profileCompleted: true,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

      alert("Profile completed successfully! Redirecting to dashboard...");
      navigate("/doctor");
    } catch (error) {
      alert(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-dashboard no-sidebar">
      <main className="main-content">
        <h1>Complete Your Doctor Profile</h1>
        <p className="subtitle">
          Please provide the following information to create your public profile
        </p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <input
              id="specialization"
              type="text"
              placeholder="e.g., Cardiologist, Dentist, Surgeon"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Years of Experience *</label>
            <input
              id="experience"
              type="text"
              placeholder="e.g., 5 Years, 10 Years"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fee">Consultation Fee (₹) *</label>
            <input
              id="fee"
              type="number"
              placeholder="e.g., 500"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Available Time Slots *</label>
            <div className="time-slot-selector">
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">Select a time slot</option>
                {availableSlots
                  .filter((slot) => !timeSlots.includes(slot))
                  .map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addTimeSlot}
                className="btn-add-slot"
              >
                Add Slot
              </button>
            </div>

            {timeSlots.length > 0 && (
              <div className="selected-slots">
                {timeSlots.map((slot) => (
                  <span key={slot} className="slot-tag">
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot)}
                      className="slot-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default DoctorOnboarding;

