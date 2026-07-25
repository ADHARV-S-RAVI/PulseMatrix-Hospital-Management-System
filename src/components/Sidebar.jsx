import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Ambulance, 
  Database, 
  Box, 
  Users, 
  ActivitySquare,
  BarChart4,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Emergency Operations',
    items: [
      { id: 'registration', label: 'Patient Ingest', icon: ActivitySquare },
      { id: 'queue', label: 'Triage Queue', icon: BrainCircuit },
      { id: 'ambulance', label: 'Ambulance Dispatch', icon: Ambulance }
    ]
  },
  {
    title: 'Hospital Resources',
    items: [
      { id: 'management', label: 'Doctors Management', icon: Users },
      { id: 'management', label: 'Bed Management', icon: Users },
      { id: 'resources', label: 'Resource Logistics', icon: Database }
    ]
  },
  {
    title: 'Visualization',
    items: [
      { id: 'digital_twin', label: 'Digital Twin 3D', icon: Box }
    ]
  },
  {
    title: 'AI Systems',
    items: [
      { id: 'triage', label: 'AI Triage Engine', icon: BrainCircuit }
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'logout', label: 'Logout', icon: LogOut, action: 'logout' }
    ]
  }
];

export default function Sidebar({ active, onNavigate, onReset, onLogout, sidebarOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [openGroups, setOpenGroups] = useState({
    'Dashboard': true,
    'Emergency Operations': true,
    'Hospital Resources': true,
    'Visualization': true,
    'AI Systems': true,
    'System': true
  });

  // Sync the CSS variable so the main layout adjusts automatically
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? '72px' : '240px');
  }, [isCollapsed]);

  const toggleGroup = (title) => {
    if (isCollapsed) return; // Disable collapsing groups when sidebar is collapsed
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleAction = (item) => {
    if (item.action === 'logout') {
      onLogout();
    } else if (item.id === 'copilot' || item.id === 'settings') {
      console.log(`Action ${item.label} triggered`);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 72 : 240,
        x: sidebarOpen ? 0 : 0
      }}
      className={`fixed inset-y-0 left-0 z-50 dark-neon-theme bg-[#0f172a] border-r border-slate-800 flex flex-col text-slate-300 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div className={`flex items-center h-[70px] border-b border-slate-800 shrink-0 px-4 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 shrink-0 rounded flex items-center justify-center bg-primary/10 text-primary">
          <ActivitySquare size={18} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <h1 className="font-display font-bold text-[14px] text-white tracking-wide truncate">
              PULSE_MATRIX
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Emergency Command Center
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <div className="flex flex-col space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col">
              {!isCollapsed && (
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors group"
                >
                  <span className="truncate">{group.title}</span>
                  {openGroups[group.title] ? <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /> : <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              )}
              
              <AnimatePresence initial={false}>
                {(isCollapsed || openGroups[group.title]) && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`overflow-hidden flex flex-col ${isCollapsed ? 'items-center space-y-2 mt-0' : 'mt-0.5 space-y-0.5 px-2'}`}
                  >
                    {group.items.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = active === item.id;
                      return (
                        <li key={`${item.id}-${idx}`} className="w-full">
                          <button
                            onClick={() => handleAction(item)}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center h-10 w-10 rounded-md' : 'gap-3 px-3 py-1.5 rounded-md'} text-[13px] font-medium transition-colors relative group ${
                              isActive 
                                ? 'bg-primary/10 text-white' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-[15%] bottom-[15%] w-[3px] bg-primary shadow-[0_0_8px_rgba(14,165,233,0.8)] rounded-r" />
                            )}
                            <Icon size={16} className={`shrink-0 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
              {isCollapsed && <div className="h-[1px] w-8 bg-slate-800 mx-auto mt-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="h-[50px] border-t border-slate-800 shrink-0 flex items-center justify-center px-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} py-2 text-slate-500 hover:text-slate-300 transition-colors`}
        >
          {!isCollapsed && <span className="text-[12px] font-medium">Collapse</span>}
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
