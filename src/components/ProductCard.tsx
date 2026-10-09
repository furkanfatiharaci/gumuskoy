import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatPrice, calculateDiscountPercent, getEffectivePrice } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const discount = calculateDiscountPercent(product.price, product.discount_price);
  const effectivePrice = getEffectivePrice(product);
  const outOfStock = product.stock <= 0;

  return (
    <div className="group card overflow-hidden hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <Link to={`/urun/${product.slug}`}>
          <img
            src={product.image_url ?? ''}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-secondary-500 px-2.5 py-1 text-xs font-bold text-white">
            %{discount} İndirim
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-gray-800 px-2.5 py-1 text-xs font-bold text-white">
            Tükendi
          </span>
        )}
        <button
          onClick={() => toggleFavorite(product)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-all hover:bg-white"
          aria-label="Favorilere ekle"
        >
          <Heart
            size={18}
            className={isFavorite(product.id) ? 'fill-secondary-500 text-secondary-500' : 'text-earth-400'}
          />
        </button>
      </div>

      <div className="p-4">
        {product.category && (
          <p className="text-xs font-medium text-primary-600 mb-1">{product.category.name}</p>
        )}
        <Link to={`/urun/${product.slug}`}>
          <h3 className="text-sm font-semibold text-earth-900 line-clamp-2 hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.short_description && (
          <p className="mt-1 text-xs text-earth-500 line-clamp-2">{product.short_description}</p>
        )}

        <div className="mt-3 flex items-end justify-between">
          <div>
            {discount > 0 && (
              <p className="text-xs text-earth-400 line-through">
                {formatPrice(product.price)}
              </p>
            )}
            <p className="text-base font-bold text-primary-700">{formatPrice(effectivePrice)}</p>
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-90 disabled:bg-earth-200 disabled:pointer-events-none"
            aria-label="Sepete ekle"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
