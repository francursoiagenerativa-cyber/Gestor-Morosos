import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  onExportCSV: () => void;
  onResetDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportCSV }) => {
  return (
    <header className="no-print pt-1">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          {/* Logo Option 2: Check in circle with blue gradient inside dark glass container */}
          <div className="w-11 h-11 rounded-2xl bg-slate-850/90 border border-slate-700/70 shadow-lg shadow-blue-950/30 flex items-center justify-center shrink-0 p-1.5 relative overflow-hidden group">
            {/* Subtle inner blue glow */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl pointer-events-none" />
            
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="headerLogoGradient" x1="20" y1="80" x2="85" y2="15" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Main outer circle ring */}
              <circle
                cx="50"
                cy="50"
                r="36"
                stroke="url(#headerLogoGradient)"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {/* Checkmark that extends dynamically beyond the top right */}
              <path
                d="M 33 51 L 46 64 L 75 29"
                stroke="url(#headerLogoGradient)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Gestor de morosos
          </h1>
        </div>

        {/* Right: Quick actions (Export) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportCSV}
            title="Descargar lista en CSV / Excel"
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
