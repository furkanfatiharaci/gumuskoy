import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';

type SortOption = 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'discount';

const sortLabels: Record<SortOption, string> = {
  popularity: 'Popülerliğe Göre',
  price_asc: 'Fiyat (Artan)',
  price_desc: 'Fiyat (Azalan)',
  newest: 'Yeni Ürünler',
  discount: 'İndirim Oranı',
};

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('popularity');
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    if (slug) {
      setSelectedCats(new Set([slug]));
    }
  }, [slug]);

  const activeCategorySlug = slug;
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  useEffect(() => {
    setPage(1);
  }, [slug, sort, selectedCats, priceMin, priceMax, inStockOnly]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `, { count: 'exact' })
        .eq('is_active', true);

      const catSlugs = activeCategorySlug ? [activeCategorySlug] : Array.from(selectedCats);
      if (catSlugs.length > 0) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id')
          .in('slug', catSlugs);
        if (cats && cats.length > 0) {
          query = query.in('category_id', cats.map((c) => c.id));
        }
      }

      const q = searchParams.get('q');
      if (q) {
        query = query.or(`name.ilike.%${q}%,short_description.ilike.%${q}%,description.ilike.%${q}%`);
      }

      if (inStockOnly) {
        query = query.gt('stock', 0);
      }

      if (priceMin) {
        query = query.gte('price', parseFloat(priceMin));
      }
      if (priceMax) {
        query = query.lte('price', parseFloat(priceMax));
      }

      switch (sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'discount':
          query = query.order('discount_price', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('popularity', { ascending: false });
      }

      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const { data, count } = await query;
      setProducts((data as Product[]) ?? []);
      setTotalCount(count ?? 0);
      setLoading(false);
    }
    loadProducts();
  }, [activeCategorySlug, selectedCats, sort, priceMin, priceMax, inStockOnly, page, searchParams]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function toggleCat(slugVal: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slugVal)) next.delete(slugVal);
      else next.add(slugVal);
      return next;
    });
  }

  const filterPanel = (
    <div className="space-y-6">
      {!activeCategorySlug && (
        <div>
          <h3 className="text-sm font-semibold text-earth-800 mb-3">Kategori</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCats.has(cat.slug)}
                  onChange={() => toggleCat(cat.slug)}
                  className="rounded border-earth-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-earth-600">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-earth-800 mb-3">Fiyat Aralığı</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="input py-2 text-sm"
          />
          <span className="text-earth-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="input py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-earth-800 mb-3">Stok Durumu</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-earth-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-earth-600">Sadece stokta olanlar</span>
        </label>
      </div>

      <button
        onClick={() => {
          setSelectedCats(new Set());
          setPriceMin('');
          setPriceMax('');
          setInStockOnly(false);
        }}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Filtreleri Temizle
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="text-sm text-earth-500 mb-4">
        Ana Sayfa / {activeCategory ? activeCategory.name : 'Ürünler'}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">
        {activeCategory ? activeCategory.name : 'Tüm Ürünler'}
      </h1>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="text-lg font-semibold text-earth-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filtreler
            </h2>
            {filterPanel}
          </div>
        </aside>

        {/* Mobile filter trigger */}
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <SlidersHorizontal size={18} />
          Filtrele
        </button>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="relative ml-auto w-80 max-w-[80%] bg-cream-50 h-full overflow-y-auto p-5 animate-slide-down">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtreler</h2>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setFilterOpen(false)}
                className="btn-primary w-full mt-6"
              >
                Ürünleri Göster
              </button>
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-earth-500">
              {loading ? 'Yükleniyor...' : `${totalCount} ürün bulundu`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-earth-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <option key={key} value={key}>{sortLabels[key]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-earth-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-earth-100 rounded w-1/3" />
                    <div className="h-4 bg-earth-100 rounded w-3/4" />
                    <div className="h-5 bg-earth-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-earth-500">Bu kriterlere uygun ürün bulunamadı.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-earth-200 px-4 py-2 text-sm font-medium text-earth-700 disabled:opacity-40 hover:bg-cream-100"
                  >
                    Önceki
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-earth-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            p === page
                              ? 'bg-primary-600 text-white'
                              : 'border border-earth-200 text-earth-700 hover:bg-cream-100'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-earth-200 px-4 py-2 text-sm font-medium text-earth-700 disabled:opacity-40 hover:bg-cream-100"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
