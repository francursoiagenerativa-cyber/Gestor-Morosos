import React from 'react';
import { DebtorStats } from '../types/debtor';
import { formatCurrency } from '../utils/formatters';
import { DollarSign, CheckCircle2, Users, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: DebtorStats;
  currency?: string;
  onFilterOverdue?: () => void;
  onFilterPending?: () => void;
  onFilterPaid?: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  currency = '€',
  onFilterOverdue,
  onFilterPending,
  onFilterPaid,
}) => {
  return (
    <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Total Adeudado Activo */}
      <div 
        onClick={onFilterPending}
        className="bg-white border border-neutral-200 rounded-xl p-4.5 cursor-pointer hover:border-neutral-300 transition-colors shadow-xs"
      >
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Deuda Pendiente Activa
          </span>
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {formatCurrency(stats.totalRemainingAmount, currency)}
          </span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>Deuda original inicial:</span>
          <span className="font-medium text-neutral-700 tabular-nums">
            {formatCurrency(stats.totalDebtAmount, currency)}
          </span>
        </div>
      </div>

      {/* 2. Total Recuperado / Cobrado */}
      <div 
        onClick={onFilterPaid}
        className="bg-white border border-neutral-200 rounded-xl p-4.5 cursor-pointer hover:border-neutral-300 transition-colors shadow-xs"
      >
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Cobrado / Recuperado
          </span>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            {formatCurrency(stats.totalRecoveredAmount, currency)}
          </span>
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Tasa de recaudación</span>
            <span className="font-semibold text-neutral-700 tabular-nums">{stats.recoveryRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, stats.recoveryRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Morosos Activos / Total */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-xs">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Deudores Registrados
          </span>
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {stats.activeDebtors}
          </span>
          <span className="text-xs text-neutral-500">activos con saldo</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <span>{stats.paidDebtors} liquidados</span>
          <span aria-hidden="true">·</span>
          <span>{stats.totalDebtors} totales en cartera</span>
        </div>
      </div>

      {/* 4. Casos Vencidos */}
      <div 
        onClick={onFilterOverdue}
        className={`border rounded-xl p-4.5 cursor-pointer transition-colors shadow-xs ${
          stats.overdueCount > 0
            ? 'bg-red-50/40 border-red-200 hover:border-red-300'
            : 'bg-white border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-red-700">
            Deudas Vencidas
          </span>
          <div className="w-7 h-7 rounded-md bg-red-100 text-red-700 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-red-600 tabular-nums">
            {stats.overdueCount}
          </span>
          <span className="text-xs text-neutral-500">
            {stats.overdueCount === 1 ? 'caso en mora' : 'casos en mora'}
          </span>
        </div>
        <div className="mt-2 text-xs text-red-600/90 font-medium">
          {stats.overdueCount > 0 ? 'Requieren contacto y gestión inmediata' : 'Al día, sin moras críticas'}
        </div>
      </div>
    </div>
  );
};
