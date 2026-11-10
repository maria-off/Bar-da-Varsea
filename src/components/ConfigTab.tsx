import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Key, 
  MessageSquare, 
  Save, 
  Check, 
  Database,
  Trash2,
  FileCheck
} from 'lucide-react';
import { AppData, AppSettings } from '../types';
import { exportAppDataToJson, parseJsonFile } from '../utils/storage';

interface ConfigTabProps {
  data: AppData;
  onSaveSettings: (settings: AppSettings) => void;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  data,
  onSaveSettings,
  onImportData,
  onResetData,
}) => {
  const [pixKey, setPixKey] = useState(data.settings.pixKey || '');
  const [pixType, setPixType] = useState<AppSettings['pixType']>(data.settings.pixType || 'celular');
  const [pixName, setPixName] = useState(data.settings.pixName || '');
  const [whatsappTemplate, setWhatsappTemplate] = useState(data.settings.whatsappMessageTemplate || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      pixKey: pixKey.trim(),
      pixType,
      pixName: pixName.trim(),
      whatsappMessageTemplate: whatsappTemplate.trim(),
      defaultFiadoDays: 7,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const imported = await parseJsonFile(file);
      onImportData(imported);
      alert('Backup JSON importado e restaurado com sucesso!');
      e.target.value = '';
    } catch (err: any) {
      setImportError(err.message || 'Falha ao importar o arquivo.');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-emerald-900/80 border border-emerald-700/80 p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-black">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Configurações & Backup
            </h2>
            <p className="text-xs text-emerald-300">
              PIX, mensagem de cobrança do WhatsApp e backup em JSON
            </p>
          </div>
        </div>
      </div>

      {/* PIX and WhatsApp Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl bg-emerald-900/70 border border-emerald-700/70 p-4 sm:p-5 shadow space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Dados de Recebimento (PIX do Bar)</span>
          </h3>
          {savedSuccess && (
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" /> Configurações Salvas!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-emerald-300 mb-1">
              Tipo de Chave PIX
            </label>
            <select
              value={pixType}
              onChange={(e) => setPixType(e.target.value as AppSettings['pixType'])}
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="celular">📱 Celular (Telefone)</option>
              <option value="cpf">🪪 CPF / CNPJ</option>
              <option value="email">📧 E-mail</option>
              <option value="aleatoria">🔑 Chave Aleatória</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-amber-300 mb-1">
              Chave PIX (Para cobrança no WhatsApp) *
            </label>
            <input
              type="text"
              placeholder="Ex: 11987654321 ou seu.email@exemplo.com"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-300 mb-1">
            Nome do Titular da Conta PIX (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Marcão do Bar da Várzea"
            value={pixName}
            onChange={(e) => setPixName(e.target.value)}
            className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* WhatsApp Message Template */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-emerald-300">
              Modelo da Mensagem de Cobrança no WhatsApp
            </label>
            <span className="text-[10px] text-amber-300 font-mono">
              Tags: {'{cliente}'}, {'{copa}'}, {'{valor}'}, {'{vencimento}'}, {'{pix}'}
            </span>
          </div>
          <textarea
            rows={5}
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            className="w-full bg-emerald-950 border border-emerald-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Configurações</span>
        </button>
      </form>

      {/* Backup Section (JSON Export/Import) */}
      <div className="rounded-2xl bg-emerald-900/70 border border-emerald-700/70 p-4 sm:p-5 shadow space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-emerald-800">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Backup & Restauração de Dados (JSON)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export Button */}
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 flex flex-col justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-400" />
                Exportar Backup JSON
              </div>
              <p className="text-[11px] text-emerald-300 mt-1">
                Baixa um arquivo .json seguro contendo todos os campeonatos, clientes, produtos, vendas e fiados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportAppDataToJson(data)}
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-amber-400/40 text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Backup Completo</span>
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 flex flex-col justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                Importar Backup JSON
              </div>
              <p className="text-[11px] text-emerald-300 mt-1">
                Restaura dados de um arquivo .json baixado anteriormente no seu aparelho.
              </p>
            </div>

            <label className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-black transition flex items-center justify-center gap-1.5 shadow cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Selecionar Arquivo .JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importError && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {importError}
          </div>
        )}
      </div>

      {/* Reset & Persistence Info */}
      <div className="rounded-2xl bg-emerald-900/70 border border-emerald-700/70 p-4 sm:p-5 shadow space-y-3">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <span>🔄</span> Restauração de Dados
        </h3>
        <p className="text-xs text-emerald-300">
          Os dados ficam salvos permanentemente no seu navegador (localStorage). Caso queira recarregar os dados de demonstração da várzea (com Zé da Pinga, Brahma, pastéis e fiados de teste), use o botão abaixo:
        </p>

        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja restaurar os dados iniciais de demonstração do Bar da Várzea?')) {
              onResetData();
              alert('Dados de demonstração restaurados com sucesso!');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Dados de Exemplo da Várzea</span>
        </button>
      </div>
    </div>
  );
};
