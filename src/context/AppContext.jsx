import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const [disasterMode, setDisasterMode] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [admissions, setAdmissions] = useState({});
  const [operations, setOperations] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([
    { id: 1, type: "Cardiac Arrest", risk: 88, trend: "up", color: "#f43f5e" },
    { id: 2, type: "Sepsis Detection", risk: 42, trend: "stable", color: "#f59e0b" },
    { id: 3, type: "Respiratory Failure", risk: 12, trend: "down", color: "#10b981" },
  ]);

  // Fetch real data from Flask APIs
  useEffect(() => {
    async function fetchData() {
      try {
        const [pData, dData, bData, admData, opsData] = await Promise.all([
          api.getPatients().catch(() => []),
          api.getDoctors().catch(() => []),
          api.getBeds().catch(() => []),
          api.getAdmissionTrends().catch(() => ({ labels: [], values: [] })),
          api.getAllOperations().catch(() => [])
        ]);

        const docMap = {};
        dData.forEach(doc => docMap[doc.doctor_id] = doc.doctor_name);

        const formattedPatients = pData.map(pat => {
          let sev = pat.severity_score >= 85 ? "Critical" : pat.severity_score >= 60 ? "Major" : pat.severity_score >= 30 ? "Moderate" : "Minor";
          return {
            ...pat,
            id: `PT-${pat.patient_id}`,
            numericId: pat.patient_id,
            name: pat.name,
            age: pat.age,
            gender: pat.gender,
            severity: sev,
            department: pat.department,
            assignedBed: pat.assigned_bed_id ? `BED-${pat.assigned_bed_id}` : null,
            assignedDoctor: pat.assigned_doctor_id ? docMap[pat.assigned_doctor_id] : null,
            admittedTime: new Date(pat.admission_date).toLocaleString(),
            status: "In Treatment" // Base status for live view
          };
        });
        setPatients(formattedPatients);

        const formattedDoctors = dData.map(doc => ({
          ...doc,
          id: `DOC-${doc.doctor_id}`,
          numericId: doc.doctor_id,
          name: doc.doctor_name,
          specialty: doc.specialization,
          status: doc.availability,
          currentLoad: formattedPatients.filter(p => p.assignedDoctor === doc.doctor_name).length
        }));
        setDoctors(formattedDoctors);

        const formattedBeds = bData.map(bed => {
          const occupant = formattedPatients.find(p => p.assignedBed === `BED-${bed.bed_id}`);
          return {
            ...bed,
            id: `BED-${bed.bed_id}`,
            numericId: bed.bed_id,
            type: bed.bed_type,
            status: bed.status,
            department: bed.department_id ? `DEPT-${bed.department_id}` : "General",
            patient: occupant ? occupant.name : null
          };
        });
        setBeds(formattedBeds);

        const admDict = {};
        if (admData && admData.labels) {
          admData.labels.forEach((lbl, i) => admDict[lbl] = admData.values[i]);
        }
        setAdmissions(admDict);

        setOperations(opsData);

      } catch (err) {
        console.error("Error syncing with backend APIs:", err);
      }
    }
    fetchData();
    
    // Auto-refresh every 5 seconds to keep dashboard live
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [tick, refresh]);

  const actions = {
    registerPatient: async (data) => { 
        try { await api.addPatient(data); } catch (e) { console.error(e); }
        refresh(); 
    },
    dischargePatient: async (id) => { 
        const numericId = parseInt(id.replace(/\D/g, ''), 10);
        try { await api.deletePatient(numericId); } catch (e) { console.error(e); }
        refresh(); 
    },
    updatePatient: async (id, f) => { 
        const numericId = parseInt(id.replace(/\D/g, ''), 10);
        try { await api.updatePatient(numericId, f); } catch (e) { console.error(e); }
        refresh(); 
    },
    assignDoctorToPatient: async (patientNumericId, doctorNumericId) => {
        try { await api.assignDoctor(patientNumericId, doctorNumericId); } catch (e) { console.error(e); }
        refresh();
    },
    assignBedToPatient: async (patientNumericId, bedNumericId) => {
        try { await api.assignBed(patientNumericId, bedNumericId); } catch (e) { console.error(e); }
        refresh();
    },
    updateOperation: async (operationId, status) => {
        try { await api.updateOperationStatus(operationId, status); } catch (e) { console.error(e); }
        refresh();
    },
    updateDoctorStatus: async (name, s) => { 
        const doc = doctors.find(d => d.name === name);
        if (doc) {
            try { await api.updateDoctor(doc.numericId, { availability: s }); } catch (e) { console.error(e); }
            refresh();
        }
    },
    updateBedStatus: async (id, s) => { 
        const numericId = parseInt(id.replace(/\D/g, ''), 10);
        try { await api.updateBed(numericId, { status: s }); } catch (e) { console.error(e); }
        refresh();
    },
    resetDB: () => { refresh(); },
    toggleDisasterMode: () => setDisasterMode(prev => !prev),
  };

  const [navCallback, setNavCallback] = useState(null);
  const [managementRouteArg, setManagementRouteArg] = useState(null);

  const setGlobalNavigate = useCallback((callback) => {
    setNavCallback(() => callback);
  }, []);

  const navigateToManagement = useCallback((tab) => {
    setManagementRouteArg(tab);
    if (navCallback) navCallback('management');
  }, [navCallback]);

  return (
    <AppContext.Provider value={{ 
      patients, doctors, beds, admissions, operations,
      disasterMode, aiPredictions,
      ...actions, tick,
      setGlobalNavigate, navigateToManagement, managementRouteArg
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
