import React from 'react';
import { 
  Trophy, 
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  Receipt, 
  FileSpreadsheet, 
  CreditCard, 
  Users, 
  Package, 
  Settings, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { TabType, Tournament } from '../types';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  tournaments: Tournament[];
  activeTournament: Tournament | undefined;
  onSelectTournament: (id: string) => void;
  overdueDebtsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  tournaments,
  activeTournament,
  onSelectTournament,
  overdueDebtsCount,
}) => {
  const [showTournamentModal, setShowTournamentModal] = React.useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'painel', label: 'Painel', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'comanda', label: 'Comanda', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'fiados', label: 'Fiados', icon: <Receipt className="w-4 h-4" />, badge: overdueDebtsCount },
    { id: 'lucro', label: 'Lucro', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'compras', label: 'Compras', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'clientes', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="w-4 h-4" /> },
    { id: 'copas', label: 'Copas', icon: <Trophy className="w-4 h-4" /> },
    { id: 'config', label: 'Config', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/80 shadow-lg">
      {/* Top Header with App Title & Active Tournament Switcher */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-black shadow-md border border-amber-300">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1">
                  BAR DA <span className="text-amber-400">VÁRZEA</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  DOMINGO
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-medium hidden sm:block">
                Gestão de Vendas, Comandas & Fiados
              </p>
            </div>
          </div>

          {/* Active Tournament Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowTournamentModal(!showTournamentModal)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-900/90 hover:bg-emerald-800/90 border border-emerald-700/80 text-left transition shadow-inner"
              title="Trocar Campeonato Ativo"
            >
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="max-w-[140px] sm:max-w-[200px] truncate">
                <div className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider leading-none">
                  Copa Ativa
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                  {activeTournament?.name || 'Selecione uma Copa'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showTournamentModal && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
                  onClick={() => setShowTournamentModal(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-emerald-900 border border-emerald-700/90 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-xs font-bold text-emerald-300 px-2 py-1 uppercase tracking-wider flex items-center justify-between border-b border-emerald-800 pb-2 mb-1">
                    <span>Selecionar Campeonato</span>
                    <button 
                      onClick={() => { setShowTournamentModal(false); setCurrentTab('copas'); }}
                      className="text-[11px] text-amber-400 hover:underline font-semibold"
                    >
                      Gerenciar
                    </button>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                    {tournaments.map((tour) => {
                      const isActive = tour.id === activeTournament?.id;
                      return (
                        <button
                          key={tour.id}
                          onClick={() => {
                            onSelectTournament(tour.id);
                            setShowTournamentModal(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                            isActive
                              ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                              : 'text-emerald-100 hover:bg-emerald-800/80'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{tour.name}</div>
                            <div className={`text-[10px] ${isActive ? 'text-emerald-900' : 'text-emerald-400'}`}>
                              {tour.location || 'Campo de Várzea'}
                            </div>
                          </div>
                          {isActive && <span className="text-xs shrink-0">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setShowTournamentModal(false);
                      setCurrentTab('copas');
                    }}
                    className="mt-2 w-full py-1.5 text-center text-xs font-bold text-amber-300 bg-emerald-950/80 hover:bg-emerald-950 rounded-lg border border-amber-400/30 transition flex items-center justify-center gap-1"
                  >
                    <span>+ Nova Copa / Campeonato</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs Bar (All 10 Tabs Accessible at any time) */}
      <nav className="border-t border-emerald-900/90 bg-emerald-950/70">
        <div className="max-w-7xl mx-auto px-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center space-x-1 min-w-max">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-md font-extrabold'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                      <AlertCircle className="w-2.5 h-2.5" />
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
