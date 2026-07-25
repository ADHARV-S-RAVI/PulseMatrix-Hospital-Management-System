const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Helper to handle fetch responses and errors consistently.
 */
async function fetchAPI(endpoint, options = {}) {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// ── Auth ──────────────────────────────────────────────────
export const login = (username, password) => {
  return fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const loginDoctor = (email, password) => {
  return fetchAPI("/login_doctor", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerDoctor = (email, password, name, specialty) => {
  return fetchAPI("/register_doctor", {
    method: "POST",
    body: JSON.stringify({ email, password, name, specialty }),
  });
};

export const registerAdmin = (username, password) => {
  return fetchAPI("/register_admin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

// ── Patients ──────────────────────────────────────────────
export const getPatients = () => fetchAPI("/patients");

export const getPatient = (id) => fetchAPI(`/patient/${id}`);

export const addPatient = (patientData) => {
  return fetchAPI("/add_patient", {
    method: "POST",
    body: JSON.stringify({
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      department: patientData.department,
      severity_score: patientData.severity_score,
      symptoms: patientData.symptoms || "Triage Entry", // Default for backend requirement
    }),
  });
};

export const updatePatient = (id, data) => {
  return fetchAPI(`/update_patient/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deletePatient = (id) => {
  return fetchAPI(`/delete_patient/${id}`, {
    method: "DELETE",
  });
};

export const assignDoctor = (patientId, doctorId) => {
  return fetchAPI(`/patient/${patientId}/assign_doctor`, {
    method: "POST",
    body: JSON.stringify({ doctor_id: doctorId, assigned_by: "ADMIN" }),
  });
};

export const assignBed = (patientId, bedId) => {
  return fetchAPI(`/patient/${patientId}/assign_bed`, {
    method: "POST",
    body: JSON.stringify({ bed_id: bedId }),
  });
};

export const transferBed = (patientId, bedId) => {
  return fetchAPI(`/patient/${patientId}/transfer_bed`, {
    method: "POST",
    body: JSON.stringify({ bed_id: bedId }),
  });
};

// ── Doctors ───────────────────────────────────────────────
export const getDoctors = () => fetchAPI("/doctors");

export const addDoctor = (doctorData) => {
  return fetchAPI("/add_doctor", {
    method: "POST",
    body: JSON.stringify({
      doctor_name: doctorData.name, // Mapping frontend 'name' to backend 'doctor_name'
      specialization: doctorData.specialty,
      availability: doctorData.status || "Available",
    }),
  });
};

export const updateDoctor = (id, data) => {
  return fetchAPI(`/update_doctor/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ── Beds ──────────────────────────────────────────────────
export const getBeds = () => fetchAPI("/beds");

export const addBed = (bedData) => {
  return fetchAPI("/add_bed", {
    method: "POST",
    body: JSON.stringify({
      bed_type: bedData.type,
      status: bedData.status || "Available",
    }),
  });
};

export const updateBed = (id, data) => {
  return fetchAPI(`/update_bed/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ── Analytics ─────────────────────────────────────────────
export const getTotalPatients = () => fetchAPI("/analytics/total_patients");
export const getCriticalPatients = () => fetchAPI("/analytics/critical_patients");
export const getBedOccupancy = () => fetchAPI("/analytics/bed_occupancy");
export const getDoctorAvailability = () => fetchAPI("/analytics/doctor_availability");

// ── Engine & Advanced Analytics ───────────────────────────
export const calculateSeverity = (symptoms) => {
  return fetchAPI("/engine/calculate_severity", {
    method: "POST",
    body: JSON.stringify({ symptoms }),
  });
};

export const getPriorityQueue = () => fetchAPI("/engine/emergency_queue");

export const getDashboardSummary = () => fetchAPI("/engine/dashboard_summary");

export const getSeverityDistribution = () => fetchAPI("/engine/viz/severity_distribution");

export const getDepartmentDistribution = () => fetchAPI("/engine/viz/department_distribution");

export const getAdmissionTrends = () => fetchAPI("/engine/viz/admission_trends");

// ── Clinical Operations ───────────────────────────────────
export const getDoctorPatients = (doctorId) => fetchAPI(`/clinical/doctor/${doctorId}/patients`);

export const getDoctorDashboardStats = (doctorId) => fetchAPI(`/clinical/doctor/${doctorId}/dashboard_stats`);

export const getPatientNotes = (patientId) => fetchAPI(`/clinical/patient/${patientId}/notes`);

export const getPatientTimeline = (patientId) => fetchAPI(`/clinical/patient/${patientId}/timeline`);

export const addPatientNote = (patientId, noteData) => {
  return fetchAPI(`/clinical/patient/${patientId}/notes`, {
    method: "POST",
    body: JSON.stringify(noteData),
  });
};

export const getPatientLabs = (patientId) => fetchAPI(`/clinical/patient/${patientId}/labs`);

export const requestLab = (patientId, labData) => {
  return fetchAPI(`/clinical/patient/${patientId}/labs`, {
    method: "POST",
    body: JSON.stringify(labData),
  });
};

export const getSurgeries = () => fetchAPI("/clinical/surgeries");

export const scheduleSurgery = (surgeryData) => {
  return fetchAPI("/clinical/surgeries", {
    method: "POST",
    body: JSON.stringify(surgeryData),
  });
};

export const getPatientImaging = (patientId) => fetchAPI(`/clinical/patient/${patientId}/imaging`);

export const requestImaging = (patientId, imagingData) => {
  return fetchAPI(`/clinical/patient/${patientId}/imaging`, {
    method: "POST",
    body: JSON.stringify(imagingData),
  });
};

export const getPatientPrescriptions = (patientId) => fetchAPI(`/clinical/patient/${patientId}/prescriptions`);

export const addPatientPrescription = (patientId, prescriptionData) => {
  return fetchAPI(`/clinical/patient/${patientId}/prescriptions`, {
    method: "POST",
    body: JSON.stringify(prescriptionData),
  });
};

export const getAllOperations = () => fetchAPI("/operations/all");

// ── Operations ────────────────────────────────────────────────────────────────
export const getPatientOperations = (patientId) =>
  fetchAPI(`/operations/patient/${patientId}`);

export const createOperation = (patientId, operationData) =>
  fetchAPI(`/operations/patient/${patientId}`, {
    method: "POST",
    body: JSON.stringify(operationData),
  });

export const getOperation = (operationId) =>
  fetchAPI(`/operations/${operationId}`);

export const updateOperationStatus = (operationId, statusData) =>
  fetchAPI(`/operations/${operationId}/status`, {
    method: "PATCH",
    body: JSON.stringify(statusData),
  });

export const cancelOperation = (operationId, data) =>
  fetchAPI(`/operations/${operationId}/cancel`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Typed operation helpers — all call the generalized create endpoint
const makeOperationHelper = (type) => (patientId, doctorId, details = {}, priority = "Normal") =>
  createOperation(patientId, { operation_type: type, doctor_id: doctorId, priority, details });

export const submitEmergencyCode = makeOperationHelper("emergency_code");
export const submitBloodRequest = makeOperationHelper("blood_request");
export const submitSpecialistConsult = makeOperationHelper("specialist_consult");
export const submitVentilatorRequest = makeOperationHelper("ventilator");
export const submitEmergencyOT = makeOperationHelper("emergency_ot");
export const submitNurseAssistance = makeOperationHelper("nurse_assistance");
export const submitInfusionRequest = makeOperationHelper("infusion");
export const submitLabEscalation = makeOperationHelper("lab_escalation");
export const submitImagingPriority = makeOperationHelper("imaging_priority");
export const submitDeteriorationEscalation = makeOperationHelper("deterioration");
export const submitICUTeamActivation = makeOperationHelper("icu_team");
export const submitTransportRequest = makeOperationHelper("transport");
export const submitPatientMovement = makeOperationHelper("patient_movement");
export const submitOxygenRequest = makeOperationHelper("oxygen");
export const submitEquipmentRequest = makeOperationHelper("equipment");
export const submitIsolationRequest = makeOperationHelper("isolation");
export const submitMedicalDocuments = makeOperationHelper("documents");
export const submitReferral = makeOperationHelper("referral");
export const submitIncidentReport = makeOperationHelper("incident");
export const submitHandover = makeOperationHelper("handover");

// ── Notifications ─────────────────────────────────────────────────────────────
export const getDoctorNotifications = (doctorId) =>
  fetchAPI(`/notifications/doctor/${doctorId}`);

export const markNotificationRead = (notificationId) =>
  fetchAPI(`/notifications/${notificationId}/read`, { method: "POST" });

export const markAllNotificationsRead = (doctorId) =>
  fetchAPI(`/notifications/mark-all-read/${doctorId}`, { method: "POST" });

// ── AI Endpoints ──────────────────────────────────────────────────────────────
export const aiPatientSummary = (patientId, doctorId) =>
  fetchAPI(`/ai/patient-summary`, {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId }),
  });

export const aiHandover = (patientId, doctorId) =>
  fetchAPI(`/ai/handover`, {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId }),
  });

export const aiClinicalNote = (rawNote, patientId, doctorId) =>
  fetchAPI(`/ai/clinical-note`, {
    method: "POST",
    body: JSON.stringify({ raw_note: rawNote, patient_id: patientId, doctor_id: doctorId }),
  });

export const aiOperationsRecommendation = (patientId, doctorId) =>
  fetchAPI(`/ai/operations-recommendation`, {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, doctor_id: doctorId }),
  });

export const aiRisk = (patientId) =>
  fetchAPI(`/ai/risk/${patientId}`);
