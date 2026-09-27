import { Debtor } from '../types/debtor';

const STORAGE_KEY = 'morosos_app_records_v1';
const DELETED_STORAGE_KEY = 'morosos_app_deleted_records_v1';

export const INITIAL_DEMO_DATA: Debtor[] = [
  {
    id: 'deb-1',
    fullName: 'Carlos',
    phone: '+34 612 345 678',
    email: 'carlos@amigos.es',
    originalAmount: 300.0,
    remainingAmount: 300.0,
    currency: '€',
    debtDate: '2026-09-23',
    dueDate: '2026-10-23',
    status: 'pending',
    concept: 'Préstamo para billetes de tren y escapada de fin de semana',
    notes: 'Quedó en devolverlo con la nómina a fin de mes.',
    paymentHistory: [],
    createdAt: '2026-09-23T10:00:00Z',
    updatedAt: '2026-09-23T10:00:00Z',
  },
  {
    id: 'deb-2',
    fullName: 'Lucía',
    phone: '+34 644 789 012',
    email: 'lucia@correo.com',
    originalAmount: 150.0,
    remainingAmount: 150.0,
    currency: '€',
    debtDate: '2026-09-18',
    dueDate: '2026-10-18',
    status: 'pending',
    concept: 'Entradas para concierto de rock',
    notes: 'Compré 2 entradas anticipadas.',
    paymentHistory: [],
    createdAt: '2026-09-18T12:30:00Z',
    updatedAt: '2026-09-18T12:30:00Z',
  },
  {
    id: 'deb-3',
    fullName: 'Marcos',
    phone: '+34 689 123 456',
    email: 'marcos@amigos.es',
    originalAmount: 2000.0,
    remainingAmount: 0.0,
    currency: '€',
    debtDate: '2026-08-10',
    dueDate: '2026-09-10',
    status: 'paid',
    concept: 'Fianza del piso compartido de verano',
    notes: 'Devuelto por Bizum completo.',
    paymentHistory: [
      {
        id: 'pay-301',
        amount: 2000.0,
        date: '2026-09-08',
        method: 'Bizum / Móvil',
        reference: 'BIZUM-991',
        notes: 'Pago íntegro recibido',
        recordedAt: '2026-09-08T15:00:00Z',
      },
    ],
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-08T15:00:00Z',
  },
];

export function loadDebtorsFromStorage(): Debtor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_DATA;
  } catch (error) {
    console.error('Error cargando deudores de localStorage:', error);
    return INITIAL_DEMO_DATA;
  }
}

export function saveDebtorsToStorage(debtors: Debtor[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debtors));
  } catch (error) {
    console.error('Error guardando deudores en localStorage:', error);
  }
}

export function loadDeletedDebtorsFromStorage(): Debtor[] {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error cargando deudores eliminados de localStorage:', error);
    return [];
  }
}

export function saveDeletedDebtorsToStorage(deletedDebtors: Debtor[]): void {
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedDebtors));
  } catch (error) {
    console.error('Error guardando deudores eliminados en localStorage:', error);
  }
}

export function resetToDemoData(): Debtor[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  return INITIAL_DEMO_DATA;
}

export function clearAllStorage(): Debtor[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
