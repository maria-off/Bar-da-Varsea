import React, { useState, useEffect } from 'react';
import { 
  AppData, 
  TabType, 
  Tournament, 
  Customer, 
  Product, 
  CartItem, 
  Sale, 
  Debt, 
  Payment, 
  Expense, 
  AppSettings 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  resetAppData, 
  checkDebtDueDate, 
  formatCurrency 
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PainelTab } from './components/PainelTab';
import { ComandaTab } from './components/ComandaTab';
import { LucroTab } from './components/LucroTab';
import { ComprasTab } from './components/ComprasTab';
import { FiadosTab } from './components/FiadosTab';
import { PagamentosTab } from './components/PagamentosTab';
import { ClientesTab } from './components/ClientesTab';
import { ProdutosTab } from './components/ProdutosTab';
import { CopasTab } from './components/CopasTab';
import { ConfigTab } from './components/ConfigTab';

import { ManualDebtModal } from './components/ManualDebtModal';
import { QuickCustomerModal } from './components/QuickCustomerModal';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [currentTab, setCurrentTab] = useState<TabType>('painel');
  
  // Modals
  const [showManualDebtModal, setShowManualDebtModal] = useState(false);
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const activeTournament = data.tournaments.find((t) => t.id === data.activeTournamentId) || data.tournaments[0];

  // Calculate overdue debts count for active tournament
  const activeDebts = data.debts.filter((d) => d.tournamentId === data.activeTournamentId);
  const overdueCount = activeDebts.filter(
    (d) => d.status === 'pending' && checkDebtDueDate(d.dueDate).isOverdue
  ).length;

  // Handlers for Tournaments
  const handleSelectTournament = (id: string) => {
    setData((prev) => ({ ...prev, activeTournamentId: id }));
    const t = data.tournaments.find((item) => item.id === id);
    showToast(`Campeonato ativo alterado para: ${t?.name || id}`);
  };

  const handleSaveTournament = (newTournament: Tournament) => {
    setData((prev) => {
      const exists = prev.tournaments.some((t) => t.id === newTournament.id);
      const updatedList = exists
        ? prev.tournaments.map((t) => (t.id === newTournament.id ? newTournament : t))
        : [...prev.tournaments, newTournament];
      return {
        ...prev,
        tournaments: updatedList,
        activeTournamentId: newTournament.id,
      };
    });
    showToast(`Campeonato "${newTournament.name}" salvo com sucesso!`);
  };

  const handleDeleteTournament = (id: string) => {
    if (data.tournaments.length <= 1) {
      alert('Você precisa manter pelo menos um campeonato cadastrado!');
      return;
    }
    setData((prev) => {
      const filtered = prev.tournaments.filter((t) => t.id !== id);
      const newActive = prev.activeTournamentId === id ? filtered[0].id : prev.activeTournamentId;
      return {
        ...prev,
        tournaments: filtered,
        activeTournamentId: newActive,
        sales: prev.sales.filter((s) => s.tournamentId !== id),
        debts: prev.debts.filter((d) => d.tournamentId !== id),
        payments: prev.payments.filter((p) => p.tournamentId !== id),
        expenses: prev.expenses.filter((e) => e.tournamentId !== id),
      };
    });
    showToast('Campeonato e seus dados isolados foram removidos.');
  };

  // Handlers for Comanda & Sales
  const handleSaveSale = (
    customerId: string | undefined,
    customerName: string,
    items: CartItem[],
    total: number,
    paymentType: 'cash' | 'fiado',
    paymentMethod?: 'dinheiro' | 'pix' | 'cartao' | 'outro'
  ) => {
    const now = new Date();
    const nowIso = now.toISOString();
    const saleId = `s-${Date.now()}`;
    const totalCost = items.reduce((sum, item) => sum + (item.unitCost || 0) * item.quantity, 0);

    const newSale: Sale = {
      id: saleId,
      tournamentId: data.activeTournamentId,
      customerId,
      customerName,
      items,
      total,
      totalCost,
      paymentType,
      paymentMethod,
      createdAt: nowIso,
    };

    // If fiado, create debt with 7-day expiration
    let newDebt: Debt | null = null;
    if (paymentType === 'fiado' && customerId) {
      const days = data.settings.defaultFiadoDays || 7;
      const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
      const description = items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

      newDebt = {
        id: `d-${Date.now()}`,
        tournamentId: data.activeTournamentId,
        customerId,
        customerName,
        saleId,
        description,
        amount: total,
        paidAmount: 0,
        createdAt: nowIso,
        dueDate,
        status: 'pending',
      };
    }

    setData((prev) => ({
      ...prev,
      sales: [...prev.sales, newSale],
      debts: newDebt ? [...prev.debts, newDebt] : prev.debts,
    }));

    showToast(
      paymentType === 'fiado'
        ? `Fiado de ${formatCurrency(total)} pendurado para ${customerName}!`
        : `Venda de ${formatCurrency(total)} registrada no Caixa!`
    );
  };

  // Handlers for Manual Debt (sem produto)
  const handleSaveManualDebt = (customerId: string, description: string, amount: number) => {
    const customer = data.customers.find((c) => c.id === customerId);
    if (!customer) return;

    const now = new Date();
    const nowIso = now.toISOString();
    const days = data.settings.defaultFiadoDays || 7;
    const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    const debtId = `d-man-${Date.now()}`;

    const newDebt: Debt = {
      id: debtId,
      tournamentId: data.activeTournamentId,
      customerId: customer.id,
      customerName: customer.name,
      description,
      amount,
      paidAmount: 0,
      createdAt: nowIso,
      dueDate,
      status: 'pending',
    };

    // Also register a sale record so it counts towards tournament total sales
    const newSale: Sale = {
      id: `s-man-${Date.now()}`,
      tournamentId: data.activeTournamentId,
      customerId: customer.id,
      customerName: customer.name,
      items: [
        {
          name: description,
          quantity: 1,
          unitPrice: amount,
          unitCost: 0,
          emoji: '📝',
          isCustom: true,
        },
      ],
      total: amount,
      totalCost: 0,
      paymentType: 'fiado',
      createdAt: nowIso,
      isDebtManual: true,
    };

    setData((prev) => ({
      ...prev,
      debts: [...prev.debts, newDebt],
      sales: [...prev.sales, newSale],
    }));

    showToast(`Dívida manual de ${formatCurrency(amount)} lançada para ${customer.name}!`);
  };

  // Handlers for Debt Payment (Marcar Pago / Quita Tudo)
  const handlePayDebt = (debtId: string, amount: number, method: 'pix' | 'dinheiro' | 'cartao' | 'outro') => {
    const debt = data.debts.find((d) => d.id === debtId);
    if (!debt) return;

    const nowIso = new Date().toISOString();
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      tournamentId: debt.tournamentId,
      customerId: debt.customerId,
      customerName: debt.customerName,
      debtId: debt.id,
      amount,
      method,
      createdAt: nowIso,
      notes: `Quitação de fiado: ${debt.description}`,
      isReversed: false,
    };

    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === debtId
          ? {
              ...d,
              paidAmount: d.amount,
              status: 'paid' as const,
              paidAt: nowIso,
            }
          : d
      ),
      payments: [...prev.payments, newPayment],
    }));

    showToast(`Fiado de ${formatCurrency(amount)} quitado com sucesso via ${method.toUpperCase()}!`);
  };

  // Handlers for Payment Reversal (Estorno)
  const handleReversePayment = (paymentId: string, reason: string) => {
    const payment = data.payments.find((p) => p.id === paymentId);
    if (!payment || payment.isReversed) return;

    const nowIso = new Date().toISOString();

    setData((prev) => {
      // Re-open debt if this payment was linked to a debt
      const updatedDebts = prev.debts.map((d) => {
        if (d.id === payment.debtId) {
          return {
            ...d,
            paidAmount: Math.max(0, (d.paidAmount || d.amount) - payment.amount),
            status: 'pending' as const,
            paidAt: undefined,
          };
        }
        return d;
      });

      // Update payment record
      const updatedPayments = prev.payments.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            isReversed: true,
            reversedAt: nowIso,
            reversedReason: reason,
          };
        }
        return p;
      });

      return {
        ...prev,
        debts: updatedDebts,
        payments: updatedPayments,
      };
    });

    showToast(`Pagamento de ${formatCurrency(payment.amount)} estornado! Dívida reaberta.`);
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));

    showToast(`Despesa de ${formatCurrency(expense.amount)} lançada!`);
  };

  const handleDeleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
    showToast('Despesa removida.');
  };

  // Handlers for Customers
  const handleSaveCustomer = (customer: Customer) => {
    setData((prev) => {
      const exists = prev.customers.some((c) => c.id === customer.id);
      return {
        ...prev,
        customers: exists
          ? prev.customers.map((c) => (c.id === customer.id ? customer : c))
          : [...prev.customers, customer],
      };
    });
    showToast(`Cliente "${customer.name}" salvo com sucesso!`);
  };

  const handleDeleteCustomer = (id: string) => {
    setData((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
    }));
    showToast('Cliente removido.');
  };

  // Handlers for Products
  const handleSaveProduct = (product: Product) => {
    setData((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [...prev.products, product],
      };
    });
    showToast(`Produto "${product.name}" salvo!`);
  };

  const handleDeleteProduct = (id: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
    showToast('Produto removido.');
  };

  // Settings & Backup
  const handleSaveSettings = (settings: AppSettings) => {
    setData((prev) => ({ ...prev, settings }));
    showToast('Configurações salvas!');
  };

  const handleImportData = (imported: AppData) => {
    setData(imported);
    saveAppData(imported);
    showToast('Backup JSON restaurado com sucesso!');
  };

  const handleResetData = () => {
    const reset = resetAppData();
    setData(reset);
    showToast('Dados restaurados para demonstração inicial!');
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-emerald-950">
      {/* Top Navigation Bar with Tournament Selector & 10 Tabs */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tournaments={data.tournaments}
        activeTournament={activeTournament}
        onSelectTournament={handleSelectTournament}
        overdueDebtsCount={overdueCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 pb-20">
        {currentTab === 'painel' && (
          <PainelTab
            data={data}
            setCurrentTab={setCurrentTab}
            onOpenManualDebtModal={() => setShowManualDebtModal(true)}
            onOpenExpenseModal={() => setCurrentTab('compras')}
          />
        )}

        {currentTab === 'comanda' && (
          <ComandaTab
            data={data}
            onSaveSale={handleSaveSale}
            onOpenNewCustomerModal={() => setShowQuickCustomerModal(true)}
          />
        )}

        {currentTab === 'fiados' && (
          <FiadosTab
            data={data}
            onOpenManualDebtModal={() => setShowManualDebtModal(true)}
            onPayDebt={handlePayDebt}
          />
        )}

        {currentTab === 'lucro' && (
          <LucroTab data={data} />
        )}

        {currentTab === 'compras' && (
          <ComprasTab
            data={data}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenComandaWithCustomItem={() => setCurrentTab('comanda')}
          />
        )}

        {currentTab === 'pagamentos' && (
          <PagamentosTab
            data={data}
            onReversePayment={handleReversePayment}
          />
        )}

        {currentTab === 'clientes' && (
          <ClientesTab
            data={data}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onOpenComandaForCustomer={(customerId) => {
              setCurrentTab('comanda');
            }}
          />
        )}

        {currentTab === 'produtos' && (
          <ProdutosTab
            data={data}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'copas' && (
          <CopasTab
            data={data}
            onSelectTournament={handleSelectTournament}
            onSaveTournament={handleSaveTournament}
            onDeleteTournament={handleDeleteTournament}
          />
        )}

        {currentTab === 'config' && (
          <ConfigTab
            data={data}
            onSaveSettings={handleSaveSettings}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile thumb-friendly reach */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        overdueCount={overdueCount}
      />

      {/* Manual Debt Modal */}
      {showManualDebtModal && (
        <ManualDebtModal
          customers={data.customers}
          activeTournamentName={activeTournament?.name || 'Campeonato Ativo'}
          onClose={() => setShowManualDebtModal(false)}
          onSubmit={handleSaveManualDebt}
          onOpenNewCustomer={() => {
            setShowManualDebtModal(false);
            setShowQuickCustomerModal(true);
          }}
        />
      )}

      {/* Quick Customer Modal */}
      {showQuickCustomerModal && (
        <QuickCustomerModal
          onClose={() => setShowQuickCustomerModal(false)}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black text-xs sm:text-sm shadow-2xl border border-amber-300 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center justify-between gap-2">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg bg-emerald-950/20 text-emerald-950 hover:bg-emerald-950/30 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
