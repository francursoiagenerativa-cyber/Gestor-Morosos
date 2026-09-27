import React, { useState } from 'react';
import { Debtor } from '../types/debtor';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  Trash2, 
  Phone, 
  CreditCard,
  RotateCcw
} from 'lucide-react';

interface PersonalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
  onTogglePaid: (debtor: Debtor) => void;
  onOpenPaymentModal: (debtor: Debtor) => void;
  onDeletePayment: (debtorId: string, paymentId: string) => void;
}

export const PersonalDetailModal: React.FC<PersonalDetailModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onTogglePaid,
  onOpenPaymentModal,
  onDeletePayment,
}) => {
  if (!isOpen || !debtor) return null;

  const [copied, setCopied] = useState(false);
  const isPaid = debtor.status === 'paid' || debtor.remainingAmount <= 0;
  const initial = (debtor.fullName || 'D').charAt(0).toUpperCase();

  // Clean phone number for WhatsApp
  const cleanPhone = (debtor.phone || '').replace(/[^0-9]/g, '');

  // Friendly informal WhatsApp reminder
  const friendlyReminder = `¡Hola ${debtor.fullName}! Te escribo para acordarnos de los ${formatCurrency(
    debtor.remainingAmount,
    debtor.currency
  )} de "${debtor.concept}" cuando te venga bien 😉`;

  const handleCopy = () => {
    navigator.clipboard.writeText(friendlyReminder);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-slate-800 border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-700/60 bg-slate-800/90">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600/70 text-blue-300 font-bold flex items-center justify-center text-lg shadow-inner">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">
                  {debtor.fullName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPaid ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isPaid ? 'Pagada' : 'Pendiente'}</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                Deuda del {formatDate(debtor.debtDate)}
                {debtor.phone && ` · Tel: ${debtor.phone}`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Amount Cards */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4">
            <div>
              <span className="text-slate-400 text-xs block">Monto total</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {formatCurrency(debtor.originalAmount, debtor.currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Saldo pendiente</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  isPaid ? 'text-emerald-400' : 'text-blue-300'
                }`}
              >
                {formatCurrency(isPaid ? 0 : debtor.remainingAmount, debtor.currency)}
              </span>
            </div>
          </div>

          {/* Motivo & Notas */}
          <div className="space-y-2 text-xs">
            <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
              Motivo del préstamo
            </span>
            <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-3 text-slate-200">
              {debtor.concept || 'Sin motivo especificado'}
            </div>
            {debtor.notes && (
              <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-3 text-slate-400 mt-2 italic">
                Nota: {debtor.notes}
              </div>
            )}
          </div>

          {/* Recordatorio de WhatsApp */}
          {!isPaid && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Recordatorio amistoso por WhatsApp
                </span>
                <button
                  onClick={handleCopy}
                  className="text-emerald-400 hover:text-emerald-200 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs bg-slate-900/60 p-3 rounded-xl border border-emerald-500/20 text-slate-300 leading-relaxed font-sans">
                {friendlyReminder}
              </p>

              {cleanPhone ? (
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(friendlyReminder)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir WhatsApp con {debtor.fullName}</span>
                </a>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  (Puedes añadir su teléfono al editar para abrir el chat directamente)
                </p>
              )}
            </div>
          )}

          {/* Historial de Abonos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                Abonos realizados ({debtor.paymentHistory?.length || 0})
              </span>
              {!isPaid && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPaymentModal(debtor);
                  }}
                  className="text-xs text-blue-300 hover:text-blue-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>+ Añadir abono</span>
                </button>
              )}
            </div>

            {debtor.paymentHistory && debtor.paymentHistory.length > 0 ? (
              <div className="space-y-2">
                {debtor.paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-700/40 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-emerald-400 tabular-nums">
                        +{formatCurrency(p.amount, debtor.currency)}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {formatDate(p.date)} vía {p.method}
                        {p.notes && ` (${p.notes})`}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`¿Anular abono de ${formatCurrency(p.amount, debtor.currency)}?`)) {
                          onDeletePayment(debtor.id, p.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-900/20 p-3 rounded-xl border border-slate-800 text-center">
                Aún no hay abonos registrados para esta deuda.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/60 bg-slate-800/90">
          <button
            onClick={() => onTogglePaid(debtor)}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              isPaid
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPaid ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reabrir como pendiente</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Marcar como completamente pagada</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
