import React, { useState } from 'react';
import { Customer } from '../types';
import { cleanPhone } from '../utils/storage';

interface QuickCustomerModalProps {
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const EMOJIS = ['⚽', '🍺', '🧤', '🏃‍♂️', '🥩', '⚡', '🟨', '🧢', '🥇', '👑', '🎯', '🔥', '🍻', '🥃'];

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('');
  const [emoji, setEmoji] = useState('⚽');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do cliente!');
      return;
    }

    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      phone: cleanPhone(phone),
      team: team.trim() || undefined,
      emoji: emoji || '⚽',
      createdAt: new Date().toISOString(),
    };

    onSave(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
          <h3 className="font-black text-white text-base">
            Novo Cliente Rápido
          </h3>
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-3">
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              Nome / Apelido *
            </label>
            <input
              type="text"
              placeholder="Ex: Paulinho Lateral"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              WhatsApp (com DDD)
            </label>
            <input
              type="tel"
              placeholder="Ex: 11987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              Time (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Real Várzea FC"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              Emoji
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {EMOJIS.slice(0, 10).map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition ${
                    emoji === em ? 'bg-amber-400 text-emerald-950 scale-110 shadow' : 'bg-emerald-950 text-white'
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
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
