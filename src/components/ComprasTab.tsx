import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Trash2, 
  TrendingDown, 
  Search, 
  Calendar, 
  Tag, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { AppData, Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';

interface ComprasTabProps {
  data: AppData;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onOpenComandaWithCustomItem: () => void;
}

export const ComprasTab: React.FC<ComprasTabProps> = ({
  data,
  onAddExpense,
  onDeleteExpense,
  onOpenComandaWithCustomItem,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('gelo_carvao');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const activeTourId = data.activeTournamentId;
  const currentTour = data.tournaments.find((t) => t.id === activeTourId);
  const tournamentExpenses = data.expenses.filter((e) => e.tournamentId === activeTourId);

  const categoryLabels: Record<Expense['category'], string> = {
    gelo_carvao: '🧊 Gelo & Carvão',
    bebidas_estoque: '🍺 Bebidas (Atacado)',
    carnes_alimentos: '🥩 Carnes & Insumos',
    arbitragem: '🟨 Arbitragem / Juiz',
    trofeus: '🏆 Troféus & Medalhas',
    limpeza: '🧹 Limpeza & Descartáveis',
    outros: '📦 Outros Custos',
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(val) || val <= 0) {
      alert('Informe uma descrição válida e um valor positivo.');
      return;
    }

    onAddExpense({
      tournamentId: activeTourId,
      description: description.trim(),
      amount: val,
      category,
    });

    setDescription('');
    setAmount('');
    setCategory('gelo_carvao');
    setShowAddModal(false);
  };

  const filteredExpenses = tournamentExpenses.filter((exp) => {
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategoryFilter !== 'all' && exp.category !== selectedCategoryFilter) return false;
    return true;
  });

  const totalExpenses = tournamentExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Compras & Despesas do Bar
            </h2>
            <p className="text-xs text-emerald-300">
              Controle de insumos, fardos, gelo, arbitragem e custos da copa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Lançar Compra / Despesa</span>
          </button>
        </div>
      </div>

      {/* Info Card: Despesas vs Venda com Valor Livre */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-950 to-emerald-900 p-3.5 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300">Precisa vender um item com preço livre?</span>
            <p className="text-emerald-300 text-[11px] mt-0.5">
              Na aba Comanda, use o botão "+ Valor Livre" para combos rápidos sem preço fixo.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenComandaWithCustomItem}
          className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-xs font-bold border border-emerald-700 shrink-0 self-start sm:self-center"
        >
          Ir para Comanda ➔
        </button>
      </div>

      {/* KPI Total */}
      <div className="p-4 rounded-xl bg-emerald-900/70 border border-emerald-700/60 shadow flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">
            Total de Despesas na Copa Atual
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300 mt-0.5">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Abatido diretamente do Caixa e do Lucro Líquido
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400">
          <TrendingDown className="w-8 h-8" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição da despesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-200 focus:outline-none focus:border-amber-400"
        >
          <option value="all">Todas as Categorias</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs">
            Nenhuma compra ou despesa registrada para os filtros selecionados.
          </div>
        ) : (
          filteredExpenses.slice().reverse().map((exp) => (
            <div
              key={exp.id}
              className="p-3.5 rounded-xl bg-emerald-900/70 border border-emerald-700/70 flex items-center justify-between text-xs transition hover:bg-emerald-850"
            >
              <div className="min-w-0 pr-3">
                <div className="font-bold text-white text-sm truncate">
                  {exp.description}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    {categoryLabels[exp.category] || exp.category}
                  </span>
                  <span className="text-emerald-400">
                    {formatDate(exp.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-black text-rose-300 text-sm sm:text-base">
                    - {formatCurrency(exp.amount)}
                  </div>
                  <div className="text-[10px] text-emerald-400">Saída</div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remover despesa "${exp.description}"?`)) {
                      onDeleteExpense(exp.id);
                    }
                  }}
                  className="p-2 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 transition"
                  title="Excluir despesa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Nova Despesa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <h3 className="font-black text-white text-base">
                  Lançar Compra / Despesa
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Descrição da Despesa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5 sacos de gelo, 2 fardos de carvão, taxa do juiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rose-300 mb-1">
                    Valor Total (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0.50"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-emerald-950 border border-rose-500 rounded-xl px-3 py-2 text-sm font-bold text-rose-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Expense['category'])}
                    className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  >
                    {Object.entries(categoryLabels).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow transition"
                >
                  Registrar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
