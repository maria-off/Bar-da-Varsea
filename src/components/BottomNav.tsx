import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  TrendingUp, 
  Menu, 
  X, 
  FileSpreadsheet, 
  CreditCard, 
  Users, 
  Package, 
  Trophy, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  overdueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  overdueCount,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: { id: TabType; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'comanda', label: 'Comanda', icon: <ShoppingBag className="w-5 h-5" />, isAction: true },
    { id: 'fiados', label: 'Fiados', icon: <Receipt className="w-5 h-5" /> },
    { id: 'lucro', label: 'Lucro', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const moreTabs: { id: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'compras', label: 'Compras & Custos', icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Despesas do campeonato' },
    { id: 'pagamentos', label: 'Pagamentos & Estorno', icon: <CreditCard className="w-5 h-5" />, desc: 'Histórico e reversões' },
    { id: 'clientes', label: 'Clientes', icon: <Users className="w-5 h-5" />, desc: 'Cadastro de boleiros' },
    { id: 'produtos', label: 'Produtos', icon: <Package className="w-5 h-5" />, desc: 'Cardápio e preços' },
    { id: 'copas', label: 'Copas', icon: <Trophy className="w-5 h-5" />, desc: 'Múltiplos campeonatos' },
    { id: 'config', label: 'Configurações', icon: <Settings className="w-5 h-5" />, desc: 'PIX, WhatsApp, backup' },
  ];

  return (
    <>
      {/* Mobile Bottom Fixed Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800 shadow-2xl px-2 py-1.5 flex items-center justify-around">
        {mainTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setShowMoreMenu(false);
                  setCurrentTab(tab.id);
                }}
                className="relative -top-3.5 p-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black shadow-xl ring-4 ring-emerald-950 active:scale-90 transition transform"
                title="Abrir Comanda"
              >
                <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                setShowMoreMenu(false);
                setCurrentTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold transition ${
                isActive ? 'text-amber-400 font-black' : 'text-emerald-300/70 hover:text-emerald-100'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'fiados' && overdueCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    !
                  </span>
                )}
              </div>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Toggle */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center p-1 rounded-lg text-[10px] font-bold transition ${
            showMoreMenu || moreTabs.some((t) => t.id === currentTab)
              ? 'text-amber-400 font-black'
              : 'text-emerald-300/70 hover:text-emerald-100'
          }`}
        >
          {showMoreMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="mt-0.5">Mais</span>
        </button>
      </nav>

      {/* More Menu Drawer / Sheet */}
      {showMoreMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="rounded-t-3xl bg-emerald-900 border-t-2 border-emerald-700 p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Todas as Abas do Bar
              </h4>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full bg-emerald-950 text-emerald-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              {moreTabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setShowMoreMenu(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950 font-black border-amber-300 shadow'
                        : 'bg-emerald-950/80 border-emerald-800 text-white hover:bg-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isActive ? 'text-emerald-950' : 'text-amber-400'}>
                        {tab.icon}
                      </span>
                      <span className="text-xs font-bold">{tab.label}</span>
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-emerald-900' : 'text-emerald-400'}`}>
                      {tab.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
