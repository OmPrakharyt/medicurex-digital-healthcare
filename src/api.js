// ============================================
// Central API Service - MedCare
// Base URL: Injected by Vite, defaults to localhost if not found
// ============================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// ---- Helper ----
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // For 204 No Content (DELETE responses)
    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        (data && data.error) || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, error);
    throw error;
  }
}

// =====================
//  USER / AUTH APIs
// =====================

export const registerUser = (userData) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const loginUser = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const verifyOtp = (email, otp) =>
  request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

export const verifyLogin = (email, otp) =>
  request("/auth/verify-login", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

export const resendOtp = (email) =>
  request("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const getAllUsers = () => request("/users");

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: "DELETE" });

export const updateUser = (id, userData) =>
  request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });

// =====================
//  PATIENT APIs
// =====================

export const getAllPatients = () => request("/patients");

export const getPatientById = (id) => request(`/patients/${id}`);

export const createPatient = (patientData) =>
  request("/patients", {
    method: "POST",
    body: JSON.stringify(patientData),
  });

export const updatePatient = (id, patientData) =>
  request(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patientData),
  });

export const deletePatient = (id) =>
  request(`/patients/${id}`, { method: "DELETE" });

// =====================
//  DOCTOR PROFILE APIs
// =====================

export const getAllDoctors = () => request("/doctors");

export const getDoctorById = (id) => request(`/doctors/${id}`);

export const getDoctorByUserId = (userId) =>
  request(`/doctors/user/${userId}`);

export const createOrUpdateDoctor = (profileData) =>
  request("/doctors", {
    method: "POST",
    body: JSON.stringify(profileData),
  });

export const deleteDoctor = (id) =>
  request(`/doctors/${id}`, { method: "DELETE" });

// =====================
//  APPOINTMENT APIs
// =====================

export const getAllAppointments = () => request("/appointments");

export const getAppointmentsByPatient = (patientId) =>
  request(`/appointments/patient/${patientId}`);

export const getAppointmentsByDoctor = (doctorId) =>
  request(`/appointments/doctor/${doctorId}`);

export const createAppointment = (appointmentData) =>
  request("/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });

export const updateAppointmentStatus = (id, status) =>
  request(`/appointments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const deleteAppointment = (id) =>
  request(`/appointments/${id}`, { method: "DELETE" });

// =====================
//  MEDICINE APIs
// =====================

export const getAllMedicines = () => request("/medicines");

export const getMedicineById = (id) => request(`/medicines/${id}`);

export const createMedicine = async (formData) => {
  const response = await fetch(`${BASE_URL}/medicines`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to create medicine");
  return await response.json();
};

export const updateMedicine = async (id, formData) => {
  const response = await fetch(`${BASE_URL}/medicines/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to update medicine");
  return await response.json();
};

export const deleteMedicine = (id) =>
  request(`/medicines/${id}`, { method: "DELETE" });

// =====================
//  CHAT APIs
// =====================

export const sendMessage = (chatData) =>
  request("/chat/send", {
    method: "POST",
    body: JSON.stringify(chatData),
  });

export const getChatMessages = (appointmentId) =>
  request(`/chat/${appointmentId}`);

// =====================
//  PRESCRIPTION APIs
// =====================

export const createPrescription = (prescriptionData) =>
  request("/prescriptions", {
    method: "POST",
    body: JSON.stringify(prescriptionData),
  });

export const getPrescriptionsByPatient = (patientId) =>
  request(`/prescriptions/patient/${patientId}`);

export const getPrescriptionsByDoctor = (doctorId) =>
  request(`/prescriptions/doctor/${doctorId}`);

