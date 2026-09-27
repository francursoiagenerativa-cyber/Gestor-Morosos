import { DebtorStatus } from '../types/debtor';

export function formatCurrency(amount: number, currency: string = '€'): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isPastDueDate(dueDateString: string): boolean {
  if (!dueDateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateString.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate.getTime() < today.getTime();
}

export function getDaysDiff(dueDateString: string): number {
  if (!dueDateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateString.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function computeEffectiveStatus(
  remainingAmount: number,
  originalAmount: number,
  dueDate: string,
  userStatus?: DebtorStatus
): DebtorStatus {
  if (remainingAmount <= 0) {
    return 'paid';
  }
  if (remainingAmount < originalAmount) {
    if (isPastDueDate(dueDate)) return 'overdue';
    return 'partial';
  }
  if (isPastDueDate(dueDate)) {
    return 'overdue';
  }
  return userStatus === 'paid' ? 'paid' : 'pending';
}

export function getStatusBadgeInfo(status: DebtorStatus): {
  label: string;
  dotColor: string;
  textColor: string;
  bgColor: string;
} {
  switch (status) {
    case 'paid':
      return {
        label: 'Pagado',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
      };
    case 'partial':
      return {
        label: 'Pago Parcial',
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
      };
    case 'overdue':
      return {
        label: 'Vencido',
        dotColor: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
      };
    case 'pending':
    default:
      return {
        label: 'Pendiente',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
      };
  }
}
