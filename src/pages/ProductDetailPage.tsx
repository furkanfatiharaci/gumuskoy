import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingBag, Minus, Plus, Star, Truck, Shield, Leaf,
  MapPin, Package, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateDiscountPercent, getEffectivePrice } from '@/lib/format';
import type { Product, ProductImage, Review } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setImages([]);
    setReviews([]);

    supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProduct(data as Product);
          supabase
            .from('product_images')
            .select('*')
            .eq('product_id', data.id)
            .order('sort_order')
            .then(({ data: imgs }) => {
              setImages((imgs as ProductImage[]) ?? []);
            });

          supabase
            .from('reviews')
            .select(`
              *,
              profile:profiles(first_name, last_name)
            `)
            .eq('product_id', data.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .then(({ data: revs }) => setReviews((revs as unknown as Review[]) ?? []));

          if (data.category_id) {
            supabase
              .from('products')
              .select(`
                *,
                category:categories(*)
              `)
              .eq('is_active', true)
              .eq('category_id', data.category_id)
              .neq('id', data.id)
              .limit(4)
              .then(({ data: related }) => setRelatedProducts((related as Product[]) ?? []));
          }
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-earth-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-earth-100 rounded w-3/4" />
            <div className="h-6 bg-earth-100 rounded w-1/2" />
            <div className="h-24 bg-earth-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-earth-900">Ürün bulunamadı</h1>
        <Link to="/urunler" className="mt-4 inline-block text-primary-700 hover:text-primary-800">
          Ürünlere dön
        </Link>
      </div>
    );
  }

  const discount = calculateDiscountPercent(product.price, product.discount_price);
  const effectivePrice = getEffectivePrice(product);
  const allImages = [
    ...(product.image_url ? [{ id: 'main', image_url: product.image_url }] : []),
    ...images,
  ];
  const outOfStock = product.stock <= 0;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  function handleAddToCart() {
    if (!user) {
      navigate('/giris?redirect=' + encodeURIComponent(`/urun/${slug}`));
      return;
    }
    addToCart(product!, quantity);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !product) return;
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    if (!error) {
      setReviewSubmitted(true);
      setReviewForm({ rating: 5, comment: '' });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-earth-500 mb-6">
        <Link to="/" className="hover:text-primary-700">Ana Sayfa</Link>
        <ChevronRight size={14} />
        <Link to="/urunler" className="hover:text-primary-700">Ürünler</Link>
        <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/kategori/${product.category.slug}`} className="hover:text-primary-700">
              {product.category.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="text-earth-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-cream-100">
            <img
              src={allImages[activeImage]?.image_url ?? ''}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {allImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm font-medium text-primary-600 mb-2">{product.category.name}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-earth-900">{product.name}</h1>
            {product.short_description && (
              <p className="mt-2 text-earth-600">{product.short_description}</p>
            )}
          </div>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(avgRating) ? 'fill-secondary-400 text-secondary-400' : 'text-earth-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-earth-500">
                {avgRating.toFixed(1)} ({reviews.length} yorum)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            {discount > 0 && (
              <span className="text-lg text-earth-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-3xl font-bold text-primary-700">{formatPrice(effectivePrice)}</span>
            {discount > 0 && (
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-sm font-bold text-secondary-700">
                %{discount} indirim
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-error-100 px-3 py-1 text-sm font-medium text-error-700">
                Tükendi
              </span>
            ) : product.stock <= 10 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-100 px-3 py-1 text-sm font-medium text-warning-600">
                Son {product.stock} ürün
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1 text-sm font-medium text-success-700">
                Stokta var
              </span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-earth-200 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center text-earth-600 hover:text-primary-700"
                aria-label="Azalt"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-semibold text-earth-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-12 w-12 items-center justify-center text-earth-600 hover:text-primary-700"
                aria-label="Artır"
              >
                <Plus size={18} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary flex-1 min-w-[200px]"
            >
              <ShoppingBag size={18} />
              Sepete Ekle
            </button>
            <button
              onClick={() => toggleFavorite(product)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-earth-200 bg-white text-earth-600 hover:text-secondary-500 transition-colors"
              aria-label="Favorilere ekle"
            >
              <Heart size={20} className={isFavorite(product.id) ? 'fill-secondary-500 text-secondary-500' : ''} />
            </button>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-earth-100">
            {product.gram && (
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-earth-400">Gramaj</p>
                  <p className="text-sm font-medium text-earth-800">{product.gram}</p>
                </div>
              </div>
            )}
            {product.region && (
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-earth-400">Üretim Bölgesi</p>
                  <p className="text-sm font-medium text-earth-800">{product.region}</p>
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-cream-100">
              <Truck size={20} className="text-primary-600" />
              <p className="text-xs text-earth-600">Hızlı Kargo</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-cream-100">
              <Shield size={20} className="text-primary-600" />
              <p className="text-xs text-earth-600">Güvenli Ödeme</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-cream-100">
              <Leaf size={20} className="text-primary-600" />
              <p className="text-xs text-earth-600">%100 Doğal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed description */}
      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {product.description && (
            <div>
              <h2 className="text-xl font-bold text-earth-900 mb-3">Ürün Açıklaması</h2>
              <p className="text-earth-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {product.ingredients && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-earth-800 mb-2">İçindekiler</h3>
                <p className="text-sm text-earth-600">{product.ingredients}</p>
              </div>
            )}
            {product.storage && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-earth-800 mb-2">Saklama Koşulları</h3>
                <p className="text-sm text-earth-600">{product.storage}</p>
              </div>
            )}
            {product.shipping_info && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-earth-800 mb-2">Kargo Bilgisi</h3>
                <p className="text-sm text-earth-600">{product.shipping_info}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-earth-900 mb-4">Yorumlar ({reviews.length})</h2>

            {user && !reviewSubmitted && (
              <form onSubmit={submitReview} className="card p-5 mb-6">
                <h3 className="text-sm font-semibold text-earth-800 mb-3">Yorum Yap</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-earth-600">Puan:</span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                    >
                      <Star
                        size={20}
                        className={s <= reviewForm.rating ? 'fill-secondary-400 text-secondary-400' : 'text-earth-200'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Deneyiminizi paylaşın..."
                  rows={3}
                  className="input mb-3"
                />
                <button type="submit" className="btn-primary">Yorumu Gönder</button>
                <p className="mt-2 text-xs text-earth-400">Yorumunuz admin onayından sonra yayınlanacaktır.</p>
              </form>
            )}

            {reviewSubmitted && (
              <div className="card p-5 mb-6 bg-success-50 border-success-100">
                <p className="text-sm text-success-700">Yorumunuz alındı! Onaylandıktan sonra yayınlanacaktır.</p>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-earth-500 text-sm">Henüz yorum yok. İlk yorumu siz yapın!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                          {(review.profile?.first_name ?? 'K')[0]}
                        </div>
                        <span className="text-sm font-medium text-earth-800">
                          {review.profile?.first_name} {review.profile?.last_name}
                        </span>
                      </div>
                      <span className="text-xs text-earth-400">
                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= review.rating ? 'fill-secondary-400 text-secondary-400' : 'text-earth-200'}
                        />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-earth-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-earth-900 mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <Link key={p.id} to={`/urun/${p.slug}`} className="group card overflow-hidden hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-cream-100">
                  <img
                    src={p.image_url ?? ''}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-earth-800 line-clamp-1">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-primary-700">
                    {formatPrice(getEffectivePrice(p))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
