import React, { useState } from 'react';
import { Debtor, PaymentMethod, PaymentRecord } from '../types/debtor';
import { formatCurrency } from '../utils/formatters';
import { X, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
  onAddPayment: (debtorId: string, payment: Omit<PaymentRecord, 'id' | 'recordedAt'>) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onAddPayment,
}) => {
  if (!isOpen || !debtor) return null;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Transferencia');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const currentRemaining = debtor.remainingAmount;
  const parsedAmount = parseFloat(amount) || 0;
  const newRemaining = Math.max(0, currentRemaining - parsedAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError('El monto del abono debe ser mayor a 0');
      return;
    }
    if (parsedAmount > currentRemaining) {
      setError(`El abono (${parsedAmount.toFixed(2)}) no puede exceder el saldo restante (${currentRemaining.toFixed(2)})`);
      return;
    }

    onAddPayment(debtor.id, {
      amount: parsedAmount,
      date,
      method,
      reference: reference.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  const handleShortcut = (fraction: number) => {
    const val = (currentRemaining * fraction).toFixed(2);
    setAmount(val);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-neutral-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registrar Abono o Pago
              </h3>
              <p className="text-xs text-neutral-500">
                {debtor.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Preview Card */}
        <div className="px-6 pt-4 pb-1">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 block">
                Saldo Pendiente Actual
              </span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(currentRemaining, debtor.currency)}
              </span>
            </div>
            {parsedAmount > 0 && (
              <div className="text-right">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 block">
                  Nuevo Saldo Restante
                </span>
                <span className={`text-lg font-bold tabular-nums ${newRemaining === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {formatCurrency(newRemaining, debtor.currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {/* Monto del abono */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">
                Monto del Abono ({debtor.currency}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleShortcut(0.5)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleShortcut(1)}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                >
                  Pagar Todo
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={currentRemaining}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                autoFocus
                className={`w-full px-3 py-2 text-sm font-mono bg-neutral-50 border rounded-lg outline-none focus:bg-white transition-colors ${
                  error ? 'border-red-500' : 'border-neutral-200 focus:border-slate-800'
                }`}
              />
            </div>
            {error && (
              <span className="text-[11px] text-red-500 mt-1 block">{error}</span>
            )}
            {newRemaining === 0 && parsedAmount > 0 && (
              <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ¡Este abono liquidará completamente la deuda!
              </span>
            )}
          </div>

          {/* Fecha y Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Método de Pago
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum / Móvil">Bizum / Móvil</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Referencia / Comprobante */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Referencia / Comprobante (opcional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej. TRF-10294 o Recibo de caja #45"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
            />
          </div>

          {/* Nota del abono */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Comentarios o Notas del Abono
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Pago entregado en oficina, prometió saldo restante la próxima semana"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Confirmar Abono</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
