import React from 'react';
import { ShieldCheck, Database, Server, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="footer-section" className="bg-white border-t border-slate-200 py-6 px-10">
      <div id="footer-container" className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Backend</span>
            <span className="text-xs font-mono font-semibold text-slate-700">Java Spring Boot 3.2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Frontend</span>
            <span className="text-xs font-mono font-semibold text-slate-700">React + Vite + Tailwind</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Database</span>
            <span className="text-xs font-mono font-semibold text-slate-700">MongoDB 7.0</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            PHASE 2: Auth & Security Verified
          </span>
          <span className="text-xs text-slate-500">&copy; 2026 InternSync Platform</span>
        </div>
      </div>
    </footer>
  );
};
