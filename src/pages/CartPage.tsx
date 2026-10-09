import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, getEffectivePrice } from '@/lib/format';

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingFee = cartTotal >= 500 ? 0 : 49;
  const grandTotal = cartTotal + shippingFee;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-earth-100 rounded w-1/4" />
          <div className="h-32 bg-earth-100 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100">
            <ShoppingBag size={32} className="text-earth-400" />
          </div>
          <h1 className="text-xl font-bold text-earth-900">Sepetiniz şu anda boş.</h1>
          <p className="mt-2 text-earth-500">Doğal lezzetleri keşfetmeye başlayın!</p>
          <Link to="/urunler" className="btn-primary mt-6">
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-8">Sepetim</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const price = getEffectivePrice(product);
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/urun/${product.slug}`} className="flex-shrink-0">
                  <img
                    src={product.image_url ?? ''}
                    alt={product.name}
                    className="h-24 w-24 rounded-xl object-cover bg-cream-100"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/urun/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-earth-900 hover:text-primary-700 line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  {product.gram && <p className="text-xs text-earth-500 mt-0.5">{product.gram}</p>}
                  <p className="mt-1 text-sm font-bold text-primary-700">{formatPrice(price)}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-earth-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-earth-600 hover:text-primary-700"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-earth-600 hover:text-primary-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-earth-900">
                        {formatPrice(price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-earth-400 hover:text-error-600 transition-colors"
                        aria-label="Kaldır"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-earth-900 mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-earth-600">Ara Toplam</span>
                <span className="font-medium text-earth-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-600">Kargo</span>
                <span className="font-medium text-earth-900">
                  {shippingFee === 0 ? <span className="text-success-600">Ücretsiz</span> : formatPrice(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-primary-600 bg-primary-50 rounded-lg p-2">
                  {formatPrice(500 - cartTotal)} daha ekleyin, kargo ücretsiz olsun!
                </p>
              )}
              <div className="border-t border-earth-100 pt-3 flex justify-between">
                <span className="font-semibold text-earth-900">Genel Toplam</span>
                <span className="text-lg font-bold text-primary-700">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(user ? '/odeme' : '/giris?redirect=/odeme')}
              className="btn-primary w-full mt-6"
            >
              Ödemeye Geç
              <ArrowRight size={18} />
            </button>
            <Link
              to="/urunler"
              className="block text-center mt-3 text-sm text-primary-700 hover:text-primary-800"
            >
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
