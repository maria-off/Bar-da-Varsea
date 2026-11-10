export type TabType = 
  | 'painel' 
  | 'comanda' 
  | 'lucro' 
  | 'compras' 
  | 'fiados' 
  | 'pagamentos' 
  | 'clientes' 
  | 'produtos' 
  | 'copas' 
  | 'config';

export interface Tournament {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'finished';
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  emoji: string;
  team?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: 'Cervejas' | 'Refrigerantes' | 'Espetos' | 'Lanches' | 'Doses' | 'Diversos';
  emoji: string;
}

export interface CartItem {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  emoji?: string;
  isCustom?: boolean; // Compras com valor livre
}

export interface Sale {
  id: string;
  tournamentId: string;
  customerId?: string;
  customerName: string;
  items: CartItem[];
  total: number;
  totalCost: number;
  paymentType: 'cash' | 'fiado';
  paymentMethod?: 'dinheiro' | 'pix' | 'cartao' | 'outro';
  createdAt: string;
  isDebtManual?: boolean;
}

export interface Debt {
  id: string;
  tournamentId: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  description: string;
  amount: number;
  paidAmount: number;
  createdAt: string; // ISO date
  dueDate: string;   // ISO date (createdAt + 7 days)
  status: 'pending' | 'paid';
  paidAt?: string;
}

export interface Payment {
  id: string;
  tournamentId: string;
  customerId: string;
  customerName: string;
  debtId?: string; // If paid for a specific debt, or for all
  amount: number;
  method: 'pix' | 'dinheiro' | 'cartao' | 'outro';
  createdAt: string;
  notes?: string;
  isReversed: boolean;
  reversedAt?: string;
  reversedReason?: string;
}

export interface Expense {
  id: string;
  tournamentId: string;
  description: string;
  amount: number;
  category: 'gelo_carvao' | 'bebidas_estoque' | 'carnes_alimentos' | 'arbitragem' | 'trofeus' | 'limpeza' | 'outros';
  createdAt: string;
}

export interface AppSettings {
  pixKey: string;
  pixType: 'celular' | 'cpf' | 'email' | 'aleatoria';
  pixName: string;
  whatsappMessageTemplate: string;
  defaultFiadoDays: number;
}

export interface AppData {
  tournaments: Tournament[];
  activeTournamentId: string;
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  debts: Debt[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;
}
