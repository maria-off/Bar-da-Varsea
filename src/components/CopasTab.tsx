import React, { useState } from 'react';
import { 
  Trophy, 
  PlusCircle, 
  CheckCircle, 
  Archive, 
  Trash2, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Wallet,
  Receipt,
  FileText
} from 'lucide-react';
import { AppData, Tournament } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';

interface CopasTabProps {
  data: AppData;
  onSelectTournament: (id: string) => void;
  onSaveTournament: (tournament: Tournament) => void;
  onDeleteTournament: (id: string) => void;
}

export const CopasTab: React.FC<CopasTabProps> = ({
  data,
  onSelectTournament,
  onSaveTournament,
  onDeleteTournament,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do campeonato!');
      return;
    }

    const newTour: Tournament = {
      id: `copa-${Date.now()}`,
      name: name.trim().startsWith('🏆') || name.trim().startsWith('⚽') ? name.trim() : `🏆 ${name.trim()}`,
      date: date || new Date().toISOString().split('T')[0],
      location: location.trim() || 'Campo de Várzea',
      notes: notes.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    onSaveTournament(newTour);
    onSelectTournament(newTour.id); // Switch active automatically

    setName('');
    setLocation('');
    setNotes('');
    setShowAddModal(false);
  };

  // Helper to compute isolated stats for a tournament
  const getTournamentStats = (tournamentId: string) => {
    const tSales = data.sales.filter((s) => s.tournamentId === tournamentId);
    const tDebts = data.debts.filter((d) => d.tournamentId === tournamentId);
    const tPayments = data.payments.filter((p) => p.tournamentId === tournamentId && !p.isReversed);
    const tExpenses = data.expenses.filter((e) => e.tournamentId === tournamentId);

    const aVista = tSales.filter((s) => s.paymentType === 'cash').reduce((sum, s) => sum + s.total, 0);
    const fiadoTotal = tSales.filter((s) => s.paymentType === 'fiado').reduce((sum, s) => sum + s.total, 0) +
      tDebts.filter((d) => !d.saleId).reduce((sum, d) => sum + d.amount, 0);
    const totalVendas = aVista + fiadoTotal;
    const fiadoPago = tPayments.reduce((sum, p) => sum + p.amount, 0);
    const despesas = tExpenses.reduce((sum, e) => sum + e.amount, 0);

    const caixa = aVista + fiadoPago - despesas;
    const lucro = totalVendas - despesas;
    const pendente = tDebts.filter((d) => d.status === 'pending').reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

    return { totalVendas, caixa, despesas, lucro, pendente, salesCount: tSales.length };
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Gestão de Campeonatos & Copas
            </h2>
            <p className="text-xs text-emerald-300">
              Dados 100% isolados por campeonato (vendas, caixa, fiados e lucro)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Criar Novo Campeonato</span>
        </button>
      </div>

      {/* Tournaments List */}
      <div className="space-y-3">
        {data.tournaments.map((tour) => {
          const isActive = tour.id === data.activeTournamentId;
          const stats = getTournamentStats(tour.id);

          return (
            <div
              key={tour.id}
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-lg ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-950 border-amber-400 ring-2 ring-amber-400/40'
                  : 'bg-emerald-900/70 border-emerald-700/60 hover:border-emerald-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {tour.name}
                    </h3>
                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 flex items-center gap-1 shadow">
                        <CheckCircle className="w-3 h-3" />
                        COPA ATIVA
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectTournament(tour.id)}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-emerald-600 transition"
                      >
                        Ativar esta Copa
                      </button>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tour.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {tour.status === 'active' ? 'Em Andamento' : 'Finalizada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-emerald-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {tour.date ? new Date(tour.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data não informada'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {tour.location || 'Campo de Várzea'}
                    </span>
                  </div>
                  {tour.notes && (
                    <p className="text-[11px] text-emerald-400 mt-1">
                      {tour.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => onSelectTournament(tour.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
                    >
                      Selecionar
                    </button>
                  )}

                  {data.tournaments.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir permanentemente o campeonato "${tour.name}" e todos os seus dados isolados?`)) {
                          onDeleteTournament(tour.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-400 transition"
                      title="Excluir campeonato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tournament Isolated Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                    Vendas Totais
                  </div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">
                    {formatCurrency(stats.totalVendas)}
                  </div>
                  <div className="text-[10px] text-emerald-300/80">
                    {stats.salesCount} comandas
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs">
                  <div className="text-[10px] text-amber-300 uppercase font-bold">
                    Caixa Real
                  </div>
                  <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">
                    {formatCurrency(stats.caixa)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Em mão
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs">
                  <div className="text-[10px] text-rose-300 uppercase font-semibold">
                    Despesas
                  </div>
                  <div className="text-sm sm:text-base font-black text-rose-300 mt-0.5">
                    {formatCurrency(stats.despesas)}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Custos
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs">
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">
                    Lucro da Copa
                  </div>
                  <div className={`text-sm sm:text-base font-black mt-0.5 ${stats.lucro >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                    {formatCurrency(stats.lucro)}
                  </div>
                  <div className="text-[10px] text-emerald-300/80">
                    Líquido
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar Novo Campeonato */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">
                  Novo Campeonato de Domingo
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Nome do Campeonato / Torneio *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 🏆 Torneio do Pique 2026, Copa dos Campeões..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Data Principal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Local / Campo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Campo do Terrão"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Anotações / Regulamento
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: 8 times inscritos, jogos eliminatórios das 9h às 17h..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
                >
                  Criar e Ativar Copa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
