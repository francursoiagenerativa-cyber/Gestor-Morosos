import React, { useState } from 'react';
import { Debtor, PaymentRecord } from '../types/debtor';
import { formatCurrency } from '../utils/formatters';
import { X, Check, DollarSign } from 'lucide-react';

interface PersonalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
  onAddPayment: (debtorId: string, payment: Omit<PaymentRecord, 'id' | 'recordedAt'>) => void;
}

export const PersonalPaymentModal: React.FC<PersonalPaymentModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onAddPayment,
}) => {
  if (!isOpen || !debtor) return null;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'Bizum / Móvil' | 'Efectivo' | 'Transferencia' | 'Otro'>('Bizum / Móvil');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const currentRemaining = debtor.remainingAmount;
  const parsedAmount = parseFloat(amount) || 0;
  const newRemaining = Math.max(0, currentRemaining - parsedAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError('El abono debe ser mayor a 0');
      return;
    }
    if (parsedAmount > currentRemaining) {
      setError(`No puede exceder el saldo restante (${currentRemaining.toFixed(2)} €)`);
      return;
    }

    onAddPayment(debtor.id, {
      amount: parsedAmount,
      date,
      method,
      reference: '',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-slate-800 border border-slate-700/80 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden transform transition-all text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white">
              Registrar Abono
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pago de {debtor.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status preview */}
        <div className="px-6 pt-4">
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Debe actualmente</span>
              <span className="text-base font-bold text-white tabular-nums">
                {formatCurrency(currentRemaining, debtor.currency)}
              </span>
            </div>
            {parsedAmount > 0 && (
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Quedará debiendo</span>
                <span className={`text-base font-bold tabular-nums ${newRemaining === 0 ? 'text-emerald-400' : 'text-blue-300'}`}>
                  {formatCurrency(newRemaining, debtor.currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Amount input & Quick buttons */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                ¿Cuánto te pagó? (€)
              </label>
              <button
                type="button"
                onClick={() => setAmount(currentRemaining.toFixed(2))}
                className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 cursor-pointer"
              >
                Pagar todo ({currentRemaining.toFixed(2)} €)
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={currentRemaining}
              autoFocus
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 text-base font-mono bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Method and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ¿Por dónde?
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-400 transition-colors"
              >
                <option value="Bizum / Móvil">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nota o comentario (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Me pagó la mitad en el café"
              className="w-full px-3.5 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Abono</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
