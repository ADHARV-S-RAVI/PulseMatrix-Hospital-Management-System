import React from 'react';
import { Menu, Bell, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Topbar({ setSidebarOpen, time, userName, isDisasterMode }) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-6 z-40 bg-surface/40 backdrop-blur-md border-b border-primary/20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="lg:hidden p-2 rounded-lg bg-surface border border-primary/30 text-primary hover:bg-primary/20 hover:shadow-neon transition-all"
        >
          <Menu size={24} />
        </button>

        <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full border ${isDisasterMode ? 'border-accent bg-accent/10 shadow-neon-red text-accent' : 'border-success/50 bg-success/10 shadow-[0_0_10px_rgba(0,255,170,0.2)] text-success'}`}>
          {isDisasterMode ? (
            <ShieldAlert size={18} className="animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest">
            {isDisasterMode ? 'DISASTER MODE ACTIVE' : 'HOSPITAL STATUS: NOMINAL'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-primary/20 font-mono text-primary text-sm shadow-inner">
          <Cpu size={16} />
          <span>SYS_TIME: {time}</span>
        </div>

        <button className="relative p-2 text-white/70 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface animate-pulse" />
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{userName}</p>
            <p className="text-xs text-primary/70 uppercase tracking-wider">Commander</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/40 to-blue-600/40 border border-primary shadow-neon flex items-center justify-center font-display font-bold text-white">
            {userName.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
