import React, { useState } from 'react';
import { PlusCircle, FileText, Calendar, DollarSign, UserPlus } from 'lucide-react';
import { Customer } from '../types';

interface ManualDebtModalProps {
  customers: Customer[];
  activeTournamentName: string;
  onClose: () => void;
  onSubmit: (customerId: string, description: string, amount: number) => void;
  onOpenNewCustomer: () => void;
}

export const ManualDebtModal: React.FC<ManualDebtModalProps> = ({
  customers,
  activeTournamentName,
  onClose,
  onSubmit,
  onOpenNewCustomer,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!selectedCustomerId) {
      alert('Selecione um cliente!');
      return;
    }
    if (!description.trim() || isNaN(val) || val <= 0) {
      alert('Informe uma descrição e um valor válido.');
      return;
    }

    onSubmit(selectedCustomerId, description.trim(), val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400 text-emerald-950 font-black">
              📝
            </span>
            <div>
              <h3 className="font-black text-white text-base">
                Lançar Dívida Manual (Sem Produto)
              </h3>
              <p className="text-[11px] text-emerald-300">
                {activeTournamentName} • Vencimento automático em 7 dias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center justify-between">
              <span>Boleiro / Devedor *</span>
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> + Novo
              </button>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="" disabled>Selecione o Cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} {c.team ? `(${c.team})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              Motivo / Descrição da Dívida *
            </label>
            <input
              type="text"
              placeholder="Ex: Aposta do clássico, Rateio churrasco, Camisa do time..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              Valor da Dívida (R$) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0.50"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-emerald-950 border border-amber-500 rounded-xl px-3 py-2 text-base font-black text-amber-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              O vencimento será fixado para 7 dias a partir de hoje. Se não for pago até lá, aparecerá como <strong>Vencido</strong> com alerta vermelho.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
            >
              Lançar na Caderneta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
