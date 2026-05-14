// Central app context – provides db state + refresh trigger to all children
import { createContext, useContext, useState, useCallback } from "react";
import {
  initDB, getPatients, getDoctors, getBeds, getAdmissions,
  registerPatient, dischargePatient, updatePatient,
  updateDoctorStatus, updateBedStatus, resetDB,
} from "../data/db";

initDB();

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);
  const [disasterMode, setDisasterMode] = useState(false);

  // Mock AI Predictions for the Prediction Engine
  const aiPredictions = [
    { id: 1, type: "Cardiac Arrest", risk: 88, trend: "up", color: "#f43f5e" },
    { id: 2, type: "Sepsis Detection", risk: 42, trend: "stable", color: "#f59e0b" },
    { id: 3, type: "Respiratory Failure", risk: 12, trend: "down", color: "#10b981" },
  ];

  const patients   = getPatients();
  const doctors    = getDoctors();
  const beds       = getBeds();
  const admissions = getAdmissions();

  const actions = {
    registerPatient: (data) => { registerPatient(data); refresh(); },
    dischargePatient: (id)  => { dischargePatient(id);  refresh(); },
    updatePatient: (id, f)  => { updatePatient(id, f);  refresh(); },
    updateDoctorStatus: (n,s)=> { updateDoctorStatus(n,s); refresh(); },
    updateBedStatus: (id,s) => { updateBedStatus(id,s); refresh(); },
    resetDB: ()             => { resetDB();              refresh(); },
    toggleDisasterMode: ()  => setDisasterMode(prev => !prev),
  };

  return (
    <AppContext.Provider value={{ 
      patients, doctors, beds, admissions, 
      disasterMode, aiPredictions,
      ...actions, tick 
    }}>
      {children}
    </AppContext.Provider>
  );

}

export const useApp = () => useContext(AppContext);

