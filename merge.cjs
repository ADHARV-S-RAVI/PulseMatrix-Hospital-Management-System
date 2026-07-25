const fs = require('fs');

const oldCode = fs.readFileSync('src/App_old.jsx', 'utf-8');

// We need to inject imports for new pages.
const newImports = `
// --- New Pages (Command Center) ---
import DigitalTwin from './pages/DigitalTwin';
import AITriage from './pages/AITriage';
import AmbulanceCommandCenter from './pages/AmbulanceCommandCenter';
import Analytics from './pages/Analytics';
import ResourceManagement from './pages/ResourceManagement';
import WorkforceManagement from './pages/WorkforceManagement';
import AIHologramAssistant from './components/AIHologramAssistant';
`;

let mergedCode = oldCode.replace('import PageTransition from "./components/PageTransition";', `import PageTransition from "./components/PageTransition";\n${newImports}`);

// Now find the `pageEl` switch statement and inject new cases.
const switchBlock = `
    switch (page) {
      case "dashboard":    return <Dashboard onNavigate={handleNav} />;
      case "registration": return <PatientRegistration onNavigate={handleNav} addToast={addToast} />;
      case "queue":        return <EmergencyQueue addToast={addToast} />;
      case "management":   return <ManagementUI addToast={addToast} />;
      
      // New Admin Command Center routes
      case "digital_twin": return <DigitalTwin />;
      case "triage":       return <AITriage />;
      case "ambulance":    return <AmbulanceCommandCenter />;
      case "analytics":    return <Analytics />;
      case "resources":    return <ResourceManagement />;
      case "workforce":    return <WorkforceManagement />;

      default:             return <Dashboard onNavigate={handleNav} />;
    }
`;

// Replace the old switch block
mergedCode = mergedCode.replace(/switch\s*\(page\)\s*\{[\s\S]*?default:\s*return[^}]+\}\s*\n/g, switchBlock);

// Inject AIHologramAssistant just above the ToastContainer at the bottom of AppShell
mergedCode = mergedCode.replace('<ToastContainer toasts={toasts} />', '<AIHologramAssistant />\n      <ToastContainer toasts={toasts} />');

// In AppShell, call setGlobalNavigate from AppContext
const navHook = `
  const { setGlobalNavigate } = useApp();
  useEffect(() => { setGlobalNavigate(handleNav); }, [setGlobalNavigate]);
`;

mergedCode = mergedCode.replace('const handleNav = (p) => { setPage(p); setSidebar(false); };', `const handleNav = (p) => { setPage(p); setSidebar(false); };\n${navHook}`);

fs.writeFileSync('src/App.jsx', mergedCode);
console.log('Successfully merged App.jsx!');
