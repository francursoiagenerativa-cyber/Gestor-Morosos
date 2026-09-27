export type DebtorStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Bizum / Móvil' | 'Otro';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  recordedAt: string;
}

export interface Debtor {
  id: string;
  fullName: string;
  documentId?: string; // DNI, CIF, RUT, etc.
  phone?: string;
  email?: string;
  originalAmount: number;
  remainingAmount: number;
  currency: string; // '€', '$', 'S/', etc.
  debtDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: DebtorStatus;
  concept: string; // Motivo o factura
  notes?: string;
  paymentHistory: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'debtDate' | 'dueDate' | 'remainingAmount' | 'fullName' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface DebtorFilter {
  search: string;
  status: 'all' | DebtorStatus;
  sortField: SortField;
  sortOrder: SortOrder;
  onlyOverdue: boolean;
}

export interface DebtorStats {
  totalDebtors: number;
  activeDebtors: number;
  paidDebtors: number;
  totalDebtAmount: number; // total adeudado original
  totalRemainingAmount: number; // saldo pendiente actual
  totalRecoveredAmount: number; // total cobrado
  overdueCount: number;
  recoveryRate: number; // porcentaje 0-100
}
