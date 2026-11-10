import React from 'react';
import { 
  DollarSign, 
  Wallet, 
  Receipt, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  FileText, 
  PlusCircle, 
  ArrowRight,
  Clock,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { AppData, TabType } from '../types';
import { formatCurrency, formatDate, checkDebtDueDate } from '../utils/storage';

interface PainelTabProps {
  data: AppData;
  setCurrentTab: (tab: TabType) => void;
  onOpenManualDebtModal: () => void;
  onOpenExpenseModal: () => void;
}

export const PainelTab: React.FC<PainelTabProps> = ({
  data,
  setCurrentTab,
  onOpenManualDebtModal,
  onOpenExpenseModal,
}) => {
  const activeTournamentId = data.activeTournamentId;
  const currentTour = data.tournaments.find((t) => t.id === activeTournamentId);

  // Filter sales, debts, payments, expenses for active tournament
  const tournamentSales = data.sales.filter((s) => s.tournamentId === activeTournamentId);
  const tournamentDebts = data.debts.filter((d) => d.tournamentId === activeTournamentId);
  const tournamentPayments = data.payments.filter((p) => p.tournamentId === activeTournamentId && !p.isReversed);
  const tournamentExpenses = data.expenses.filter((e) => e.tournamentId === activeTournamentId);

  // Financial calculations according to user specs:
  // Vendas à vista
  const vendasAVista = tournamentSales
    .filter((s) => s.paymentType === 'cash')
    .reduce((acc, curr) => acc + curr.total, 0);

  // Fiados gerados (total vendido a prazo)
  const vendasFiado = tournamentSales
    .filter((s) => s.paymentType === 'fiado')
    .reduce((acc, curr) => acc + curr.total, 0) + 
    // also include manual debts not tied to sales if any
    tournamentDebts
      .filter((d) => !d.saleId)
      .reduce((acc, curr) => acc + curr.amount, 0);

  // Vendas Totais
  const vendasTotais = vendasAVista + vendasFiado;

  // Fiados Pagos (pagamentos válidos recebidos)
  const fiadoPago = tournamentPayments.reduce((acc, curr) => acc + curr.amount, 0);

  // Total Despesas
  const totalDespesas = tournamentExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Formulas specified by user:
  // Caixa = à vista + fiado pago - despesas
  const caixa = vendasAVista + fiadoPago - totalDespesas;

  // Lucro = (à vista + fiado) - despesas
  const lucro = (vendasAVista + vendasFiado) - totalDespesas;

  // Fiados em aberto
  const pendingDebts = tournamentDebts.filter((d) => d.status === 'pending');
  const totalFiadosEmAberto = pendingDebts.reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  // Check overdue debts (> 7 days)
  const overdueDebts = pendingDebts.filter((d) => checkDebtDueDate(d.dueDate).isOverdue);

  return (
    <div className="space-y-4 pb-20">
      {/* Tournament Welcome & Date Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-4 border border-emerald-700/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-emerald-950 flex items-center gap-1 shadow-sm">
                ⚽ CAMPEONATO ATIVO
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                {currentTour?.date ? `Data: ${new Date(currentTour.date + 'T12:00:00').toLocaleDateString('pt-BR')}` : 'Futebol de Domingo'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {currentTour?.name || 'Copa do Terrão'}
            </h1>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {currentTour?.location || 'Campo de Várzea'} • {tournamentSales.length} comandas realizadas hoje
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('comanda')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            <span>ABRIR COMANDA (PDV)</span>
          </button>
        </div>

        {/* Subtle Pitch Grass Grid Watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl">🏆</span>
        </div>
      </div>

      {/* Overdue Debt Alert Banner */}
      {overdueDebts.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-rose-950/90 to-red-900/90 border-2 border-rose-600/80 p-3.5 shadow-lg flex items-start sm:items-center justify-between gap-3 animate-overdue">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>ALERTA DE FIADOS VENCIDOS!</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-black uppercase">
                  {overdueDebts.length} {overdueDebts.length === 1 ? 'pendência' : 'pendências'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-rose-200">
                Há {overdueDebts.length} fiado(s) com mais de 7 dias sem pagamento. Cobrança urgente recomendada!
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('fiados')}
            className="px-3 py-1.5 rounded-lg bg-white text-rose-900 text-xs font-black shadow hover:bg-rose-100 transition shrink-0 flex items-center gap-1"
          >
            <span>Ver Fiados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Card 1: Vendas Totais */}
        <div className="col-span-1 rounded-xl bg-emerald-900/70 border border-emerald-700/60 p-3 sm:p-4 shadow">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold mb-1">
            <span>Vendas Totais</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">
            {formatCurrency(vendasTotais)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 flex justify-between">
            <span>À vista: {formatCurrency(vendasAVista)}</span>
            <span>Fiado: {formatCurrency(vendasFiado)}</span>
          </div>
        </div>

        {/* Card 2: Em Caixa (Destaque Principal) */}
        <div className="col-span-1 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-900 border-2 border-amber-400/80 p-3 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold mb-1">
            <span className="flex items-center gap-1">
              <span>💰</span> Em Caixa
            </span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-300">
            {formatCurrency(caixa)}
          </div>
          <div className="text-[10px] text-amber-200/90 mt-1 font-medium truncate">
            (À vista + Fiado pago) − Desp.
          </div>
        </div>

        {/* Card 3: Fiados a Receber */}
        <div 
          onClick={() => setCurrentTab('fiados')}
          className="col-span-1 rounded-xl bg-emerald-900/70 border border-emerald-700/60 p-3 sm:p-4 shadow hover:border-amber-400/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold mb-1">
            <span>Fiados a Receber</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-400">
            {formatCurrency(totalFiadosEmAberto)}
          </div>
          <div className="text-[10px] text-emerald-300 mt-1 flex items-center justify-between">
            <span>{pendingDebts.length} pendentes</span>
            {overdueDebts.length > 0 && (
              <span className="text-rose-400 font-bold">{overdueDebts.length} vencidos!</span>
            )}
          </div>
        </div>

        {/* Card 4: Despesas Totais */}
        <div 
          onClick={() => setCurrentTab('compras')}
          className="col-span-1 rounded-xl bg-emerald-900/70 border border-emerald-700/60 p-3 sm:p-4 shadow hover:border-emerald-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold mb-1">
            <span>Despesas Copa</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-300">
            {formatCurrency(totalDespesas)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            {tournamentExpenses.length} compras / custos
          </div>
        </div>

        {/* Card 5: Lucro Líquido (Fórmula do usuário) */}
        <div 
          onClick={() => setCurrentTab('lucro')}
          className="col-span-2 lg:col-span-1 rounded-xl bg-gradient-to-br from-emerald-900 to-emerald-950 border border-amber-500/40 p-3 sm:p-4 shadow hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold mb-1">
            <span>Lucro Calculado</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${lucro >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {formatCurrency(lucro)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 truncate">
            (À vista + Fiado) − Despesas
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-3.5 shadow">
        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>⚡</span> Ações Rápidas do Bar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setCurrentTab('comanda')}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-700 transition active:scale-95"
          >
            <div className="w-7 h-7 rounded bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 font-black">
              🛒
            </div>
            <div className="text-left">
              <div>Nova Comanda</div>
              <div className="text-[10px] text-emerald-300 font-normal">Tocar e Vender</div>
            </div>
          </button>

          <button
            onClick={onOpenManualDebtModal}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-700 transition active:scale-95"
          >
            <div className="w-7 h-7 rounded bg-amber-500 text-emerald-950 flex items-center justify-center shrink-0 font-black">
              📝
            </div>
            <div className="text-left">
              <div>Dívida Manual</div>
              <div className="text-[10px] text-emerald-300 font-normal">Sem produto</div>
            </div>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-700 transition active:scale-95"
          >
            <div className="w-7 h-7 rounded bg-rose-500 text-white flex items-center justify-center shrink-0 font-black">
              💸
            </div>
            <div className="text-left">
              <div>Lançar Despesa</div>
              <div className="text-[10px] text-emerald-300 font-normal">Gelo, Carvão, etc.</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('fiados')}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-xs font-bold border border-emerald-700 transition active:scale-95"
          >
            <div className="w-7 h-7 rounded bg-green-500 text-white flex items-center justify-center shrink-0 font-black">
              💬
            </div>
            <div className="text-left">
              <div>Cobrar WhatsApp</div>
              <div className="text-[10px] text-emerald-300 font-normal">Caderneta Fiados</div>
            </div>
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Comandas vs Pending Fiados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Comandas */}
        <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>⏱️</span> Últimas Vendas da Copa
            </h3>
            <button
              onClick={() => setCurrentTab('lucro')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Ver todas
            </button>
          </div>

          {tournamentSales.length === 0 ? (
            <div className="text-center py-8 text-emerald-400 text-xs">
              Nenhuma venda registrada nesta copa ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {tournamentSales.slice(-4).reverse().map((sale) => (
                <div
                  key={sale.id}
                  className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">
                      {sale.paymentType === 'fiado' ? '📝' : '💵'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {sale.customerName}
                      </div>
                      <div className="text-[10px] text-emerald-300 truncate">
                        {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'Venda avulsa'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="font-black text-amber-300">
                      {formatCurrency(sale.total)}
                    </div>
                    <div className="text-[10px]">
                      {sale.paymentType === 'fiado' ? (
                        <span className="text-amber-400 font-semibold">Fiado</span>
                      ) : (
                        <span className="text-emerald-400 uppercase font-semibold">
                          À Vista ({sale.paymentMethod || 'Dinheiro'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Fiados Quick List */}
        <div className="rounded-xl bg-emerald-900/60 border border-emerald-800 p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>📋</span> Fiados Pendentes nesta Copa
            </h3>
            <button
              onClick={() => setCurrentTab('fiados')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Abrir Caderneta
            </button>
          </div>

          {pendingDebts.length === 0 ? (
            <div className="text-center py-8 text-emerald-400 text-xs flex flex-col items-center gap-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Nenhum fiado pendente! Todo mundo em dia.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDebts.slice(0, 4).map((debt) => {
                const dueStatus = checkDebtDueDate(debt.dueDate);
                return (
                  <div
                    key={debt.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                      dueStatus.isOverdue
                        ? 'bg-rose-950/50 border-rose-700/80'
                        : 'bg-emerald-950/60 border-emerald-800/80'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-white flex items-center gap-1 truncate">
                        <span>{debt.customerName}</span>
                        {dueStatus.isOverdue && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-600 text-white uppercase shrink-0">
                            Vencido
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-emerald-300 truncate">
                        {debt.description}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-amber-300">
                        {formatCurrency(debt.amount - (debt.paidAmount || 0))}
                      </div>
                      <div className={`text-[10px] font-semibold ${dueStatus.isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {dueStatus.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
