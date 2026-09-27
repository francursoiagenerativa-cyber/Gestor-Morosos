import React from 'react';
import { DebtorStats } from '../types/debtor';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Landmark, Users, CheckCircle2 } from 'lucide-react';

interface StatsGridProps {
  stats: DebtorStats;
  currency?: string;
  onFilterPending?: () => void;
  onFilterPaid?: () => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  currency = '€',
  onFilterPending,
  onFilterPaid,
}) => {
  return (
    <div className="no-print grid grid-cols-2 gap-3 sm:gap-4">
      {/* 1. Saldo pendiente */}
      <div
        onClick={onFilterPending}
        className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/70 rounded-2xl p-4 transition-all cursor-pointer shadow-xs"
      >
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2.5">
          <TrendingUp className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400 block mb-1">
          Saldo pendiente
        </span>
        <span className="text-lg sm:text-xl font-bold text-white tabular-nums tracking-tight">
          {formatCurrency(stats.totalRemainingAmount, currency)}
        </span>
      </div>

      {/* 2. Total registrado */}
      <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2.5">
          <Landmark className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400 block mb-1">
          Total registrado
        </span>
        <span className="text-lg sm:text-xl font-bold text-white tabular-nums tracking-tight">
          {formatCurrency(stats.totalDebtAmount, currency)}
        </span>
      </div>

      {/* 3. Morosos activos */}
      <div
        onClick={onFilterPending}
        className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/70 rounded-2xl p-4 transition-all cursor-pointer shadow-xs"
      >
        <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-2.5">
          <Users className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400 block mb-1">
          Morosos activos
        </span>
        <span className="text-lg sm:text-xl font-bold text-white tabular-nums tracking-tight">
          {stats.activeDebtors}
        </span>
      </div>

      {/* 4. Deudas pagadas */}
      <div
        onClick={onFilterPaid}
        className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600/70 rounded-2xl p-4 transition-all cursor-pointer shadow-xs"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-400 block mb-1">
          Deudas pagadas
        </span>
        <span className="text-lg sm:text-xl font-bold text-white tabular-nums tracking-tight">
          {stats.paidDebtors}
        </span>
      </div>
    </div>
  );
};
