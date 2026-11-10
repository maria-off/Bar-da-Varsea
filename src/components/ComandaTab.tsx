import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Tag, 
  Check, 
  Search, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppData, CartItem, Customer, Product } from '../types';
import { formatCurrency } from '../utils/storage';

interface ComandaTabProps {
  data: AppData;
  onSaveSale: (
    customerId: string | undefined,
    customerName: string,
    items: CartItem[],
    total: number,
    paymentType: 'cash' | 'fiado',
    paymentMethod?: 'dinheiro' | 'pix' | 'cartao' | 'outro'
  ) => void;
  onOpenNewCustomerModal: () => void;
}

export const ComandaTab: React.FC<ComandaTabProps> = ({
  data,
  onSaveSale,
  onOpenNewCustomerModal,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(''); // '' means Balcão / Venda Rápida
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'fiado'>('cash');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao' | 'outro'>('pix');
  
  // Custom free price item modal state
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemCost, setCustomItemCost] = useState('');

  const categories = ['Todas', 'Cervejas', 'Espetos', 'Lanches', 'Refrigerantes', 'Doses', 'Diversos'];

  // Filter products
  const filteredProducts = data.products.filter((p) => {
    if (selectedCategory === 'Todas') return true;
    return p.category === selectedCategory;
  });

  // Filter customers for dropdown/selection
  const filteredCustomers = data.customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.team && c.team.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const selectedCustomer = data.customers.find((c) => c.id === selectedCustomerId);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          unitCost: product.cost,
          emoji: product.emoji,
        },
      ];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Add Free Price / Custom Item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customItemPrice.replace(',', '.'));
    if (!customItemName.trim() || isNaN(price) || price <= 0) {
      alert('Por favor informe um nome válido e um valor em R$.');
      return;
    }
    const cost = parseFloat(customItemCost.replace(',', '.')) || (price * 0.5);

    setCart((prev) => [
      ...prev,
      {
        name: customItemName.trim(),
        quantity: 1,
        unitPrice: price,
        unitCost: cost,
        emoji: '✨',
        isCustom: true,
      },
    ]);

    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemCost('');
    setShowCustomItemModal(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit sale
  const handleConfirmSale = () => {
    if (cart.length === 0) {
      alert('Adicione ao menos um produto à comanda!');
      return;
    }

    if (paymentType === 'fiado' && !selectedCustomerId) {
      alert('Para pendurar fiado, é obrigatório selecionar um cliente cadastrado!');
      return;
    }

    const customerName = selectedCustomerId
      ? selectedCustomer?.name || 'Cliente Cadastrado'
      : 'Balcão / Venda Rápida';

    onSaveSale(
      selectedCustomerId || undefined,
      customerName,
      cart,
      cartTotal,
      paymentType,
      paymentType === 'cash' ? paymentMethod : undefined
    );

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f59e0b', '#fbbf24', '#ffffff'],
      });
    } catch {
      // ignore
    }

    // Reset comanda
    setCart([]);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Customer Selection Bar */}
      <div className="rounded-2xl bg-emerald-900/70 border border-emerald-700/80 p-3 sm:p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Customer Dropdown / Selector */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>👤 Cliente da Comanda</span>
              {selectedCustomer && (
                <span className="text-[11px] text-amber-300 font-normal">
                  {selectedCustomer.team || 'Sem time'} • {selectedCustomer.phone}
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition"
              >
                <option value="">⚡ Balcão / Venda Rápida (À Vista)</option>
                <optgroup label="Clientes Cadastrados">
                  {data.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} {c.team ? `(${c.team})` : ''}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={onOpenNewCustomerModal}
                className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black shrink-0 transition shadow flex items-center gap-1 text-xs"
                title="Cadastrar Novo Cliente"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo</span>
              </button>
            </div>
          </div>

          {/* Quick Item with Free Price (Compra com Valor Livre) */}
          <div className="shrink-0 flex items-end">
            <button
              onClick={() => setShowCustomItemModal(true)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>+ Valor Livre (Sem Preço Fixo)</span>
            </button>
          </div>
        </div>

        {/* Warning if Fiado selected with Balcão */}
        {paymentType === 'fiado' && !selectedCustomerId && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Atenção: Para registrar fiado, selecione um cliente cadastrado acima.</span>
          </div>
        )}
      </div>

      {/* Main Area: Product Grid & Cart Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center: Products Selection (7 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-md font-black'
                      : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Touch-Friendly Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((i) => i.productId === product.id);
              const qtyInCart = inCartItem?.quantity || 0;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`relative p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between h-32 sm:h-36 ${
                    qtyInCart > 0
                      ? 'bg-emerald-850 border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                      : 'bg-emerald-900/70 hover:bg-emerald-800/80 border-emerald-700/60'
                  }`}
                >
                  {/* Quantity In Cart Badge */}
                  {qtyInCart > 0 && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center shadow">
                      {qtyInCart}
                    </span>
                  )}

                  <div className="text-2xl sm:text-3xl mb-1">{product.emoji}</div>

                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-medium">
                      {product.category}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-emerald-800/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-amber-300">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      + Tocar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Comanda / Cart Drawer (5 cols on desktop, sticky on scroll) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 rounded-2xl bg-emerald-900/90 border border-emerald-700/80 p-4 shadow-2xl flex flex-col max-h-[82vh]">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-white text-sm sm:text-base">
                  Comanda Atual
                </h2>
                {cartItemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-xs font-black">
                    {cartItemCount} itens
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-300 hover:text-rose-100 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2 min-h-[140px] max-h-[280px]">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-emerald-300/60 text-xs flex flex-col items-center gap-2">
                  <span className="text-3xl">🍺</span>
                  <span>Nenhum item na comanda ainda.</span>
                  <span className="text-[11px] text-emerald-400">Toque nos produtos ao lado para adicionar.</span>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={`${item.productId || item.name}-${idx}`}
                    className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-white flex items-center gap-1.5 truncate">
                        <span>{item.emoji || '📦'}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="text-[11px] text-emerald-300">
                        {formatCurrency(item.unitPrice)} un.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-emerald-900 rounded-lg border border-emerald-700">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="p-1 hover:bg-emerald-800 text-emerald-200 rounded-l transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-amber-300 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="p-1 hover:bg-emerald-800 text-emerald-200 rounded-r transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right w-16">
                        <span className="font-black text-amber-300">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-rose-400 hover:text-rose-200 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Payment Type Selector */}
            <div className="border-t border-emerald-800 pt-3 space-y-3">
              {/* Payment Type: À Vista vs Fiado */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Forma de Lançamento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      paymentType === 'cash'
                        ? 'bg-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    <span>💵</span>
                    <span>À VISTA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('fiado')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                      paymentType === 'fiado'
                        ? 'bg-amber-400 text-emerald-950 ring-2 ring-amber-300 shadow'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    <span>📝</span>
                    <span>FIADO (7 DIAS)</span>
                  </button>
                </div>
              </div>

              {/* Sub-options for À Vista */}
              {paymentType === 'cash' && (
                <div className="grid grid-cols-3 gap-1.5">
                  {(['pix', 'dinheiro', 'cartao'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold capitalize transition ${
                        paymentMethod === method
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {method === 'pix' ? '📱 PIX' : method === 'dinheiro' ? '💵 Dinheiro' : '💳 Cartão'}
                    </button>
                  ))}
                </div>
              )}

              {/* Total & Action Button */}
              <div className="bg-emerald-950/90 rounded-xl p-3 border border-emerald-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                    Total a Pagar / Pendurar
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400">
                    {formatCurrency(cartTotal)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSale}
                  disabled={cart.length === 0}
                  className={`px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                    cart.length > 0
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 cursor-pointer'
                      : 'bg-emerald-800/60 text-emerald-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRMAR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Compra com Valor Livre (Sem Preço Fixo) */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-700 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">
                  Item com Valor Livre
                </h3>
              </div>
              <button
                onClick={() => setShowCustomItemModal(false)}
                className="text-emerald-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  Descrição do Item / Produto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Combo 3 cervejas + pastel, Porção do Zé..."
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
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
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    required
                    className="w-full bg-emerald-950 border border-amber-500 rounded-xl px-3 py-2 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    Custo Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    placeholder="Opcional"
                    value={customItemCost}
                    onChange={(e) => setCustomItemCost(e.target.value)}
                    className="w-full bg-emerald-950 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black shadow transition"
                >
                  Adicionar à Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
