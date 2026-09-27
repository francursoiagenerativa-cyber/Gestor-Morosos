import React from 'react';
import { Debtor, DebtorStats } from '../types/debtor';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PrintReportProps {
  debtors: Debtor[];
  stats: DebtorStats;
  currency?: string;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  debtors,
  stats,
  currency = '€',
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans text-xs">
      {/* Report Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-950">
            Informe de Cartera y Lista de Morosos
          </h1>
          <p className="text-neutral-500 text-xs mt-1">
            Control de cobranzas, créditos pendientes y acuerdos de pago
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-neutral-500 block">Fecha de emisión:</span>
          <span className="font-semibold text-slate-900">{currentDate}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-4 gap-4 p-4 border border-neutral-300 rounded-lg bg-neutral-50/50 mb-6">
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Deuda Total Registrada</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(stats.totalDebtAmount, currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Saldo Pendiente Activo</span>
          <span className="text-base font-bold text-red-700 font-mono tabular-nums">
            {formatCurrency(stats.totalRemainingAmount, currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Total Recuperado</span>
          <span className="text-base font-bold text-emerald-700 font-mono tabular-nums">
            {formatCurrency(stats.totalRecoveredAmount, currency)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Total Morosos / Vencidos</span>
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalDebtors} ({stats.overdueCount} en mora)
          </span>
        </div>
      </div>

      {/* Table of Debts */}
      <table className="w-full text-left border-collapse border border-neutral-300 mb-8">
        <thead>
          <tr className="bg-neutral-100 text-[10px] uppercase text-neutral-700 font-bold border-b border-neutral-300">
            <th className="p-2 border-r border-neutral-300">Deudor</th>
            <th className="p-2 border-r border-neutral-300">DNI/CIF</th>
            <th className="p-2 border-r border-neutral-300">Teléfono</th>
            <th className="p-2 border-r border-neutral-300">Concepto</th>
            <th className="p-2 border-r border-neutral-300">Vencimiento</th>
            <th className="p-2 border-r border-neutral-300 text-right">Original</th>
            <th className="p-2 border-r border-neutral-300 text-right">Pendiente</th>
            <th className="p-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {debtors.map((d) => {
            const statusLabel =
              d.status === 'paid'
                ? 'PAGADO'
                : d.status === 'partial'
                ? 'PARCIAL'
                : d.status === 'overdue'
                ? 'VENCIDO'
                : 'PENDIENTE';

            return (
              <tr key={d.id} className="text-[11px]">
                <td className="p-2 font-semibold border-r border-neutral-200">{d.fullName}</td>
                <td className="p-2 font-mono text-[10px] border-r border-neutral-200">{d.documentId || '—'}</td>
                <td className="p-2 border-r border-neutral-200">{d.phone || '—'}</td>
                <td className="p-2 border-r border-neutral-200 max-w-[180px] truncate">{d.concept}</td>
                <td className="p-2 font-mono border-r border-neutral-200">{formatDate(d.dueDate)}</td>
                <td className="p-2 text-right font-mono border-r border-neutral-200 tabular-nums">
                  {formatCurrency(d.originalAmount, d.currency)}
                </td>
                <td className="p-2 text-right font-mono font-bold border-r border-neutral-200 tabular-nums">
                  {formatCurrency(d.remainingAmount, d.currency)}
                </td>
                <td className="p-2 text-center font-bold text-[10px]">
                  {statusLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Signatures section for formal audit */}
      <div className="grid grid-cols-2 gap-16 pt-12 border-t border-neutral-300">
        <div className="text-center">
          <div className="border-b border-black w-48 mx-auto mb-2" />
          <span className="text-[11px] font-semibold text-neutral-800 block">Responsable de Cobranzas</span>
          <span className="text-[10px] text-neutral-500">Firma y Sello</span>
        </div>
        <div className="text-center">
          <div className="border-b border-black w-48 mx-auto mb-2" />
          <span className="text-[11px] font-semibold text-neutral-800 block">Dirección Financiera / Auditoría</span>
          <span className="text-[10px] text-neutral-500">Visto Bueno</span>
        </div>
      </div>
    </div>
  );
};
