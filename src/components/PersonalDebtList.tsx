import React from 'react';
import { Debtor } from '../types/debtor';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Search, 
  Plus, 
  Check, 
  CreditCard, 
  MessageCircle, 
  MoreVertical, 
  Edit3, 
  Trash2,
  X,
  RotateCcw
} from 'lucide-react';

interface PersonalDebtListProps {
  debtors: Debtor[];
  totalCount: number;
  pendingCount?: number;
  paidCount?: number;
  activeTab: 'all' | 'pending' | 'paid' | 'deleted';
  onTabChange: (tab: 'all' | 'pending' | 'paid' | 'deleted') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewDebt: () => void;
  onTogglePaid: (debtor: Debtor) => void;
  onOpenPayment: (debtor: Debtor) => void;
  onOpenDetail: (debtor: Debtor) => void;
  onOpenEdit: (debtor: Debtor) => void;
  onDelete: (debtor: Debtor) => void;
  deletedCount?: number;
  onRestoreDeleted?: (debtor: Debtor) => void;
  onPermanentDelete?: (debtor: Debtor) => void;
}

export const PersonalDebtList: React.FC<PersonalDebtListProps> = ({
  debtors,
  totalCount,
  pendingCount: propPendingCount,
  paidCount: propPaidCount,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenNewDebt,
  onTogglePaid,
  onOpenPayment,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  deletedCount = 0,
  onRestoreDeleted,
  onPermanentDelete,
}) => {
  // Counts for the tabs: prioritize global counts if provided, otherwise compute from list
  const pendingCount =
    propPendingCount !== undefined
      ? propPendingCount
      : debtors.filter((d) => d.status !== 'paid' && d.remainingAmount > 0).length;
  const paidCount =
    propPaidCount !== undefined
      ? propPaidCount
      : debtors.filter((d) => d.status === 'paid' || d.remainingAmount <= 0).length;

  return (
    <div className="no-print space-y-4 pt-2">
      {/* 1. Header Row: "Tu cartera" and "+ Nueva deuda" */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Tu cartera
          </h2>
          <span className="text-xs text-slate-400 block mt-0.5">
            {debtors.length} de {totalCount} registros visibles
          </span>
        </div>

        <button
          onClick={onOpenNewDebt}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-200 bg-blue-500/25 hover:bg-blue-500/35 border border-blue-400/30 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-300" />
          <span>Nueva deuda</span>
        </button>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-800/70 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/60 focus:border-blue-400/50 rounded-2xl text-white placeholder-slate-400 outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. The 3 Reduced Tabs (Reordered: Pendientes, Pagadas, Todas) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onTabChange('pending')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending'
              ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold shadow-xs'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <span>Pendientes</span>
          <span className="text-[11px] font-mono opacity-80">{pendingCount}</span>
        </button>

        <button
          onClick={() => onTabChange('paid')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'paid'
              ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold shadow-xs'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <span>Pagadas</span>
          <span className="text-[11px] font-mono opacity-80">{paidCount}</span>
        </button>

        <button
          onClick={() => onTabChange('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30 font-semibold shadow-xs'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <span>Todas</span>
          <span className="text-[11px] font-mono opacity-80">{totalCount}</span>
        </button>

        <button
          onClick={() => onTabChange('deleted')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'deleted'
              ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30 font-semibold shadow-xs'
              : 'bg-slate-800/70 text-slate-400 hover:text-rose-300 border border-transparent'
          }`}
        >
          <span>Eliminadas</span>
          <span className="text-[11px] font-mono opacity-80">{deletedCount}</span>
        </button>
      </div>

      {/* 4. Debt Cards List */}
      <div className="space-y-3 pt-1">
        {debtors.length === 0 ? (
          <div className="bg-slate-800/50 border border-dashed border-slate-700/60 rounded-2xl p-8 text-center">
            <p className="text-sm font-medium text-slate-300 mb-1">
              No hay deudas que mostrar
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery
                ? `No hay resultados para "${searchQuery}"`
                : 'No tienes registros en esta categoría.'}
            </p>
            <button
              onClick={onOpenNewDebt}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir primera deuda</span>
            </button>
          </div>
        ) : (
          debtors.map((debtor) => {
            const isPaid = debtor.status === 'paid' || debtor.remainingAmount <= 0;
            const initial = (debtor.fullName || 'D').charAt(0).toUpperCase();

            // Payment calculation for progress bar
            const totalPaid = debtor.paymentHistory?.reduce((acc, p) => acc + p.amount, 0) || 0;
            const paidPercentage = debtor.originalAmount > 0 
              ? Math.min(100, Math.max(0, (totalPaid / debtor.originalAmount) * 100))
              : isPaid ? 100 : 0;

            const paymentSummaryText = isPaid
              ? 'Totalmente pagada'
              : totalPaid > 0
              ? `${formatCurrency(totalPaid, debtor.currency)} abonado (${debtor.paymentHistory.length} pago${debtor.paymentHistory.length > 1 ? 's' : ''})`
              : 'Sin pagos';

            return (
              <div
                key={debtor.id}
                className="bg-[#1c2333] hover:bg-[#20273a] border border-slate-700/60 rounded-2xl p-4 transition-all shadow-xs space-y-3"
              >
                {/* 1. Header: Avatar + Name + Date + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Circle/rounded-xl Avatar with Initial */}
                    <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400 font-bold flex items-center justify-center shrink-0 text-base shadow-inner">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {debtor.fullName}
                      </h3>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Deuda del {formatDate(debtor.debtDate)}
                      </span>
                    </div>
                  </div>

                  {/* Status Pill Badge (exact match: ● Pendiente / ● Pagada) */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      isPaid
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPaid ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <span>{isPaid ? 'Pagada' : 'Pendiente'}</span>
                  </div>
                </div>

                {/* 2. Middle Row: Saldo pendiente & Original */}
                <div 
                  onClick={() => onOpenDetail(debtor)}
                  className="cursor-pointer group pt-1"
                  title="Toca para ver detalle, abonos o WhatsApp"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">
                        Saldo pendiente
                      </span>
                      <span className="text-2xl font-extrabold text-white tracking-tight tabular-nums block mt-0.5">
                        {formatCurrency(isPaid ? 0 : debtor.remainingAmount, debtor.currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">
                        Original
                      </span>
                      <span className="text-sm font-semibold text-white tracking-tight tabular-nums block mt-0.5">
                        {formatCurrency(debtor.originalAmount, debtor.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Slim Progress Bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-1 my-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isPaid ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}
                      style={{
                        width: isPaid ? '100%' : `${Math.max(5, paidPercentage)}%`,
                      }}
                    />
                  </div>

                  {/* Subtext: "Sin pagos" or payment summary */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{paymentSummaryText}</span>
                    {debtor.concept && (
                      <span className="truncate max-w-[200px] text-slate-400 text-[11px] group-hover:text-slate-200 transition-colors">
                        {debtor.concept}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                  {activeTab === 'deleted' ? (
                    <>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onRestoreDeleted && onRestoreDeleted(debtor)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onPermanentDelete && onPermanentDelete(debtor)}
                        title="Borrar definitivamente"
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Borrar definitivamente</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Left group */}
                      <div className="flex items-center gap-3">
                        {/* Marcar pagada / Reabrir */}
                        <button
                          onClick={() => onTogglePaid(debtor)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            isPaid
                              ? 'text-slate-400 hover:text-slate-200'
                              : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              <span>Reabrir</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 p-0.5 rounded-full border border-emerald-400 text-emerald-400" />
                              <span>Marcar pagada</span>
                            </>
                          )}
                        </button>

                        {/* Pipe divider */}
                        <span className="text-slate-600 font-light select-none">|</span>

                        {/* Editar */}
                        <button
                          onClick={() => onOpenEdit(debtor)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* + Abono quick link if pending */}
                        {!isPaid && (
                          <>
                            <span className="text-slate-600 font-light select-none hidden sm:inline">|</span>
                            <button
                              onClick={() => onOpenPayment(debtor)}
                              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-blue-300" />
                              <span>+ Abono</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Right group: Trash */}
                      <button
                        onClick={() => onDelete(debtor)}
                        title="Eliminar registro"
                        className="p-1 text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
