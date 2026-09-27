import React, { useState, useEffect } from 'react';
import { Debtor } from '../types/debtor';
import { X, Check } from 'lucide-react';

interface PersonalDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debtorData: Partial<Debtor>) => void;
  debtorToEdit?: Debtor | null;
}

export const PersonalDebtModal: React.FC<PersonalDebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  debtorToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [debtDate, setDebtDate] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (debtorToEdit) {
      setFullName(debtorToEdit.fullName || '');
      setAmount(debtorToEdit.originalAmount.toString());
      setConcept(debtorToEdit.concept || '');
      setDebtDate(debtorToEdit.debtDate || '');
      setPhone(debtorToEdit.phone || '');
      setNotes(debtorToEdit.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFullName('');
      setAmount('');
      setConcept('');
      setDebtDate(today);
      setPhone('');
      setNotes('');
    }
    setError('');
  }, [debtorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Por favor escribe el nombre de la persona');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    const payload: Partial<Debtor> = {
      fullName: fullName.trim(),
      originalAmount: parsedAmount,
      remainingAmount: debtorToEdit
        ? Math.min(parsedAmount, debtorToEdit.remainingAmount)
        : parsedAmount,
      currency: '€',
      debtDate: debtDate || new Date().toISOString().split('T')[0],
      dueDate: debtDate || new Date().toISOString().split('T')[0],
      status: debtorToEdit?.status || 'pending',
      concept: concept.trim() || 'Préstamo personal',
      phone: phone.trim(),
      notes: notes.trim(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-slate-800 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white">
              {debtorToEdit ? 'Editar Deuda' : 'Nueva Deuda'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {debtorToEdit ? 'Modifica los datos del préstamo' : 'Anota a quién le prestaste dinero'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Persona */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ¿A quién le prestaste? <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder="Ej. Carlos, Mamá, Laura, etc."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ¿Cuánto dinero? (€) <span className="text-blue-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha del préstamo
              </label>
              <input
                type="date"
                value={debtDate}
                onChange={(e) => setDebtDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Motivo o concepto */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ¿Por qué motivo fue?
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Billetes de tren, cena del viernes, entradas..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Teléfono móvil */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Teléfono (opcional para WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 612 345 678"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notas adicionales (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Quedó en devolverlo con la nómina, Bizum pendiente, etc."
              className="w-full px-3.5 py-2 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{debtorToEdit ? 'Guardar Cambios' : 'Añadir Deuda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
