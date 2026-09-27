import React, { useState, useEffect } from 'react';
import { Debtor } from '../types/debtor';
import { X, Save, AlertCircle } from 'lucide-react';
import { computeEffectiveStatus } from '../utils/formatters';

interface DebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debtorData: Partial<Debtor>) => void;
  debtorToEdit?: Debtor | null;
}

export const DebtorModal: React.FC<DebtorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  debtorToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [currency, setCurrency] = useState('€');
  const [debtDate, setDebtDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [concept, setConcept] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (debtorToEdit) {
      setFullName(debtorToEdit.fullName || '');
      setDocumentId(debtorToEdit.documentId || '');
      setPhone(debtorToEdit.phone || '');
      setEmail(debtorToEdit.email || '');
      setOriginalAmount(debtorToEdit.originalAmount.toString());
      setRemainingAmount(debtorToEdit.remainingAmount.toString());
      setCurrency(debtorToEdit.currency || '€');
      setDebtDate(debtorToEdit.debtDate || '');
      setDueDate(debtorToEdit.dueDate || '');
      setConcept(debtorToEdit.concept || '');
      setNotes(debtorToEdit.notes || '');
    } else {
      // Default values for new debtor
      const today = new Date().toISOString().split('T')[0];
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFullName('');
      setDocumentId('');
      setPhone('');
      setEmail('');
      setOriginalAmount('');
      setRemainingAmount('');
      setCurrency('€');
      setDebtDate(today);
      setDueDate(in30Days);
      setConcept('');
      setNotes('');
    }
    setErrors({});
  }, [debtorToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'El nombre o razón social es obligatorio';
    }
    const amountNum = parseFloat(originalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      errs.originalAmount = 'Ingresa un monto válido mayor a 0';
    }
    if (!debtDate) {
      errs.debtDate = 'Indica la fecha de origen de la deuda';
    }
    if (!dueDate) {
      errs.dueDate = 'Indica la fecha de vencimiento';
    }
    if (!concept.trim()) {
      errs.concept = 'El motivo o concepto de la deuda es obligatorio';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedOrig = parseFloat(originalAmount);
    // If creating, remainingAmount defaults to originalAmount unless editing
    let parsedRem = debtorToEdit ? parseFloat(remainingAmount) : parsedOrig;
    if (isNaN(parsedRem) || parsedRem < 0) {
      parsedRem = parsedOrig;
    }

    const calculatedStatus = computeEffectiveStatus(
      parsedRem,
      parsedOrig,
      dueDate,
      debtorToEdit?.status
    );

    const payload: Partial<Debtor> = {
      fullName: fullName.trim(),
      documentId: documentId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      originalAmount: parsedOrig,
      remainingAmount: parsedRem,
      currency,
      debtDate,
      dueDate,
      status: calculatedStatus,
      concept: concept.trim(),
      notes: notes.trim(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-xl border border-neutral-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {debtorToEdit ? 'Editar Registro de Moroso' : 'Registrar Nuevo Moroso'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {debtorToEdit
                ? 'Actualiza los datos personales, fechas o concepto de la deuda'
                : 'Ingresa la información del deudor para el seguimiento y cobranza'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nombre Completo & DNI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nombre Completo o Razón Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Juan Pérez o Distribuidora Andina S.A."
                className={`w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border rounded-lg outline-none focus:bg-white transition-colors ${
                  errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-slate-800'
                }`}
              />
              {errors.fullName && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.fullName}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                DNI / CIF / RUT
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ej. 12345678Z"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Contacto: Teléfono y Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Teléfono de Contacto (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +34 612 345 678"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. cliente@ejemplo.com"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Montos y Moneda */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={debtorToEdit ? 'sm:col-span-1' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Monto Original <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={originalAmount}
                onChange={(e) => {
                  setOriginalAmount(e.target.value);
                  if (!debtorToEdit) {
                    setRemainingAmount(e.target.value);
                  }
                }}
                placeholder="0.00"
                className={`w-full px-3 py-2 text-xs sm:text-sm font-mono bg-neutral-50 border rounded-lg outline-none focus:bg-white transition-colors ${
                  errors.originalAmount ? 'border-red-500' : 'border-neutral-200 focus:border-slate-800'
                }`}
              />
              {errors.originalAmount && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.originalAmount}</span>
              )}
            </div>

            {debtorToEdit && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Saldo Restante
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={remainingAmount}
                  onChange={(e) => setRemainingAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              >
                <option value="€">EUR (€)</option>
                <option value="$">USD ($)</option>
                <option value="MXN$">MXN ($)</option>
                <option value="ARS$">ARS ($)</option>
                <option value="COP$">COP ($)</option>
                <option value="CLP$">CLP ($)</option>
                <option value="S/">PEN (S/)</option>
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha de la Deuda / Factura <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={debtDate}
                onChange={(e) => setDebtDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
              {errors.debtDate && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.debtDate}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha Límite / Vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors"
              />
              {errors.dueDate && (
                <span className="text-[11px] text-red-500 mt-1 block">{errors.dueDate}</span>
              )}
            </div>
          </div>

          {/* Concepto / Factura */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Concepto, Factura o Motivo de la Deuda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Factura F-2026-102 por servicios de consultoría o préstamo personal"
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border rounded-lg outline-none focus:bg-white transition-colors ${
                errors.concept ? 'border-red-500' : 'border-neutral-200 focus:border-slate-800'
              }`}
            />
            {errors.concept && (
              <span className="text-[11px] text-red-500 mt-1 block">{errors.concept}</span>
            )}
          </div>

          {/* Notas y Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notas, Observaciones o Acuerdos de Pago
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comentarios adicionales, promesas de pago, condiciones pactadas..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{debtorToEdit ? 'Guardar Cambios' : 'Registrar Moroso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
