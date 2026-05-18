// ============================================================
// Pulse_Matrix – Mock Local Database (LocalStorage-backed)
// ============================================================

export const DEFAULT_PATIENTS = [
  { id: "PT-2026-001", name: "Eleanor Vance",   age: 42, gender: "Female", contact: "555-0192", department: "Cardiology",      severity: "Critical", admittedDate: "2026-05-13", admittedTime: "08:15 AM", assignedDoctor: "Dr. Robert Chen",   assignedBed: "ICU-01", status: "In Treatment" },
  { id: "PT-2026-002", name: "Jameson Locke",   age: 28, gender: "Male",   contact: "555-0143", department: "Trauma",           severity: "Critical", admittedDate: "2026-05-13", admittedTime: "09:30 AM", assignedDoctor: "Dr. Sarah Jenkins", assignedBed: "TR-03",  status: "Awaiting Scans" },
  { id: "PT-2026-003", name: "Marcus Aurelius", age: 65, gender: "Male",   contact: "555-0177", department: "Neurology",        severity: "Major",    admittedDate: "2026-05-13", admittedTime: "10:05 AM", assignedDoctor: "Dr. Amanda Ross",   assignedBed: "GEN-12", status: "Stable" },
  { id: "PT-2026-004", name: "Sophia Martinez", age: 19, gender: "Female", contact: "555-0128", department: "Pediatrics",       severity: "Moderate", admittedDate: "2026-05-13", admittedTime: "11:20 AM", assignedDoctor: "Dr. Michael Chang", assignedBed: "PED-04", status: "Discharge Ready" },
  { id: "PT-2026-005", name: "David Kaelen",    age: 51, gender: "Male",   contact: "555-0155", department: "Cardiology",      severity: "Major",    admittedDate: "2026-05-12", admittedTime: "06:45 PM", assignedDoctor: "Dr. Robert Chen",   assignedBed: "ICU-02", status: "Stable" },
  { id: "PT-2026-006", name: "Elena Rostova",   age: 34, gender: "Female", contact: "555-0111", department: "General Surgery", severity: "Minor",    admittedDate: "2026-05-12", admittedTime: "02:10 PM", assignedDoctor: "Dr. William Hayes", assignedBed: "GEN-05", status: "Recovering" },
];

export const DEFAULT_DOCTORS = [
  { id: "DOC-01", name: "Dr. Robert Chen",   specialty: "Cardiology",      status: "Available",  currentLoad: 2, contact: "Ext. 402" },
  { id: "DOC-02", name: "Dr. Sarah Jenkins", specialty: "Trauma",          status: "In Surgery", currentLoad: 1, contact: "Ext. 311" },
  { id: "DOC-03", name: "Dr. Amanda Ross",   specialty: "Neurology",       status: "Available",  currentLoad: 1, contact: "Ext. 505" },
  { id: "DOC-04", name: "Dr. Michael Chang", specialty: "Pediatrics",      status: "On Rounds",  currentLoad: 1, contact: "Ext. 112" },
  { id: "DOC-05", name: "Dr. William Hayes", specialty: "General Surgery", status: "Available",  currentLoad: 1, contact: "Ext. 204" },
  { id: "DOC-06", name: "Dr. Emily Watson",  specialty: "Orthopedics",     status: "Off Duty",   currentLoad: 0, contact: "Ext. 610" },
];

export const DEFAULT_BEDS = [
  { id: "ICU-01", type: "Intensive Care",  department: "Cardiology",      status: "Occupied",    patient: "Eleanor Vance" },
  { id: "ICU-02", type: "Intensive Care",  department: "Cardiology",      status: "Occupied",    patient: "David Kaelen" },
  { id: "ICU-03", type: "Intensive Care",  department: "Trauma",          status: "Available",   patient: null },
  { id: "ICU-04", type: "Intensive Care",  department: "Neurology",       status: "Maintenance", patient: null },
  { id: "TR-01",  type: "Trauma Bay",      department: "Trauma",          status: "Available",   patient: null },
  { id: "TR-02",  type: "Trauma Bay",      department: "Trauma",          status: "Available",   patient: null },
  { id: "TR-03",  type: "Trauma Bay",      department: "Trauma",          status: "Occupied",    patient: "Jameson Locke" },
  { id: "GEN-01", type: "General Ward",    department: "General Surgery", status: "Available",   patient: null },
  { id: "GEN-05", type: "General Ward",    department: "General Surgery", status: "Occupied",    patient: "Elena Rostova" },
  { id: "GEN-12", type: "General Ward",    department: "Neurology",       status: "Occupied",    patient: "Marcus Aurelius" },
  { id: "PED-01", type: "Pediatrics Bay",  department: "Pediatrics",      status: "Available",   patient: null },
  { id: "PED-04", type: "Pediatrics Bay",  department: "Pediatrics",      status: "Occupied",    patient: "Sophia Martinez" },
];

export const DEFAULT_ADMISSIONS = {
  "May 07": 12, "May 08": 15, "May 09": 8,
  "May 10": 18, "May 11": 14, "May 12": 22, "May 13": 6,
};

