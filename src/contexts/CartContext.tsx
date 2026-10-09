import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getEffectivePrice } from '@/lib/format';
import type { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  cartId: string | null;
  loading: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setCartId(null);
      return;
    }
    setLoading(true);
    const { data: cart } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let cId = cart?.id;
    if (!cId) {
      const { data: newCart } = await supabase
        .from('cart')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      cId = newCart?.id;
    }
    setCartId(cId ?? null);

    if (cId) {
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', cId);
      setItems((cartItems as unknown as CartItem[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      if (!user || !cartId) return;
      const existing = items.find((i) => i.product_id === product.id);
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          cart_id: cartId,
          product_id: product.id,
          quantity,
        });
      }
      await loadCart();
    },
    [user, cartId, items, loadCart]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      await supabase.from('cart_items').delete().eq('id', itemId);
      await loadCart();
    },
    [loadCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
      await loadCart();
    },
    [loadCart]
  );

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    await supabase.from('cart_items').delete().eq('cart_id', cartId);
    await loadCart();
  }, [cartId, loadCart]);

  const refreshCart = useCallback(() => loadCart(), [loadCart]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce(
    (sum, i) => sum + getEffectivePrice(i.product!) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartId,
        loading,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
