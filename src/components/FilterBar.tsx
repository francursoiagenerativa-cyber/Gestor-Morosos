import React from 'react';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { DebtorFilter, DebtorStatus, SortField, SortOrder } from '../types/debtor';

interface FilterBarProps {
  filter: DebtorFilter;
  onFilterChange: (updates: Partial<DebtorFilter>) => void;
  statusCounts: {
    all: number;
    pending: number;
    partial: number;
    overdue: number;
    paid: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  statusCounts,
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    switch (val) {
      case 'remainingAmount-desc':
        onFilterChange({ sortField: 'remainingAmount', sortOrder: 'desc' });
        break;
      case 'remainingAmount-asc':
        onFilterChange({ sortField: 'remainingAmount', sortOrder: 'asc' });
        break;
      case 'dueDate-asc':
        onFilterChange({ sortField: 'dueDate', sortOrder: 'asc' });
        break;
      case 'debtDate-desc':
        onFilterChange({ sortField: 'debtDate', sortOrder: 'desc' });
        break;
      case 'fullName-asc':
        onFilterChange({ sortField: 'fullName', sortOrder: 'asc' });
        break;
      default:
        onFilterChange({ sortField: 'dueDate', sortOrder: 'asc' });
    }
  };

  const currentSortValue = `${filter.sortField}-${filter.sortOrder}`;

  return (
    <div className="no-print bg-white border border-neutral-200 rounded-xl p-3.5 space-y-3 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por nombre, DNI/CIF, concepto o teléfono..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-slate-800 rounded-lg outline-none transition-colors"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Quick Filter Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="hidden sm:inline">Ordenar:</span>
            <select
              value={currentSortValue}
              onChange={handleSortChange}
              className="bg-transparent text-xs font-medium text-neutral-700 outline-none cursor-pointer pr-1"
            >
              <option value="dueDate-asc">Vencimiento (Más próximo)</option>
              <option value="remainingAmount-desc">Mayor deuda pendiente</option>
              <option value="remainingAmount-asc">Menor deuda pendiente</option>
              <option value="debtDate-desc">Fecha de deuda reciente</option>
              <option value="fullName-asc">Nombre (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Segmented Status Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-neutral-100">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => onFilterChange({ status: 'all', onlyOverdue: false })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter.status === 'all' && !filter.onlyOverdue
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Todos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-200/50 text-[11px] tabular-nums font-mono">
              {statusCounts.all}
            </span>
          </button>

          <button
            onClick={() => onFilterChange({ status: 'pending', onlyOverdue: false })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter.status === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Pendientes</span>
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-200/50 text-[11px] tabular-nums font-mono">
              {statusCounts.pending}
            </span>
          </button>

          <button
            onClick={() => onFilterChange({ status: 'partial', onlyOverdue: false })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter.status === 'partial'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Pagos Parciales</span>
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-200/50 text-[11px] tabular-nums font-mono">
              {statusCounts.partial}
            </span>
          </button>

          <button
            onClick={() => onFilterChange({ status: 'overdue', onlyOverdue: false })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter.status === 'overdue'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Vencidos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-red-100 text-red-800 text-[11px] tabular-nums font-mono">
              {statusCounts.overdue}
            </span>
          </button>

          <button
            onClick={() => onFilterChange({ status: 'paid', onlyOverdue: false })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter.status === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Pagados</span>
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-200/50 text-[11px] tabular-nums font-mono">
              {statusCounts.paid}
            </span>
          </button>
        </div>

        {/* Clear active filter button if searching or filtered */}
        {(filter.search || filter.status !== 'all' || filter.onlyOverdue) && (
          <button
            onClick={() => onFilterChange({ search: '', status: 'all', onlyOverdue: false })}
            className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-2 transition-colors ml-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};
