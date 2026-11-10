import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Tag 
} from 'lucide-react';
import { AppData, Product } from '../types';
import { formatCurrency } from '../utils/storage';

interface ProdutosTabProps {
  data: AppData;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const PRODUCT_EMOJIS = ['🍺', '🍻', '🍾', '🥩', '🍢', '🥟', '🥤', '🧃', '💧', '🧊', '🥃', '⚡', '🥪', '🍟', '🍫', '🚬'];

export const ProdutosTab: React.FC<ProdutosTabProps> = ({
  data,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState<Product['category']>('Cervejas');
  const [emoji, setEmoji] = useState('🍺');

  const categories: Product['category'][] = [
    'Cervejas',
    'Espetos',
    'Lanches',
    'Refrigerantes',
    'Doses',
    'Diversos',
  ];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCost('');
    setCategory('Cervejas');
    setEmoji('🍺');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setCost(p.cost.toString());
    setCategory(p.category);
    setEmoji(p.emoji);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedCost = parseFloat(cost.replace(',', '.')) || (parsedPrice * 0.5);

    if (!name.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Informe um nome e preço de venda válidos!');
      return;
    }

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `p-${Date.now()}`,
      name: name.trim(),
      price: parsedPrice,
      cost: parsedCost,
      category,
      emoji: emoji || '📦',
    };

    onSaveProduct(productToSave);
    setShowModal(false);
  };

  const filteredProducts = data.products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCat !== 'Todas' && p.category !== selectedCat) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Catálogo de Produtos & Bebidas
            </h2>
            <p className="text-xs text-emerald-300">
              Gestão de cardápio, preços de venda, custos e margem de lucro
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Cadastrar Produto</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['Todas', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedCat === cat
                  ? 'bg-amber-400 text-emerald-950 font-black shadow'
                  : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs">
            Nenhum produto cadastrado nesta categoria.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const margin = p.price - p.cost;
            const marginPct = p.price > 0 ? (margin / p.price) * 100 : 0;

            return (
              <div
                key={p.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900/70 border border-emerald-700/70 hover:border-emerald-600 transition shadow flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-3xl shrink-0 p-1 bg-emerald-950/70 rounded-xl border border-emerald-800">
                      {p.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate leading-snug">
                        {p.name}
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 transition"
                      title="Editar produto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o produto "${p.name}"?`)) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 transition"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-800/80 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                      Venda
                    </div>
                    <div className="text-base sm:text-lg font-black text-amber-300">
                      {formatCurrency(p.price)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400">
                      Custo: {formatCurrency(p.cost)}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-300">
                      Margem: {formatCurrency(margin)} ({marginPct.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h3 className="font-black text-white text-base">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-emerald-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Nome do Produto / Bebida *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Brahma Latão 473ml, Espeto de Cupim..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0.50"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-emerald-950 border border-amber-500 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="Ex: 3.50"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Product['category'])}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emoji selector */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                  Ícone / Emoji do Produto
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRODUCT_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                        emoji === em
                          ? 'bg-amber-400 text-emerald-950 scale-110 shadow ring-2 ring-amber-300'
                          : 'bg-emerald-950 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
