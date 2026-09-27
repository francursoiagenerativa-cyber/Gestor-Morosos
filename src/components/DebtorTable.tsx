import React from 'react';
import { Debtor } from '../types/debtor';
import { formatCurrency, formatDate, getDaysDiff, isPastDueDate, getStatusBadgeInfo } from '../utils/formatters';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  Eye, 
  Edit2, 
  Trash2, 
  Phone, 
  FileText,
  Calendar,
  AlertTriangle,
  UserX
} from 'lucide-react';

interface DebtorTableProps {
  debtors: Debtor[];
  onOpenDetail: (debtor: Debtor) => void;
  onOpenPayment: (debtor: Debtor) => void;
  onOpenEdit: (debtor: Debtor) => void;
  onDelete: (debtor: Debtor) => void;
  onToggleStatus: (debtor: Debtor) => void;
  onAddNew: () => void;
}

export const DebtorTable: React.FC<DebtorTableProps> = ({
  debtors,
  onOpenDetail,
  onOpenPayment,
  onOpenEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}) => {
  if (debtors.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-800 mb-1">
          No hay deudores para mostrar
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
          No se encontraron registros que coincidan con la búsqueda o el filtro seleccionado.
        </p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <span>Registrar Nuevo Deudor</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ================= DESKTOP TABLE VIEW ================= */}
      <div className="hidden lg:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Deudor</th>
                <th className="py-3 px-4">Concepto / Motivo</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Monto & Saldo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              {debtors.map((debtor) => {
                const badge = getStatusBadgeInfo(debtor.status);
                const isOverdue = debtor.status === 'overdue' || (debtor.status !== 'paid' && isPastDueDate(debtor.dueDate));
                const daysDiff = getDaysDiff(debtor.dueDate);
                const paidAmount = debtor.originalAmount - debtor.remainingAmount;
                const paidPercent = debtor.originalAmount > 0 
                  ? Math.min(100, Math.max(0, (paidAmount / debtor.originalAmount) * 100))
                  : 0;

                return (
                  <tr
                    key={debtor.id}
                    className="hover:bg-neutral-50/70 transition-colors group"
                  >
                    {/* 1. Deudor */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-900 text-sm">
                        {debtor.fullName}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        {debtor.documentId && (
                          <span className="font-mono">{debtor.documentId}</span>
                        )}
                        {debtor.documentId && debtor.phone && <span aria-hidden="true">·</span>}
                        {debtor.phone && (
                          <span>{debtor.phone}</span>
                        )}
                      </div>
                    </td>

                    {/* 2. Concepto */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="font-medium text-neutral-800 line-clamp-1" title={debtor.concept}>
                        {debtor.concept}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                        <span>Origen: {formatDate(debtor.debtDate)}</span>
                        {debtor.paymentHistory?.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-neutral-500">
                              {debtor.paymentHistory.length} {debtor.paymentHistory.length === 1 ? 'abono' : 'abonos'}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 3. Vencimiento */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="tabular-nums">{formatDate(debtor.dueDate)}</span>
                      </div>
                      <div className="text-[11px] mt-0.5">
                        {debtor.status === 'paid' ? (
                          <span className="text-emerald-600 font-medium">Deuda saldada</span>
                        ) : isOverdue ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {Math.abs(daysDiff)} {Math.abs(daysDiff) === 1 ? 'día de mora' : 'días de mora'}
                          </span>
                        ) : (
                          <span className="text-neutral-500">
                            {daysDiff === 0 ? 'Vence hoy' : `En ${daysDiff} días`}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Monto & Saldo */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="font-bold text-sm text-slate-900 tabular-nums">
                        {formatCurrency(debtor.remainingAmount, debtor.currency)}
                      </div>
                      <div className="text-[11px] text-neutral-500 tabular-nums mt-0.5">
                        de {formatCurrency(debtor.originalAmount, debtor.currency)}
                      </div>
                      {debtor.remainingAmount > 0 && paidAmount > 0 && (
                        <div className="w-24 ml-auto mt-1.5 bg-neutral-200/80 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* 5. Estado */}
                    <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-transparent">
                        <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                        <span className={`font-semibold ${badge.textColor}`}>{badge.label}</span>
                      </div>
                    </td>

                    {/* 6. Acciones */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón rápido Marcar Pagado / Pendiente */}
                        <button
                          onClick={() => onToggleStatus(debtor)}
                          title={debtor.status === 'paid' ? 'Reabrir como pendiente' : 'Marcar como Pagado completamente'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                            debtor.status === 'paid'
                              ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline text-[11px] font-medium">
                            {debtor.status === 'paid' ? 'Reabrir' : 'Liquidar'}
                          </span>
                        </button>

                        {/* Registrar Abono / Pago Parcial */}
                        {debtor.status !== 'paid' && (
                          <button
                            onClick={() => onOpenPayment(debtor)}
                            title="Registrar abono o pago parcial"
                            className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-[11px] font-medium">+ Abono</span>
                          </button>
                        )}

                        {/* Ver Ficha / Detalle / Cobro */}
                        <button
                          onClick={() => onOpenDetail(debtor)}
                          title="Ver ficha completa, historial de pagos y WhatsApp"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-slate-900 hover:bg-neutral-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => onOpenEdit(debtor)}
                          title="Editar información"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-slate-900 hover:bg-neutral-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => onDelete(debtor)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE / TABLET CARD VIEW ================= */}
      <div className="lg:hidden space-y-3">
        {debtors.map((debtor) => {
          const badge = getStatusBadgeInfo(debtor.status);
          const isOverdue = debtor.status === 'overdue' || (debtor.status !== 'paid' && isPastDueDate(debtor.dueDate));
          const daysDiff = getDaysDiff(debtor.dueDate);
          const paidAmount = debtor.originalAmount - debtor.remainingAmount;
          const paidPercent = debtor.originalAmount > 0 
            ? Math.min(100, Math.max(0, (paidAmount / debtor.originalAmount) * 100))
            : 0;

          return (
            <div
              key={debtor.id}
              className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs space-y-3"
            >
              {/* Header card: Name and Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {debtor.fullName}
                  </h4>
                  <div className="text-xs text-neutral-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                    {debtor.documentId && <span className="font-mono">{debtor.documentId}</span>}
                    {debtor.documentId && debtor.phone && <span aria-hidden="true">·</span>}
                    {debtor.phone && <span>{debtor.phone}</span>}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 bg-neutral-100">
                  <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                  <span className={badge.textColor}>{badge.label}</span>
                </div>
              </div>

              {/* Debt Concept */}
              <div className="text-xs text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                <span className="font-medium text-neutral-900 block mb-0.5">Concepto:</span>
                <p className="line-clamp-2">{debtor.concept}</p>
              </div>

              {/* Amounts & Dates Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-100">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Saldo Pendiente:</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {formatCurrency(debtor.remainingAmount, debtor.currency)}
                  </span>
                  <span className="text-[11px] text-neutral-500 block tabular-nums">
                    de {formatCurrency(debtor.originalAmount, debtor.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Vencimiento:</span>
                  <span className="font-semibold text-neutral-800 tabular-nums">
                    {formatDate(debtor.dueDate)}
                  </span>
                  <div className="text-[11px] mt-0.5">
                    {debtor.status === 'paid' ? (
                      <span className="text-emerald-600 font-medium">Liquidado</span>
                    ) : isOverdue ? (
                      <span className="text-red-600 font-medium">
                        {Math.abs(daysDiff)} {Math.abs(daysDiff) === 1 ? 'día mora' : 'días mora'}
                      </span>
                    ) : (
                      <span className="text-neutral-500">
                        {daysDiff === 0 ? 'Vence hoy' : `En ${daysDiff} días`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar if partial payment */}
              {debtor.remainingAmount > 0 && paidAmount > 0 && (
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                    <span>Abonado: {formatCurrency(paidAmount, debtor.currency)}</span>
                    <span className="font-semibold tabular-nums">{paidPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons for Mobile */}
              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-neutral-100">
                <button
                  onClick={() => onOpenDetail(debtor)}
                  className="flex-1 py-2 px-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ficha</span>
                </button>

                {debtor.status !== 'paid' && (
                  <button
                    onClick={() => onOpenPayment(debtor)}
                    className="flex-1 py-2 px-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>+ Abono</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleStatus(debtor)}
                  className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1 ${
                    debtor.status === 'paid'
                      ? 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{debtor.status === 'paid' ? 'Reabrir' : 'Liquidar'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEdit(debtor)}
                    className="p-2 text-neutral-600 hover:text-slate-900 bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(debtor)}
                    className="p-2 text-neutral-500 hover:text-red-600 bg-neutral-100 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
