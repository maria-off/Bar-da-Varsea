import React, { useState } from 'react';
import { 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  DollarSign, 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppData, Debt, Tournament } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatShortDate, 
  checkDebtDueDate, 
  buildWhatsAppLink 
} from '../utils/storage';

interface FiadosTabProps {
  data: AppData;
  onOpenManualDebtModal: () => void;
  onPayDebt: (debtId: string, amount: number, method: 'pix' | 'dinheiro' | 'cartao' | 'outro') => void;
}

export const FiadosTab: React.FC<FiadosTabProps> = ({
  data,
  onOpenManualDebtModal,
  onPayDebt,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'pending' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao' | 'outro'>('pix');

  const activeTourId = data.activeTournamentId;
  const currentTour = data.tournaments.find((t) => t.id === activeTourId);

  // Debts of active tournament
  const tournamentDebts = data.debts.filter((d) => d.tournamentId === activeTourId);

  // Apply filters
  const filteredDebts = tournamentDebts.filter((debt) => {
    // Search
    const matchesSearch = 
      debt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      debt.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const dueStatus = checkDebtDueDate(debt.dueDate);

    if (filterStatus === 'overdue') {
      return debt.status === 'pending' && dueStatus.isOverdue;
    }
    if (filterStatus === 'pending') {
      return debt.status === 'pending' && !dueStatus.isOverdue;
    }
    if (filterStatus === 'paid') {
      return debt.status === 'paid';
    }
    return true; // 'all'
  });

  // Calculate totals
  const totalDebtsAmount = tournamentDebts
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const overdueCount = tournamentDebts
    .filter((d) => d.status === 'pending' && checkDebtDueDate(d.dueDate).isOverdue).length;

  const handleConfirmPayment = () => {
    if (!payingDebt) return;
    const remaining = payingDebt.amount - (payingDebt.paidAmount || 0);
    onPayDebt(payingDebt.id, remaining, paymentMethod);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    setPayingDebt(null);
  };

  const getCustomerPhone = (customerId: string) => {
    const cust = data.customers.find((c) => c.id === customerId);
    return cust?.phone || '';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header with Title & Action Button */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Caderneta de Fiados
              </h2>
              <p className="text-xs text-emerald-300">
                Vencimento em 7 dias com alerta e cobrança via WhatsApp
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualDebtModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Lançar Dívida Manual</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60 shadow">
          <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Total em Aberto
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-400 mt-0.5">
            {formatCurrency(totalDebtsAmount)}
          </div>
          <div className="text-[10px] text-emerald-400">
            Nesta Copa ({tournamentDebts.filter((d) => d.status === 'pending').length} notas)
          </div>
        </div>

        <div className={`p-3 rounded-xl border shadow ${
          overdueCount > 0 
            ? 'bg-rose-950/70 border-rose-600/80 animate-overdue' 
            : 'bg-emerald-900/60 border-emerald-700/60'
        }`}>
          <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Vencidos (&gt; 7 dias)</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-400 mt-0.5">
            {overdueCount} {overdueCount === 1 ? 'cliente' : 'clientes'}
          </div>
          <div className="text-[10px] text-rose-200">
            {overdueCount > 0 ? 'Cobrança prioritária!' : 'Nenhum vencido'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60 shadow">
          <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Quitados
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-300 mt-0.5">
            {tournamentDebts.filter((d) => d.status === 'paid').length} baixas
          </div>
          <div className="text-[10px] text-emerald-400">
            Histórico preservado
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              filterStatus === 'all'
                ? 'bg-amber-400 text-emerald-950 shadow font-black'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Todos ({tournamentDebts.length})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
              filterStatus === 'overdue'
                ? 'bg-rose-600 text-white shadow font-black'
                : 'bg-emerald-900/80 text-rose-300 hover:bg-emerald-800'
            }`}
          >
            <span>⚠️ Vencidos ({overdueCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              filterStatus === 'pending'
                ? 'bg-emerald-500 text-emerald-950 shadow font-black'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            A Vencer
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              filterStatus === 'paid'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Quitados
          </button>
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-2.5">
        {filteredDebts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs">
            Nenhum fiado encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const dueStatus = checkDebtDueDate(debt.dueDate);
            const phone = getCustomerPhone(debt.customerId);
            const remaining = debt.amount - (debt.paidAmount || 0);
            const isPaid = debt.status === 'paid' || remaining <= 0;

            const waLink = buildWhatsAppLink(
              phone,
              debt.customerName,
              currentTour?.name || 'Copa do Terrão',
              remaining,
              dueStatus.text,
              data.settings.whatsappMessageTemplate,
              data.settings.pixKey
            );

            return (
              <div
                key={debt.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPaid
                    ? 'bg-emerald-950/40 border-emerald-900/80 opacity-70'
                    : dueStatus.isOverdue
                    ? 'bg-gradient-to-r from-rose-950/70 to-emerald-950/90 border-rose-600/90 shadow-rose-950/50'
                    : 'bg-emerald-900/70 border-emerald-700/70'
                }`}
              >
                {/* Left: Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white text-sm sm:text-base">
                      {debt.customerName}
                    </span>

                    {/* Status Badge */}
                    {isPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        QUITADO
                      </span>
                    ) : dueStatus.isOverdue ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        {dueStatus.text.toUpperCase()}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dueStatus.text}
                      </span>
                    )}

                    {debt.saleId === undefined && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Dívida Manual
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-emerald-200/90 line-clamp-2">
                    {debt.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Lançado: {formatShortDate(debt.createdAt)}
                    </span>
                    <span>•</span>
                    <span>Vencimento: {formatShortDate(debt.dueDate)}</span>
                    {phone && (
                      <>
                        <span>•</span>
                        <span>Tel: {phone}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">
                      {isPaid ? 'Valor Quitado' : 'Saldo Devedor'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-amber-400">
                      {formatCurrency(isPaid ? debt.amount : remaining)}
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="flex items-center gap-1.5">
                      {/* WhatsApp Button */}
                      {phone ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                          title="Cobrar pelo WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-white" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(`Cliente "${debt.customerName}" não possui telefone cadastrado. Atualize o cadastro na aba Clientes.`)}
                          className="px-3 py-2 rounded-xl bg-emerald-950 text-emerald-500 font-bold text-xs border border-emerald-800 flex items-center gap-1.5"
                          title="Sem telefone"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sem Zap</span>
                        </button>
                      )}

                      {/* Marcar Pago (Quita Tudo) Button */}
                      <button
                        onClick={() => setPayingDebt(debt)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="Marcar como Pago (Quita Tudo)"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Marcar Pago</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Confirmation Modal (Quita Tudo) */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center pb-3 border-b border-emerald-800">
              <span className="text-4xl">💰</span>
              <h3 className="font-black text-white text-base mt-2">
                Quitar Fiado (Marcar Pago)
              </h3>
              <p className="text-xs text-emerald-300 mt-1">
                Cliente: <span className="font-bold text-white">{payingDebt.customerName}</span>
              </p>
            </div>

            <div className="my-4 p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-center">
              <div className="text-xs text-emerald-400 uppercase font-bold">
                Valor Total a Baixar
              </div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">
                {formatCurrency(payingDebt.amount - (payingDebt.paidAmount || 0))}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                {payingDebt.description}
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-1.5 mb-4">
              <label className="block text-xs font-bold text-emerald-300">
                Forma de Recebimento:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['pix', 'dinheiro', 'cartao'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                      paymentMethod === m
                        ? 'bg-amber-400 text-emerald-950 font-black shadow'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {m === 'pix' ? '📱 PIX' : m === 'dinheiro' ? '💵 Dinheiro' : '💳 Cartão'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPayingDebt(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800 hover:bg-emerald-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-emerald-950 text-xs font-black shadow-lg hover:from-emerald-400 hover:to-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Baixa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
