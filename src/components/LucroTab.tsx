import React, { useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  DollarSign, 
  Receipt, 
  TrendingDown, 
  Copy, 
  Check, 
  PieChart, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AppData } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';

interface LucroTabProps {
  data: AppData;
}

export const LucroTab: React.FC<LucroTabProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [saleFilter, setSaleFilter] = useState<'all' | 'cash' | 'fiado'>('all');

  const activeTourId = data.activeTournamentId;
  const currentTour = data.tournaments.find((t) => t.id === activeTourId);

  // Active tournament items
  const sales = data.sales.filter((s) => s.tournamentId === activeTourId);
  const debts = data.debts.filter((d) => d.tournamentId === activeTourId);
  const payments = data.payments.filter((p) => p.tournamentId === activeTourId && !p.isReversed);
  const expenses = data.expenses.filter((e) => e.tournamentId === activeTourId);

  // 1. À Vista
  const vendasAVista = sales
    .filter((s) => s.paymentType === 'cash')
    .reduce((sum, s) => sum + s.total, 0);

  // 2. Fiado
  const vendasFiado = sales
    .filter((s) => s.paymentType === 'fiado')
    .reduce((sum, s) => sum + s.total, 0) +
    debts.filter((d) => !d.saleId).reduce((sum, d) => sum + d.amount, 0);

  // 3. Vendas Totais = (à vista + fiado)
  const vendasTotais = vendasAVista + vendasFiado;

  // 4. Fiado Pago (pagamentos válidos recebidos)
  const fiadoPago = payments.reduce((sum, p) => sum + p.amount, 0);

  // 5. Fiado Pendente
  const fiadoPendente = debts
    .filter((d) => d.status === 'pending')
    .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  // 6. Despesas
  const totalDespesas = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 7. Custo das Mercadorias (CMV)
  const totalCustoMercadoria = sales.reduce((sum, s) => sum + (s.totalCost || 0), 0);

  // Formulas required by user:
  // Caixa = à vista + fiado pago − despesas
  const caixa = vendasAVista + fiadoPago - totalDespesas;

  // Lucro = (à vista + fiado) − despesas
  const lucro = (vendasAVista + vendasFiado) - totalDespesas;

  // Payments breakdown by method
  const payByPix = payments.filter((p) => p.method === 'pix').reduce((s, p) => s + p.amount, 0) +
    sales.filter((s) => s.paymentType === 'cash' && s.paymentMethod === 'pix').reduce((s, p) => s + p.total, 0);

  const payByDinheiro = payments.filter((p) => p.method === 'dinheiro').reduce((s, p) => s + p.amount, 0) +
    sales.filter((s) => s.paymentType === 'cash' && s.paymentMethod === 'dinheiro').reduce((s, p) => s + p.total, 0);

  const payByCartao = payments.filter((p) => p.method === 'cartao').reduce((s, p) => s + p.amount, 0) +
    sales.filter((s) => s.paymentType === 'cash' && s.paymentMethod === 'cartao').reduce((s, p) => s + p.total, 0);

  // Copy report to WhatsApp
  const handleCopyReport = () => {
    const reportText = `🏆 *RELATÓRIO FINANCEIRO - BAR DA VÁRZEA*
⚽ Campeonato: ${currentTour?.name || 'Copa do Terrão'}
📅 Data: ${new Date().toLocaleDateString('pt-BR')}

📊 *RESUMO DAS CONTAS:*
• Vendas Totais: ${formatCurrency(vendasTotais)}
  - À Vista: ${formatCurrency(vendasAVista)}
  - Fiado: ${formatCurrency(vendasFiado)}

💰 *CAIXA REAL:*
  (À vista + Fiado pago) - Despesas
  ${formatCurrency(vendasAVista)} + ${formatCurrency(fiadoPago)} - ${formatCurrency(totalDespesas)}
  = *${formatCurrency(caixa)}*

📈 *LUCRO DO CAMPEONATO:*
  (À vista + Fiado) - Despesas
  ${formatCurrency(vendasTotais)} - ${formatCurrency(totalDespesas)}
  = *${formatCurrency(lucro)}*

📋 *FIADOS:*
• Já Recebido: ${formatCurrency(fiadoPago)}
• Em Aberto: ${formatCurrency(fiadoPendente)}

💸 *DESPESAS DA COPA:*
• Total: ${formatCurrency(totalDespesas)}

🍻 _Bar da Várzea - Gestão de Domingo_`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredSales = sales.filter((s) => {
    if (saleFilter === 'cash') return s.paymentType === 'cash';
    if (saleFilter === 'fiado') return s.paymentType === 'fiado';
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Relatório Financeiro & Lucro
            </h2>
            <p className="text-xs text-emerald-300">
              Demonstrativo oficial de Caixa, Vendas, Despesas e Lucro Líquido
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyReport}
          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-amber-400/40 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copiado para o Zap!' : 'Copiar Relatório'}</span>
        </button>
      </div>

      {/* Main Official Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Caixa Equation Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-emerald-500/80 p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Cálculo Oficial do Caixa
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Dinheiro em Mão
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-amber-300 mb-2">
            {formatCurrency(caixa)}
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-mono space-y-1 text-emerald-200">
            <div className="text-[11px] font-sans font-bold text-emerald-400">
              Fórmula: Caixa = à vista + fiado pago − despesas
            </div>
            <div className="text-[11px]">
              {formatCurrency(vendasAVista)} (à vista) + {formatCurrency(fiadoPago)} (fiado pago) − {formatCurrency(totalDespesas)} (despesas)
            </div>
          </div>
        </div>

        {/* Lucro Equation Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-amber-400/80 p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Cálculo Oficial do Lucro
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Resultado Geral
            </span>
          </div>

          <div className={`text-2xl sm:text-3xl font-black mb-2 ${lucro >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {formatCurrency(lucro)}
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-mono space-y-1 text-emerald-200">
            <div className="text-[11px] font-sans font-bold text-amber-400">
              Fórmula: Lucro = (à vista + fiado) − despesas
            </div>
            <div className="text-[11px]">
              ({formatCurrency(vendasTotais)}) − {formatCurrency(totalDespesas)} (despesas)
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60">
          <div className="text-[10px] uppercase font-bold text-emerald-300">
            Vendas à Vista
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-1">
            {formatCurrency(vendasAVista)}
          </div>
          <div className="text-[10px] text-emerald-400">Recebido na hora</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60">
          <div className="text-[10px] uppercase font-bold text-amber-300">
            Fiado Gerado
          </div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
            {formatCurrency(vendasFiado)}
          </div>
          <div className="text-[10px] text-amber-200/80">Total a prazo</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60">
          <div className="text-[10px] uppercase font-bold text-emerald-300">
            Fiado Já Pago
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-300 mt-1">
            {formatCurrency(fiadoPago)}
          </div>
          <div className="text-[10px] text-emerald-400">Entrou no caixa</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-700/60">
          <div className="text-[10px] uppercase font-bold text-rose-300">
            Despesas Totais
          </div>
          <div className="text-base sm:text-lg font-black text-rose-300 mt-1">
            {formatCurrency(totalDespesas)}
          </div>
          <div className="text-[10px] text-rose-200/80">Custos operacionais</div>
        </div>
      </div>

      {/* Methods of Payment Distribution */}
      <div className="rounded-2xl bg-emerald-900/60 border border-emerald-700/70 p-4 shadow">
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>💳</span> Meios de Pagamento Efetivados (À Vista + Fiados Baixados)
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-center">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">📱 PIX</div>
            <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
              {formatCurrency(payByPix)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-center">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">💵 Dinheiro</div>
            <div className="text-sm sm:text-base font-black text-emerald-300 mt-0.5">
              {formatCurrency(payByDinheiro)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-center">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">💳 Cartão</div>
            <div className="text-sm sm:text-base font-black text-blue-300 mt-0.5">
              {formatCurrency(payByCartao)}
            </div>
          </div>
        </div>
      </div>

      {/* Sales History in this Tournament */}
      <div className="rounded-2xl bg-emerald-900/60 border border-emerald-700/70 p-4 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>📜</span> Extrato de Vendas desta Copa ({sales.length})
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSaleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${saleFilter === 'all' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-300'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setSaleFilter('cash')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${saleFilter === 'cash' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-300'}`}
            >
              À Vista
            </button>
            <button
              onClick={() => setSaleFilter('fiado')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${saleFilter === 'fiado' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-emerald-300'}`}
            >
              Fiados
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
          {filteredSales.length === 0 ? (
            <div className="text-center py-6 text-emerald-400 text-xs">
              Nenhuma venda encontrada para o filtro.
            </div>
          ) : (
            filteredSales.slice().reverse().map((sale) => (
              <div
                key={sale.id}
                className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{sale.paymentType === 'fiado' ? '📝' : '💵'}</span>
                    <span className="truncate">{sale.customerName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                      sale.paymentType === 'fiado' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {sale.paymentType === 'fiado' ? 'Fiado' : (sale.paymentMethod || 'À Vista')}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-300 truncate">
                    {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-amber-300">
                    {formatCurrency(sale.total)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {formatDate(sale.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
