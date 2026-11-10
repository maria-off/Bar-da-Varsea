import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search, 
  Phone, 
  MessageSquare, 
  Receipt,
  ExternalLink
} from 'lucide-react';
import { AppData, Customer } from '../types';
import { formatCurrency, cleanPhone } from '../utils/storage';

interface ClientesTabProps {
  data: AppData;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onOpenComandaForCustomer: (customerId: string) => void;
}

const EMOJI_OPTIONS = ['⚽', '🍺', '🧤', '🏃‍♂️', '🥩', '⚡', '🟨', '🧢', '🥇', '👑', '🎯', '🔥', '🍻', '🥃', '🌭', '🍗'];

export const ClientesTab: React.FC<ClientesTabProps> = ({
  data,
  onSaveCustomer,
  onDeleteCustomer,
  onOpenComandaForCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');
  const [emoji, setEmoji] = useState('⚽');

  const activeTourId = data.activeTournamentId;

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setTeam('');
    setEmoji('⚽');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setTeam(c.team || '');
    setEmoji(c.emoji || '⚽');
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do cliente!');
      return;
    }

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : `c-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone(phone),
      team: team.trim() || undefined,
      emoji: emoji || '⚽',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(customerToSave);
    setShowModal(false);
  };

  // Debt per customer in active tournament
  const getCustomerDebt = (customerId: string) => {
    return data.debts
      .filter((d) => d.tournamentId === activeTourId && d.customerId === customerId && d.status === 'pending')
      .reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);
  };

  const filteredCustomers = data.customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.team && c.team.toLowerCase().includes(q)) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Cadastro de Clientes
            </h2>
            <p className="text-xs text-emerald-300">
              Jogadores, juízes, torcedores e comissão organizadora
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Buscar por nome, apelido, time ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-2xl bg-emerald-900/40 border border-emerald-800 text-emerald-300 text-xs">
            Nenhum cliente encontrado.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const currentDebt = getCustomerDebt(cust.id);
            const waNumber = cust.phone.length <= 11 ? `55${cust.phone}` : cust.phone;

            return (
              <div
                key={cust.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900/70 border border-emerald-700/70 hover:border-emerald-600 transition shadow flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {cust.emoji || '⚽'}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm sm:text-base truncate flex items-center gap-1.5">
                      <span>{cust.name}</span>
                    </div>

                    <div className="text-xs text-emerald-300 truncate">
                      {cust.team ? `⚽ ${cust.team}` : 'Jogador / Torcedor'}
                    </div>

                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{cust.phone || 'Sem telefone'}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Debt Badge & Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {currentDebt > 0 ? (
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-amber-300">
                        Fiado Nesta Copa
                      </div>
                      <div className="text-sm sm:text-base font-black text-amber-400">
                        {formatCurrency(currentDebt)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                      Sem fiados
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {cust.phone && (
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition shadow"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      </a>
                    )}

                    <button
                      onClick={() => onOpenComandaForCustomer(cust.id)}
                      className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold transition shadow"
                      title="Abrir Comanda para este cliente"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 transition"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Excluir cadastro de "${cust.name}"?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 transition"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h3 className="font-black text-white text-base">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente do Bar'}
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
                  Nome / Apelido do Boleiro *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Paulinho Camisa 9, Zé do Pito..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  WhatsApp / Celular com DDD (Apenas números)
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 11987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-emerald-400">Usado para cobrança rápida no WhatsApp</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Time de Futebol / Categoria
                </label>
                <input
                  type="text"
                  placeholder="Ex: Unidos do Morro FC, Torcida, Juiz..."
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Emoji Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1.5">
                  Ícone / Emoji do Perfil
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                        emoji === em
                          ? 'bg-amber-400 text-emerald-950 scale-110 shadow-md ring-2 ring-amber-300'
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
                  {editingCustomer ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
