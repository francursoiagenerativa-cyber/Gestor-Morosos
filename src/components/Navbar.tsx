import React from 'react';
import { UserPlus, Download, Printer, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onOpenNewDebtor: () => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
  onResetDemo: () => void;
  activeFilterTab: string;
  setActiveFilterTab: (tab: string) => void;
  overdueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewDebtor,
  onExportCSV,
  onPrintReport,
  onResetDemo,
  activeFilterTab,
  setActiveFilterTab,
  overdueCount,
}) => {
  return (
    <header className="no-print bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Cobranzas & Morosos
              </span>
              <span className="text-xs text-neutral-500 hidden sm:block">
                Gestión de deudas, cobros y cartera morosa
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation quick view tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilterTab('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilterTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setActiveFilterTab('overdue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeFilterTab === 'overdue'
                  ? 'bg-red-50 text-red-700 font-semibold shadow-xs'
                  : 'text-red-600 hover:text-red-700'
              }`}
            >
              <span>Vencidos</span>
              {overdueCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px] font-bold tabular-nums">
                  {overdueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilterTab('paid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilterTab === 'paid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Pagados
            </button>
          </nav>

          {/* Zone 3: Primary and secondary actions */}
          <div className="flex items-center gap-2">
            {/* Export CSV button */}
            <button
              onClick={onExportCSV}
              title="Descargar lista en archivo Excel / CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Print / PDF button */}
            <button
              onClick={onPrintReport}
              title="Imprimir informe o guardar como PDF"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            {/* Reset Demo button */}
            <button
              onClick={onResetDemo}
              title="Restablecer datos de ejemplo"
              className="p-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Main CTA: Nuevo Moroso */}
            <button
              onClick={onOpenNewDebtor}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Nuevo Moroso</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
