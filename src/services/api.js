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

