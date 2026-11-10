import { AppData } from './types';

const now = new Date();

// Helper date offsets
const daysAgo = (days: number): string => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

const daysFrom = (baseIso: string, days: number): string => {
  const base = new Date(baseIso);
  const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

const debt1Created = daysAgo(9); // Overdue (9 days ago, due was 2 days ago)
const debt1Due = daysFrom(debt1Created, 7);

const debt2Created = daysAgo(3); // Due in 4 days
const debt2Due = daysFrom(debt2Created, 7);

const debt3Created = daysAgo(1); // Due in 6 days
const debt3Due = daysFrom(debt3Created, 7);

export const initialData: AppData = {
  activeTournamentId: 'copa-resenha-2026',
  tournaments: [
    {
      id: 'copa-resenha-2026',
      name: '🏆 Copa Resenha de Domingo 2026',
      date: '2026-05-10',
      status: 'active',
      location: 'Campo da Associação - Várzea Paulista',
      notes: 'Campeonato principal com 8 times. Jogos das 08h às 16h.',
      createdAt: daysAgo(15),
    },
    {
      id: 'torneio-terrao-relampago',
      name: '⚽ Torneio Relâmpago do Terrão',
      date: '2026-04-20',
      status: 'finished',
      location: 'Campo do Poeirão',
      notes: 'Finalizado no mês passado. Campeão: Unidos do Morro FC.',
      createdAt: daysAgo(30),
    },
  ],
  customers: [
    {
      id: 'c-1',
      name: 'Zé da Pinga (Goleiro)',
      phone: '11987654321',
      emoji: '🧤',
      team: 'Unidos do Morro FC',
      createdAt: daysAgo(20),
    },
    {
      id: 'c-2',
      name: 'Beto Lateral',
      phone: '11991234567',
      emoji: '🏃‍♂️',
      team: 'Vila Esperança',
      createdAt: daysAgo(18),
    },
    {
      id: 'c-3',
      name: 'Marquinhos Camisa 10',
      phone: '11977778888',
      emoji: '⚽',
      team: 'Estrela Vermelha',
      createdAt: daysAgo(15),
    },
    {
      id: 'c-4',
      name: 'Juiz Valdir',
      phone: '11966665555',
      emoji: '🟨',
      team: 'Arbitragem da Liga',
      createdAt: daysAgo(15),
    },
    {
      id: 'c-5',
      name: 'Paulinho Churrasqueiro',
      phone: '11955554444',
      emoji: '🥩',
      team: 'Comissão Organizadora',
      createdAt: daysAgo(14),
    },
    {
      id: 'c-6',
      name: 'Juninho Bala',
      phone: '11944443333',
      emoji: '⚡',
      team: 'Real Várzea FC',
      createdAt: daysAgo(10),
    },
  ],
  products: [
    {
      id: 'p-1',
      name: 'Brahma Duplo Malte Latão 473ml',
      price: 8.0,
      cost: 4.2,
      category: 'Cervejas',
      emoji: '🍺',
    },
    {
      id: 'p-2',
      name: 'Heineken Long Neck 330ml',
      price: 11.0,
      cost: 6.5,
      category: 'Cervejas',
      emoji: '🍾',
    },
    {
      id: 'p-3',
      name: 'Amstel Puro Malte Latão',
      price: 7.5,
      cost: 3.8,
      category: 'Cervejas',
      emoji: '🍻',
    },
    {
      id: 'p-4',
      name: 'Espetinho de Alcatra Especial',
      price: 12.0,
      cost: 5.5,
      category: 'Espetos',
      emoji: '🥩',
    },
    {
      id: 'p-5',
      name: 'Espetinho de Linguiça Campeira',
      price: 10.0,
      cost: 4.0,
      category: 'Espetos',
      emoji: '🍢',
    },
    {
      id: 'p-6',
      name: 'Pastel de Carne com Queijo',
      price: 9.0,
      cost: 3.5,
      category: 'Lanches',
      emoji: '🥟',
    },
    {
      id: 'p-7',
      name: 'Coca-Cola Lata 350ml',
      price: 6.0,
      cost: 2.8,
      category: 'Refrigerantes',
      emoji: '🥤',
    },
    {
      id: 'p-8',
      name: 'Guaraná Antarctica Lata',
      price: 6.0,
      cost: 2.7,
      category: 'Refrigerantes',
      emoji: '🧃',
    },
    {
      id: 'p-9',
      name: 'Água Mineral c/ Gás 500ml',
      price: 4.5,
      cost: 1.5,
      category: 'Diversos',
      emoji: '💧',
    },
    {
      id: 'p-10',
      name: 'Água Mineral sem Gás 500ml',
      price: 4.0,
      cost: 1.2,
      category: 'Diversos',
      emoji: '🧊',
    },
    {
      id: 'p-11',
      name: 'Dose Cachaça da Roça (Ouro)',
      price: 5.0,
      cost: 1.0,
      category: 'Doses',
      emoji: '🥃',
    },
    {
      id: 'p-12',
      name: 'Gatorade Isotônico 500ml',
      price: 9.0,
      cost: 5.0,
      category: 'Diversos',
      emoji: '⚡',
    },
  ],
  sales: [
    {
      id: 's-1',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-1',
      customerName: 'Zé da Pinga (Goleiro)',
      items: [
        { productId: 'p-1', name: 'Brahma Duplo Malte Latão 473ml', quantity: 4, unitPrice: 8.0, unitCost: 4.2, emoji: '🍺' },
        { productId: 'p-4', name: 'Espetinho de Alcatra Especial', quantity: 2, unitPrice: 12.0, unitCost: 5.5, emoji: '🥩' },
      ],
      total: 56.0,
      totalCost: 27.8,
      paymentType: 'fiado',
      createdAt: debt1Created,
    },
    {
      id: 's-2',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-3',
      customerName: 'Marquinhos Camisa 10',
      items: [
        { productId: 'p-2', name: 'Heineken Long Neck 330ml', quantity: 6, unitPrice: 11.0, unitCost: 6.5, emoji: '🍾' },
        { productId: 'p-5', name: 'Espetinho de Linguiça Campeira', quantity: 3, unitPrice: 10.0, unitCost: 4.0, emoji: '🍢' },
      ],
      total: 96.0,
      totalCost: 51.0,
      paymentType: 'fiado',
      createdAt: debt2Created,
    },
    {
      id: 's-3',
      tournamentId: 'copa-resenha-2026',
      customerName: 'Balcão (Torcida Vila)',
      items: [
        { productId: 'p-1', name: 'Brahma Duplo Malte Latão 473ml', quantity: 10, unitPrice: 8.0, unitCost: 4.2, emoji: '🍺' },
        { productId: 'p-6', name: 'Pastel de Carne com Queijo', quantity: 5, unitPrice: 9.0, unitCost: 3.5, emoji: '🥟' },
      ],
      total: 125.0,
      totalCost: 59.5,
      paymentType: 'cash',
      paymentMethod: 'pix',
      createdAt: daysAgo(2),
    },
    {
      id: 's-4',
      tournamentId: 'copa-resenha-2026',
      customerName: 'Venda Rápida (Intervalo)',
      items: [
        { productId: 'p-7', name: 'Coca-Cola Lata 350ml', quantity: 4, unitPrice: 6.0, unitCost: 2.8, emoji: '🥤' },
        { productId: 'p-10', name: 'Água Mineral sem Gás 500ml', quantity: 6, unitPrice: 4.0, unitCost: 1.2, emoji: '🧊' },
        { productId: 'p-12', name: 'Gatorade Isotônico 500ml', quantity: 3, unitPrice: 9.0, unitCost: 5.0, emoji: '⚡' },
      ],
      total: 75.0,
      totalCost: 33.4,
      paymentType: 'cash',
      paymentMethod: 'dinheiro',
      createdAt: daysAgo(1),
    },
    {
      id: 's-5',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-4',
      customerName: 'Juiz Valdir',
      items: [
        { productId: 'p-9', name: 'Água Mineral c/ Gás 500ml', quantity: 2, unitPrice: 4.5, unitCost: 1.5, emoji: '💧' },
        { productId: 'p-11', name: 'Dose Cachaça da Roça (Ouro)', quantity: 2, unitPrice: 5.0, unitCost: 1.0, emoji: '🥃' },
      ],
      total: 19.0,
      totalCost: 5.0,
      paymentType: 'fiado',
      createdAt: debt3Created,
    },
    {
      id: 's-6',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-2',
      customerName: 'Beto Lateral',
      items: [
        { name: 'Combo Resenha pós-jogo (Valor Livre)', quantity: 1, unitPrice: 45.0, unitCost: 22.0, emoji: '🔥', isCustom: true }
      ],
      total: 45.0,
      totalCost: 22.0,
      paymentType: 'cash',
      paymentMethod: 'cartao',
      createdAt: daysAgo(1),
    }
  ],
  debts: [
    {
      id: 'd-1',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-1',
      customerName: 'Zé da Pinga (Goleiro)',
      saleId: 's-1',
      description: '4x Brahma Latão, 2x Espeto de Alcatra',
      amount: 56.0,
      paidAmount: 0,
      createdAt: debt1Created,
      dueDate: debt1Due, // Already expired > 7 days!
      status: 'pending',
    },
    {
      id: 'd-2',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-3',
      customerName: 'Marquinhos Camisa 10',
      saleId: 's-2',
      description: '6x Heineken Long Neck, 3x Espeto de Linguiça',
      amount: 96.0,
      paidAmount: 0,
      createdAt: debt2Created,
      dueDate: debt2Due, // Due in 4 days
      status: 'pending',
    },
    {
      id: 'd-3',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-4',
      customerName: 'Juiz Valdir',
      saleId: 's-5',
      description: '2x Água c/ gás, 2x Dose de Cachaça',
      amount: 19.0,
      paidAmount: 0,
      createdAt: debt3Created,
      dueDate: debt3Due, // Due in 6 days
      status: 'pending',
    },
    {
      id: 'd-4',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-2',
      customerName: 'Beto Lateral',
      description: 'Dívida manual: Rateio do churrasco da abertura',
      amount: 35.0,
      paidAmount: 35.0,
      createdAt: daysAgo(12),
      dueDate: daysAgo(5),
      status: 'paid',
      paidAt: daysAgo(4),
    }
  ],
  payments: [
    {
      id: 'pay-1',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-2',
      customerName: 'Beto Lateral',
      debtId: 'd-4',
      amount: 35.0,
      method: 'pix',
      createdAt: daysAgo(4),
      notes: 'Quitou o rateio do churrasco via PIX',
      isReversed: false,
    },
    {
      id: 'pay-2',
      tournamentId: 'copa-resenha-2026',
      customerId: 'c-5',
      customerName: 'Paulinho Churrasqueiro',
      amount: 20.0,
      method: 'dinheiro',
      createdAt: daysAgo(7),
      notes: 'Acerto de conta anterior',
      isReversed: true,
      reversedAt: daysAgo(6),
      reversedReason: 'Lançado valor errado, cliente pagou por engano',
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      tournamentId: 'copa-resenha-2026',
      description: '6 Sacos de Gelo Escama 10kg',
      amount: 72.0,
      category: 'gelo_carvao',
      createdAt: daysAgo(14),
    },
    {
      id: 'exp-2',
      tournamentId: 'copa-resenha-2026',
      description: '3 Sacos de Carvão Vegetal 8kg',
      amount: 60.0,
      category: 'gelo_carvao',
      createdAt: daysAgo(14),
    },
    {
      id: 'exp-3',
      tournamentId: 'copa-resenha-2026',
      description: 'Compra Atacadão: Copos descartáveis e guardanapos',
      amount: 38.5,
      category: 'outros',
      createdAt: daysAgo(10),
    },
    {
      id: 'exp-4',
      tournamentId: 'copa-resenha-2026',
      description: 'Taxa de Árbitro Auxiliar (Bandeirinha)',
      amount: 80.0,
      category: 'arbitragem',
      createdAt: daysAgo(2),
    }
  ],
  settings: {
    pixKey: '11987654321',
    pixType: 'celular',
    pixName: 'Marcão do Bar da Várzea',
    whatsappMessageTemplate: '⚽ *BAR DA VÁRZEA - RESUMO DA CONTA*\nFala {cliente}! Beleza meu craque?\nSegue o extrato dos seus consumos na *{copa}*:\n\n💰 *Total Devido:* R$ {valor}\n📅 *Vencimento:* {vencimento}\n\n🔑 *Chave PIX:* {pix}\nFavor mandar o comprovante por aqui assim que pagar. Tmj no próximo domingo! 🍻🏆',
    defaultFiadoDays: 7,
  }
};
