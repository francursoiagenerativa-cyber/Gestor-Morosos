import React, { useState } from 'react';
import { Debtor, PaymentRecord } from '../types/debtor';
import { formatCurrency, formatDate, getDaysDiff, isPastDueDate, getStatusBadgeInfo } from '../utils/formatters';
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Check,
  Send,
  CreditCard
} from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: Debtor | null;
  onOpenPaymentModal: (debtor: Debtor) => void;
  onDeletePayment: (debtorId: string, paymentId: string) => void;
  onUpdateNotes: (debtorId: string, updatedNotes: string) => void;
  onToggleStatus: (debtor: Debtor) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onOpenPaymentModal,
  onDeletePayment,
  onUpdateNotes,
  onToggleStatus,
}) => {
  if (!isOpen || !debtor) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'payments' | 'whatsapp'>('info');
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedReminder, setCopiedReminder] = useState(false);

  const badge = getStatusBadgeInfo(debtor.status);
  const isOverdue = debtor.status === 'overdue' || (debtor.status !== 'paid' && isPastDueDate(debtor.dueDate));
  const daysDiff = getDaysDiff(debtor.dueDate);
  const totalPaid = (debtor.paymentHistory || []).reduce((acc, p) => acc + p.amount, 0);

  // Clean phone number for WhatsApp wa.me
  const cleanPhone = (debtor.phone || '').replace(/[^0-9]/g, '');

  // Pre-configured polite WhatsApp debt collection reminder template
  const reminderMessage = `Hola ${debtor.fullName}, te saludamos cordialmente para dar seguimiento a la cuenta pendiente correspondiente a "${debtor.concept}". Actualmente presenta un saldo pendiente de ${formatCurrency(debtor.remainingAmount, debtor.currency)}, con fecha límite el ${formatDate(debtor.dueDate)}. Por favor indícanos cuándo podríamos coordinar el pago o si necesitas los datos bancarios. ¡Muchas gracias!`;

  const handleCopyReminder = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const now = new Date();
    const timestampStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const appendedNote = debtor.notes
      ? `${debtor.notes}\n[${timestampStr}] ${newNoteText.trim()}`
      : `[${timestampStr}] ${newNoteText.trim()}`;

    onUpdateNotes(debtor.id, appendedNote);
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {debtor.fullName}
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white border border-neutral-200">
                <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                <span className={badge.textColor}>{badge.label}</span>
              </div>
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
              {debtor.documentId && <span>DNI/CIF: <strong className="font-mono text-neutral-700">{debtor.documentId}</strong></span>}
              {debtor.documentId && debtor.phone && <span aria-hidden="true">·</span>}
              {debtor.phone && <span>Tel: {debtor.phone}</span>}
              {debtor.email && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{debtor.email}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Ficha & Observaciones
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Historial de Pagos</span>
            <span className="px-1.5 py-0.2 rounded-md bg-neutral-100 text-[10px] font-bold">
              {(debtor.paymentHistory || []).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'whatsapp'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gestión de Cobro</span>
          </button>
        </div>

        {/* Body content based on tab */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'info' && (
            <>
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-3 gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-3.5">
                <div>
                  <span className="text-[11px] text-neutral-500 block uppercase font-medium">Monto Total</span>
                  <span className="text-base font-bold text-neutral-800 tabular-nums">
                    {formatCurrency(debtor.originalAmount, debtor.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block uppercase font-medium">Abonado</span>
                  <span className="text-base font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(totalPaid, debtor.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block uppercase font-medium">Saldo Pendiente</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {formatCurrency(debtor.remainingAmount, debtor.currency)}
                  </span>
                </div>
              </div>

              {/* Dates & Status detail */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Fecha de Registro de la Deuda:</span>
                  <span className="font-semibold text-neutral-800">{formatDate(debtor.debtDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Fecha Límite / Vencimiento:</span>
                  <div className="text-right">
                    <span className="font-semibold text-neutral-800">{formatDate(debtor.dueDate)}</span>
                    <span className="ml-2 font-medium">
                      {debtor.status === 'paid' ? (
                        <span className="text-emerald-600">(Completado)</span>
                      ) : isOverdue ? (
                        <span className="text-red-600">({Math.abs(daysDiff)} días de mora)</span>
                      ) : (
                        <span className="text-neutral-500">(Faltan {daysDiff} días)</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block mb-1">Concepto o Motivo:</span>
                  <p className="font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    {debtor.concept}
                  </p>
                </div>
              </div>

              {/* Notes & Tracking Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Bitácora de Observaciones y Acuerdos</span>
                </h4>
                
                {debtor.notes ? (
                  <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto font-mono">
                    {debtor.notes}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">No hay notas registradas para este deudor.</p>
                )}

                {/* Add new follow-up note */}
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Agregar nota o acuerdo de llamada..."
                    className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:bg-white focus:border-slate-800"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Historial de Abonos y Pagos Parciales
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Total abonado hasta la fecha: <strong>{formatCurrency(totalPaid, debtor.currency)}</strong>
                  </p>
                </div>
                {debtor.status !== 'paid' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPaymentModal(debtor);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>+ Registrar Abono</span>
                  </button>
                )}
              </div>

              {debtor.paymentHistory && debtor.paymentHistory.length > 0 ? (
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Método</th>
                        <th className="py-2.5 px-3">Referencia</th>
                        <th className="py-2.5 px-3">Notas</th>
                        <th className="py-2.5 px-3 text-right">Monto</th>
                        <th className="py-2.5 px-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {debtor.paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-neutral-50/60">
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                            {formatDate(payment.date)}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600">
                            {payment.method}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-500">
                            {payment.reference || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600 max-w-xs truncate" title={payment.notes}>
                            {payment.notes || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                            +{formatCurrency(payment.amount, debtor.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`¿Anular abono de ${formatCurrency(payment.amount, debtor.currency)}? El saldo adeudado volverá a subir.`)) {
                                  onDeletePayment(debtor.id, payment.id);
                                }
                              }}
                              title="Anular este abono"
                              className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center">
                  <CreditCard className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">Sin abonos registrados aún</p>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    El deudor todavía no ha realizado pagos parciales a cuenta.
                  </p>
                  {debtor.status !== 'paid' && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPaymentModal(debtor);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <span>Registrar Primer Abono</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gestión Rápida de Cobranza Directa
                </h4>
                <p className="text-xs text-neutral-500">
                  Contacta al deudor mediante canales directos con un recordatorio formal y respetuoso.
                </p>
              </div>

              {/* Contact shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {debtor.phone ? (
                  <a
                    href={`tel:${debtor.phone}`}
                    className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-medium text-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-semibold">Llamar por teléfono</span>
                      <span className="text-neutral-500 text-[11px]">{debtor.phone}</span>
                    </div>
                  </a>
                ) : (
                  <div className="p-3 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Sin teléfono registrado</span>
                  </div>
                )}

                {debtor.email ? (
                  <a
                    href={`mailto:${debtor.email}?subject=Recordatorio de pago - ${encodeURIComponent(debtor.concept)}&body=${encodeURIComponent(reminderMessage)}`}
                    className="flex items-center gap-2 p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-medium text-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-semibold">Enviar Correo Electrónico</span>
                      <span className="text-neutral-500 text-[11px]">{debtor.email}</span>
                    </div>
                  </a>
                ) : (
                  <div className="p-3 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Sin email registrado</span>
                  </div>
                )}
              </div>

              {/* Plantilla WhatsApp */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Plantilla de Notificación por WhatsApp
                  </span>
                  <button
                    onClick={handleCopyReminder}
                    className="text-xs text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-medium"
                  >
                    {copiedReminder ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar texto</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-neutral-700 leading-relaxed font-sans shadow-xs">
                  {reminderMessage}
                </div>

                {cleanPhone ? (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir Chat de WhatsApp con {debtor.fullName}</span>
                  </a>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic">
                    Agrega un número de teléfono con código de país en la ficha del moroso para enviar directo a WhatsApp.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Controls */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <button
            onClick={() => onToggleStatus(debtor)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              debtor.status === 'paid'
                ? 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{debtor.status === 'paid' ? 'Reabrir como Pendiente' : 'Marcar como Totalmente Liquidado'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-200/70 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
