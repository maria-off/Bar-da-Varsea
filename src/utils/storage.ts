import { AppData } from '../types';
import { initialData } from '../initialData';

const STORAGE_KEY = 'bar_da_varzea_vendas_data_v1';

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    // Merge with defaults in case of missing keys
    return {
      tournaments: parsed.tournaments?.length ? parsed.tournaments : initialData.tournaments,
      activeTournamentId: parsed.activeTournamentId || (parsed.tournaments?.[0]?.id ?? initialData.activeTournamentId),
      customers: parsed.customers || initialData.customers,
      products: parsed.products || initialData.products,
      sales: parsed.sales || initialData.sales,
      debts: parsed.debts || initialData.debts,
      payments: parsed.payments || initialData.payments,
      expenses: parsed.expenses || initialData.expenses,
      settings: parsed.settings || initialData.settings,
    };
  } catch (err) {
    console.error('Erro ao ler localStorage:', err);
    return initialData;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

export function resetAppData(): AppData {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

export function exportAppDataToJson(data: AppData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `backup_bar_varzea_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseJsonFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppData;
        if (!parsed.tournaments || !parsed.activeTournamentId) {
          throw new Error('Arquivo de backup inválido: dados essenciais ausentes.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsText(file);
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function checkDebtDueDate(dueDateIso: string): {
  isOverdue: boolean;
  days: number;
  text: string;
} {
  const now = new Date();
  const due = new Date(dueDateIso);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      isOverdue: true,
      days: overdueDays,
      text: overdueDays === 0 ? 'Vence hoje!' : `Vencido há ${overdueDays} dia${overdueDays > 1 ? 's' : ''}`,
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      days: 0,
      text: 'Vence hoje!',
    };
  } else {
    return {
      isOverdue: false,
      days: diffDays,
      text: `Vence em ${diffDays} dia${diffDays > 1 ? 's' : ''}`,
    };
  }
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppLink(
  phone: string,
  customerName: string,
  tournamentName: string,
  totalDebt: number,
  dueDateText: string,
  template: string,
  pixKey: string
): string {
  const digits = cleanPhone(phone);
  // Default to Brazil country code 55 if not present
  const fullPhone = digits.length <= 11 ? `55${digits}` : digits;

  let message = template
    .replace('{cliente}', customerName)
    .replace('{copa}', tournamentName)
    .replace('{valor}', formatCurrency(totalDebt))
    .replace('{vencimento}', dueDateText)
    .replace('{pix}', pixKey || '(Consulte a chave PIX no bar)');

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
