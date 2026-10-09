import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Favorite, Product } from '@/types';

interface FavoritesContextValue {
  favorites: Favorite[];
  favoriteProductIds: Set<string>;
  loading: boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id);
    setFavorites((data as unknown as Favorite[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = useCallback(
    async (product: Product) => {
      if (!user) return;
      const existing = favorites.find((f) => f.product_id === product.id);
      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          product_id: product.id,
        });
      }
      await load();
    },
    [user, favorites, load]
  );

  const favoriteProductIds = new Set(favorites.map((f) => f.product_id));
  const isFavorite = (productId: string) => favoriteProductIds.has(productId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, favoriteProductIds, loading, toggleFavorite, isFavorite, refresh: load }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
