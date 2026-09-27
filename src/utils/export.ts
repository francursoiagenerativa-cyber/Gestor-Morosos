import { Debtor } from '../types/debtor';
import { formatDate } from './formatters';

export function exportToCSV(debtors: Debtor[], filename: string = 'lista_morosos.csv'): void {
  const headers = [
    'ID',
    'Nombre Completo',
    'Documento / CIF',
    'Teléfono',
    'Email',
    'Concepto Deuda',
    'Monto Original',
    'Saldo Pendiente',
    'Monto Pagado',
    'Moneda',
    'Fecha Deuda',
    'Fecha Vencimiento',
    'Estado',
    'Cant. Abonos',
    'Notas / Observaciones',
  ];

  const rows = debtors.map((d) => {
    const totalPaid = (d.paymentHistory || []).reduce((acc, p) => acc + (p.amount || 0), 0);
    const statusLabel =
      d.status === 'paid'
        ? 'Pagado'
        : d.status === 'partial'
        ? 'Pago Parcial'
        : d.status === 'overdue'
        ? 'Vencido'
        : 'Pendiente';

    return [
      `"${d.id}"`,
      `"${(d.fullName || '').replace(/"/g, '""')}"`,
      `"${(d.documentId || '').replace(/"/g, '""')}"`,
      `"${(d.phone || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.concept || '').replace(/"/g, '""')}"`,
      d.originalAmount.toFixed(2),
      d.remainingAmount.toFixed(2),
      totalPaid.toFixed(2),
      `"${d.currency}"`,
      `"${d.debtDate}"`,
      `"${d.dueDate}"`,
      `"${statusLabel}"`,
      (d.paymentHistory || []).length,
      `"${(d.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(debtors: Debtor[], filename: string = 'respaldo_morosos.json'): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(debtors, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrintReport(): void {
  window.print();
}
