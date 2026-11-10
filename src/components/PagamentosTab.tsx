import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Calendar, 
  Filter 
} from 'lucide-react';
import { AppData, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';

interface PagamentosTabProps {
  data: AppData;
  onReversePayment: (paymentId: string, reason: string) => void;
}

export const PagamentosTab: React.FC<PagamentosTabProps> = ({
  data,
  onReversePayment,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'reversed'>('all');
  const [reversingPayment, setReversingPayment] = useState<Payment | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const activeTourId = data.activeTournamentId;
  const tournamentPayments = data.payments.filter((p) => p.tournamentId === activeTourId);

  const filteredPayments = tournamentPayments.filter((p) => {
    const matchesSearch = 
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterType === 'active') return !p.isReversed;
    if (filterType === 'reversed') return p.isReversed;
    return true;
  });

  const totalValidReceived = tournamentPayments
    .filter((p) => !p.isReversed)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReversed = tournamentPayments
    .filter((p) => p.isReversed)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingPayment) return;
    onReversePayment(reversingPayment.id, reverseReason.trim() || 'Estorno solicitado pelo operador do bar');
    setReversingPayment(null);
    setReverseReason('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Histórico de Pagamentos & Recebimentos
            </h2>
            <p className="text-xs text-emerald-300">
              Registros de recebimentos de fiados com opção de estorno seguro
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-900/70 border border-emerald-700/70 shadow">
          <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
            Total Efetivado no Caixa
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
            {formatCurrency(totalValidReceived)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {tournamentPayments.filter((p) => !p.isReversed).length} pagamentos ativos
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-900/70 border border-rose-800/60 shadow">
          <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
            Total Estornado
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
            {formatCurrency(totalReversed)}
          </div>
          <div className="text-[10px] text-rose-300/80 mt-0.5">
            {tournamentPayments.filter((p) => p.isReversed).length} estornos efetuados
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente ou observações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-amber-400 text-emerald-950 font-black'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Todos ({tournamentPayments.length})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'active'
                ? 'bg-emerald-500 text-emerald-950 font-black'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            Válidos
          </button>
          <button
            onClick={() => setFilterType('reversed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              filterType === 'reversed'
                ? 'bg-rose-600 text-white font-black'
                : 'bg-emerald-900/80 text-rose-300 hover:bg-emerald-800'
            }`}
          >
            Estornados
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-2.5">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs">
            Nenhum pagamento registrado nesta copa até o momento.
          </div>
        ) : (
          filteredPayments.slice().reverse().map((pay) => (
            <div
              key={pay.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                pay.isReversed
                  ? 'bg-rose-950/30 border-rose-800/60 opacity-80'
                  : 'bg-emerald-900/70 border-emerald-700/70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-white text-sm sm:text-base">
                    {pay.customerName}
                  </span>

                  {pay.isReversed ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600/30 text-rose-300 border border-rose-600/50 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      ESTORNADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      EFETIVADO NO CAIXA
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-950 text-amber-300 border border-emerald-800">
                    {pay.method === 'pix' ? '📱 PIX' : pay.method === 'dinheiro' ? '💵 Dinheiro' : '💳 Cartão'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(pay.createdAt)}
                  </span>
                  {pay.notes && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-200">{pay.notes}</span>
                    </>
                  )}
                </div>

                {pay.isReversed && pay.reversedReason && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-900/60 mt-1">
                    <span className="font-bold">Motivo do Estorno:</span> {pay.reversedReason} ({formatDate(pay.reversedAt || '')})
                  </div>
                )}
              </div>

              {/* Amount and Estorno Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-800">
                <div className="text-left sm:text-right">
                  <div className={`text-lg sm:text-xl font-black ${pay.isReversed ? 'text-rose-400 line-through' : 'text-emerald-300'}`}>
                    {formatCurrency(pay.amount)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    {pay.isReversed ? 'Estornado' : 'Recebido'}
                  </div>
                </div>

                {!pay.isReversed && (
                  <button
                    onClick={() => setReversingPayment(pay)}
                    className="px-3 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-bold text-xs border border-rose-700/80 transition flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Estornar pagamento (reabre a dívida no fiado)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Estornar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Confirm Estorno */}
      {reversingPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-400 pb-3 border-b border-emerald-800">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <h3 className="font-black text-white text-base">
                Estornar Pagamento
              </h3>
            </div>

            <form onSubmit={handleConfirmReversal} className="space-y-3.5 mt-3">
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-xs space-y-1">
                <div>
                  <span className="text-emerald-400 font-bold">Cliente:</span> {reversingPayment.customerName}
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">Valor:</span>{' '}
                  <span className="text-amber-300 font-black">{formatCurrency(reversingPayment.amount)}</span>
                </div>
                <div className="text-rose-300 pt-1 font-semibold">
                  ⚠️ Ao estornar, o valor será subtraído do Caixa e a dívida do cliente será reaberta na caderneta de fiados.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Motivo do Estorno (Obrigatório) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lançamento em duplicidade, valor incorreto..."
                  value={reverseReason}
                  onChange={(e) => setReverseReason(e.target.value)}
                  required
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReversingPayment(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirmar Estorno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