// ── Helpers ────────────────────────────────────────────────
function now12h() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ap}`;
}

// ── DB Init ────────────────────────────────────────────────
export function initDB() {
  if (!localStorage.getItem("pm_patients"))  localStorage.setItem("pm_patients",  JSON.stringify(DEFAULT_PATIENTS));
  if (!localStorage.getItem("pm_doctors"))   localStorage.setItem("pm_doctors",   JSON.stringify(DEFAULT_DOCTORS));
  if (!localStorage.getItem("pm_beds"))      localStorage.setItem("pm_beds",      JSON.stringify(DEFAULT_BEDS));
  if (!localStorage.getItem("pm_admissions"))localStorage.setItem("pm_admissions",JSON.stringify(DEFAULT_ADMISSIONS));
}

export function resetDB() {
  ["pm_patients","pm_doctors","pm_beds","pm_admissions"].forEach(k => localStorage.removeItem(k));
  initDB();
}

// ── Getters ────────────────────────────────────────────────
export const getPatients  = () => JSON.parse(localStorage.getItem("pm_patients")  || "[]");
export const getDoctors   = () => JSON.parse(localStorage.getItem("pm_doctors")   || "[]");
export const getBeds      = () => JSON.parse(localStorage.getItem("pm_beds")      || "[]");
export const getAdmissions= () => JSON.parse(localStorage.getItem("pm_admissions")|| "{}");

// ── Mutators ───────────────────────────────────────────────
export function registerPatient(data) {
  const patients = getPatients();
  const doctors = getDoctors();
  const beds = getBeds();
  
  // Automatic assignment logic
  let assignedDoctor = data.assignedDoctor;
  let assignedBed = data.assignedBed;

  if (!assignedDoctor) {
    let availableDoc = doctors.find(d => d.status === "Available" && (data.department ? d.specialty === data.department : true));
    if (!availableDoc) availableDoc = doctors.find(d => d.status === "Available");
    if (availableDoc) assignedDoctor = availableDoc.name;
  }

  if (!assignedBed) {
    let availableBed = beds.find(b => b.status === "Available" && (data.department ? b.department === data.department : true));
    if (!availableBed) availableBed = beds.find(b => b.status === "Available");
    if (availableBed) assignedBed = availableBed.id;
  }

  const newId = `PT-2026-${String(patients.length + 1).padStart(3, "0")}`;
  const today = new Date().toISOString().split("T")[0];
  const patient = { 
    id: newId, 
    ...data, 
    assignedDoctor,
    assignedBed,
    admittedDate: today, 
    admittedTime: now12h(), 
    status: "Newly Admitted" 
  };

  patients.unshift(patient);
  localStorage.setItem("pm_patients", JSON.stringify(patients));

  if (patient.assignedBed) {
    const bed = beds.find(b => b.id === patient.assignedBed);
    if (bed) { bed.status = "Occupied"; bed.patient = patient.name; }
    localStorage.setItem("pm_beds", JSON.stringify(beds));
  }
  if (patient.assignedDoctor) {
    const doc = doctors.find(d => d.name === patient.assignedDoctor);
    if (doc) doc.currentLoad = (doc.currentLoad || 0) + 1;
    localStorage.setItem("pm_doctors", JSON.stringify(doctors));
  }


  const adm = getAdmissions();
  adm["May 13"] = (adm["May 13"] || 0) + 1;
  localStorage.setItem("pm_admissions", JSON.stringify(adm));

  return patient;
}

export function dischargePatient(id) {
  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return false;
  const pat = patients[idx];
  if (pat.assignedBed) {
    const beds = getBeds();
    const bed = beds.find(b => b.id === pat.assignedBed);
    if (bed) { bed.status = "Available"; bed.patient = null; }
    localStorage.setItem("pm_beds", JSON.stringify(beds));
  }
  if (pat.assignedDoctor) {
    const docs = getDoctors();
    const doc = docs.find(d => d.name === pat.assignedDoctor);
    if (doc && doc.currentLoad > 0) doc.currentLoad -= 1;
    localStorage.setItem("pm_doctors", JSON.stringify(docs));
  }
  pat.status = "Discharged"; pat.assignedBed = "";
  localStorage.setItem("pm_patients", JSON.stringify(patients));
  return true;
}

export function updatePatient(id, fields) {
  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return false;
  patients[idx] = { ...patients[idx], ...fields };
  localStorage.setItem("pm_patients", JSON.stringify(patients));
  return true;
}

export function updateDoctorStatus(name, status) {
  const docs = getDoctors();
  const doc = docs.find(d => d.name === name);
  if (!doc) return;
  doc.status = status;
  localStorage.setItem("pm_doctors", JSON.stringify(docs));
}

export function updateBedStatus(id, status) {
  const beds = getBeds();
  const bed = beds.find(b => b.id === id);
  if (!bed) return;
  bed.status = status;
  if (status !== "Occupied") bed.patient = null;
  localStorage.setItem("pm_beds", JSON.stringify(beds));

  if (status === "Available") {
    const patients = getPatients();
    const pat = patients.find(p => p.assignedBed === id && p.status !== "Discharged");
    if (pat) { pat.assignedBed = ""; localStorage.setItem("pm_patients", JSON.stringify(patients)); }
  }
}
