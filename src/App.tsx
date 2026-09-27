import React, { useState, useEffect, useMemo } from 'react';
import { Debtor, DebtorStats, PaymentRecord } from './types/debtor';
import { 
  loadDebtorsFromStorage, 
  saveDebtorsToStorage, 
  loadDeletedDebtorsFromStorage,
  saveDeletedDebtorsToStorage,
  resetToDemoData 
} from './utils/storage';
import { exportToCSV } from './utils/export';
import { computeEffectiveStatus } from './utils/formatters';

import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { PersonalDebtList } from './components/PersonalDebtList';
import { PersonalDebtModal } from './components/PersonalDebtModal';
import { PersonalPaymentModal } from './components/PersonalPaymentModal';
import { PersonalDetailModal } from './components/PersonalDetailModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [debtors, setDebtors] = useState<Debtor[]>(() => loadDebtorsFromStorage());
  const [deletedDebtors, setDeletedDebtors] = useState<Debtor[]>(() => loadDeletedDebtorsFromStorage());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 4 tabs: 'pending' | 'paid' | 'all' | 'deleted'
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'deleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtorToEdit, setDebtorToEdit] = useState<Debtor | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [debtorForPayment, setDebtorForPayment] = useState<Debtor | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [debtorForDetail, setDebtorForDetail] = useState<Debtor | null>(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [debtorToDelete, setDebtorToDelete] = useState<Debtor | null>(null);

  const [isConfirmPermanentDeleteOpen, setIsConfirmPermanentDeleteOpen] = useState(false);
  const [debtorToPermanentDelete, setDebtorToPermanentDelete] = useState<Debtor | null>(null);

  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveDebtorsToStorage(debtors);
  }, [debtors]);

  useEffect(() => {
    saveDeletedDebtorsToStorage(deletedDebtors);
  }, [deletedDebtors]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize status
  const synchronizedDebtors = useMemo(() => {
    return debtors.map((d) => {
      const effStatus = computeEffectiveStatus(
        d.remainingAmount,
        d.originalAmount,
        d.dueDate,
        d.status
      );
      if (effStatus !== d.status) {
        return { ...d, status: effStatus };
      }
      return d;
    });
  }, [debtors]);

  // Executive Stats matching screenshot
  const stats: DebtorStats = useMemo(() => {
    const totalDebtors = synchronizedDebtors.length;
    let activeDebtors = 0;
    let paidDebtors = 0;
    let totalDebtAmount = 0;
    let totalRemainingAmount = 0;
    let overdueCount = 0;

    synchronizedDebtors.forEach((d) => {
      totalDebtAmount += d.originalAmount || 0;
      totalRemainingAmount += d.remainingAmount || 0;

      if (d.status === 'paid' || d.remainingAmount <= 0) {
        paidDebtors += 1;
      } else {
        activeDebtors += 1;
      }
    });

    const totalRecoveredAmount = Math.max(0, totalDebtAmount - totalRemainingAmount);
    const recoveryRate = totalDebtAmount > 0 ? (totalRecoveredAmount / totalDebtAmount) * 100 : 0;

    return {
      totalDebtors,
      activeDebtors,
      paidDebtors,
      totalDebtAmount,
      totalRemainingAmount,
      totalRecoveredAmount,
      overdueCount,
      recoveryRate,
    };
  }, [synchronizedDebtors]);

  // Filter list by tab & search query
  const filteredDebtors = useMemo(() => {
    let source = activeTab === 'deleted' ? [...deletedDebtors] : [...synchronizedDebtors];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      source = source.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.concept.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q)) ||
          (d.phone && d.phone.includes(q))
      );
    }

    // Tabs: Pending / Paid / All / Deleted
    if (activeTab === 'pending') {
      source = source.filter((d) => d.status !== 'paid' && d.remainingAmount > 0);
    } else if (activeTab === 'paid') {
      source = source.filter((d) => d.status === 'paid' || d.remainingAmount <= 0);
    }

    // Sort by recent first
    source.sort((a, b) => (b.debtDate || '').localeCompare(a.debtDate || ''));

    return source;
  }, [synchronizedDebtors, deletedDebtors, activeTab, searchQuery]);

  // ================= ACTIONS =================

  const handleOpenNewDebt = () => {
    setDebtorToEdit(null);
    setIsDebtModalOpen(true);
  };

  const handleOpenEdit = (debtor: Debtor) => {
    setDebtorToEdit(debtor);
    setIsDebtModalOpen(true);
  };

  const handleSaveDebt = (data: Partial<Debtor>) => {
    if (debtorToEdit) {
      setDebtors((prev) =>
        prev.map((item) => {
          if (item.id === debtorToEdit.id) {
            const updated: Debtor = {
              ...item,
              ...data,
              updatedAt: new Date().toISOString(),
            } as Debtor;
            return updated;
          }
          return item;
        })
      );
      showToast(`Deuda de ${data.fullName} actualizada`, 'success');
      if (debtorForDetail && debtorForDetail.id === debtorToEdit.id) {
        setDebtorForDetail((prev) => (prev ? { ...prev, ...data } as Debtor : null));
      }
    } else {
      const newDebtor: Debtor = {
        id: 'deb-' + Date.now().toString(),
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        originalAmount: data.originalAmount || 0,
        remainingAmount: data.remainingAmount ?? data.originalAmount ?? 0,
        currency: '€',
        debtDate: data.debtDate || new Date().toISOString().split('T')[0],
        dueDate: data.debtDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        concept: data.concept || 'Préstamo personal',
        notes: data.notes || '',
        paymentHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDebtors((prev) => [newDebtor, ...prev]);
      showToast(`Deuda con ${newDebtor.fullName} añadida`, 'success');
    }
  };

  const handleTogglePaid = (debtor: Debtor) => {
    const isCurrentlyPaid = debtor.status === 'paid' || debtor.remainingAmount <= 0;

    if (isCurrentlyPaid) {
      // Reopen
      const totalPaid = (debtor.paymentHistory || []).reduce((acc, p) => acc + p.amount, 0);
      const newRemaining = Math.max(0, debtor.originalAmount - totalPaid) || debtor.originalAmount;
      setDebtors((prev) =>
        prev.map((d) =>
          d.id === debtor.id ? { ...d, remainingAmount: newRemaining, status: 'pending' } : d
        )
      );
      showToast(`Deuda con ${debtor.fullName} marcada como pendiente`, 'info');
      if (debtorForDetail?.id === debtor.id) {
        setDebtorForDetail((prev) =>
          prev ? { ...prev, remainingAmount: newRemaining, status: 'pending' } : null
        );
      }
    } else {
      // Mark as fully paid
      setDebtors((prev) =>
        prev.map((d) =>
          d.id === debtor.id ? { ...d, remainingAmount: 0, status: 'paid' } : d
        )
      );
      showToast(`¡Deuda de ${debtor.fullName} marcada como pagada!`, 'success');
      if (debtorForDetail?.id === debtor.id) {
        setDebtorForDetail((prev) =>
          prev ? { ...prev, remainingAmount: 0, status: 'paid' } : null
        );
      }
    }
  };

  const handleOpenPayment = (debtor: Debtor) => {
    setDebtorForPayment(debtor);
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = (
    debtorId: string,
    paymentData: Omit<PaymentRecord, 'id' | 'recordedAt'>
  ) => {
    const paymentRecord: PaymentRecord = {
      ...paymentData,
      id: 'pay-' + Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };

    setDebtors((prev) =>
      prev.map((d) => {
        if (d.id === debtorId) {
          const newRemaining = Math.max(0, d.remainingAmount - paymentData.amount);
          const newStatus = newRemaining <= 0 ? 'paid' : 'partial';
          const updated: Debtor = {
            ...d,
            remainingAmount: newRemaining,
            status: newStatus,
            paymentHistory: [...(d.paymentHistory || []), paymentRecord],
            updatedAt: new Date().toISOString(),
          };
          if (debtorForDetail && debtorForDetail.id === debtorId) {
            setDebtorForDetail(updated);
          }
          return updated;
        }
        return d;
      })
    );

    showToast(`Abono de ${paymentData.amount.toFixed(2)} € guardado`, 'success');
  };

  const handleDeletePayment = (debtorId: string, paymentId: string) => {
    setDebtors((prev) =>
      prev.map((d) => {
        if (d.id === debtorId) {
          const paymentToRemove = (d.paymentHistory || []).find((p) => p.id === paymentId);
          if (!paymentToRemove) return d;

          const updatedHistory = (d.paymentHistory || []).filter((p) => p.id !== paymentId);
          const restoredRemaining = Math.min(
            d.originalAmount,
            d.remainingAmount + paymentToRemove.amount
          );
          const newStatus = restoredRemaining <= 0 ? 'paid' : 'pending';

          const updated: Debtor = {
            ...d,
            remainingAmount: restoredRemaining,
            status: newStatus,
            paymentHistory: updatedHistory,
            updatedAt: new Date().toISOString(),
          };
          if (debtorForDetail && debtorForDetail.id === debtorId) {
            setDebtorForDetail(updated);
          }
          return updated;
        }
        return d;
      })
    );

    showToast('Abono anulado', 'info');
  };

  const handleOpenDetail = (debtor: Debtor) => {
    setDebtorForDetail(debtor);
    setIsDetailModalOpen(true);
  };

  const handleOpenDelete = (debtor: Debtor) => {
    setDebtorToDelete(debtor);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!debtorToDelete) return;
    // Remove from active debtors
    setDebtors((prev) => prev.filter((d) => d.id !== debtorToDelete.id));
    // Add to deleted debtors (placed first)
    setDeletedDebtors((prev) => [
      debtorToDelete,
      ...prev.filter((d) => d.id !== debtorToDelete.id),
    ]);
    showToast(`Deuda de ${debtorToDelete.fullName} movida a "Eliminadas"`, 'info');
    if (debtorForDetail?.id === debtorToDelete.id) {
      setIsDetailModalOpen(false);
      setDebtorForDetail(null);
    }
    setIsConfirmDeleteOpen(false);
    setDebtorToDelete(null);
  };

  const handleRestoreDeleted = (debtor: Debtor) => {
    // Remove from deletedDebtors
    setDeletedDebtors((prev) => prev.filter((d) => d.id !== debtor.id));
    // Add back to active debtors
    setDebtors((prev) => [debtor, ...prev.filter((d) => d.id !== debtor.id)]);
    showToast(`Deuda de ${debtor.fullName} restaurada`, 'success');
  };

  const handleOpenPermanentDelete = (debtor: Debtor) => {
    setDebtorToPermanentDelete(debtor);
    setIsConfirmPermanentDeleteOpen(true);
  };

  const handleConfirmPermanentDelete = () => {
    if (!debtorToPermanentDelete) return;
    setDeletedDebtors((prev) => prev.filter((d) => d.id !== debtorToPermanentDelete.id));
    showToast(`Deuda de ${debtorToPermanentDelete.fullName} eliminada definitivamente`, 'info');
    setIsConfirmPermanentDeleteOpen(false);
    setDebtorToPermanentDelete(null);
  };

  const handleExportCSV = () => {
    exportToCSV(debtors, `mis_deudas_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Archivo CSV descargado', 'success');
  };

  const handleResetDemo = () => {
    const demo = resetToDemoData();
    setDebtors(demo);
    setIsConfirmResetOpen(false);
    showToast('Datos de demostración restablecidos', 'info');
  };

  return (
    <div className="min-h-screen bg-[#181b22] text-slate-100 flex flex-col justify-between antialiased selection:bg-blue-500/30">
      {/* Centered Phone/Tablet Viewport Shell matching the user mockup */}
      <div className="w-full max-w-lg sm:max-w-xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Top Header */}
        <Header
          onExportCSV={handleExportCSV}
          onResetDemo={() => setIsConfirmResetOpen(true)}
        />

        {/* 2x2 Metric Cards Grid */}
        <StatsGrid
          stats={stats}
          currency="€"
          onFilterPending={() => setActiveTab('pending')}
          onFilterPaid={() => setActiveTab('paid')}
        />

        {/* "Tu Cartera" Section + Search + Tabs + Debt Cards */}
        <PersonalDebtList
          debtors={filteredDebtors}
          totalCount={debtors.length}
          pendingCount={stats.activeDebtors}
          paidCount={stats.paidDebtors}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewDebt={handleOpenNewDebt}
          onTogglePaid={handleTogglePaid}
          onOpenPayment={handleOpenPayment}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          deletedCount={deletedDebtors.length}
          onRestoreDeleted={handleRestoreDeleted}
          onPermanentDelete={handleOpenPermanentDelete}
        />
      </div>

      {/* Clean Bottom Bar */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-800/80">
        <p>Control de deudas personales · Guardado en tu dispositivo</p>
      </footer>

      {/* Modals */}
      <PersonalDebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setDebtorToEdit(null);
        }}
        onSave={handleSaveDebt}
        debtorToEdit={debtorToEdit}
      />

      <PersonalPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setDebtorForPayment(null);
        }}
        debtor={debtorForPayment}
        onAddPayment={handleAddPayment}
      />

      <PersonalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDebtorForDetail(null);
        }}
        debtor={debtorForDetail}
        onTogglePaid={handleTogglePaid}
        onOpenPaymentModal={handleOpenPayment}
        onDeletePayment={handleDeletePayment}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="¿Mover a eliminadas?"
        message={
          debtorToDelete
            ? `La deuda de "${debtorToDelete.fullName}" se moverá a la pestaña "Eliminadas". Podrás consultarla o recuperarla cuando quieras.`
            : ''
        }
        confirmLabel="Mover a eliminadas"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setDebtorToDelete(null);
        }}
      />

      <ConfirmModal
        isOpen={isConfirmPermanentDeleteOpen}
        title="¿Eliminar definitivamente?"
        message={
          debtorToPermanentDelete
            ? `Se borrará de forma permanente el registro de "${debtorToPermanentDelete.fullName}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Borrar para siempre"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => {
          setIsConfirmPermanentDeleteOpen(false);
          setDebtorToPermanentDelete(null);
        }}
      />

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        title="¿Restablecer ejemplos?"
        message="Se reiniciará la lista con los 3 registros de prueba del modelo."
        confirmLabel="Restablecer"
        cancelLabel="Cancelar"
        isDestructive={false}
        onConfirm={handleResetDemo}
        onCancel={() => setIsConfirmResetOpen(false)}
      />

      {/* Toast alert notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
