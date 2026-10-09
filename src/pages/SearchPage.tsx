import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    supabase
      .from('products')
      .select(`*, category:categories(*)`)
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%,description.ilike.%${q}%`)
      .order('popularity', { ascending: false })
      .limit(24)
      .then(({ data }) => {
        setResults((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [q]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(input.trim() ? { q: input.trim() } : {});
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-6">Arama</h1>

      <form onSubmit={handleSubmit} className="max-w-xl mb-8">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-xl border border-earth-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-700">
            Ara
          </button>
        </div>
      </form>

      {q && (
        <p className="text-sm text-earth-500 mb-6">
          "{q}" için {loading ? 'aranıyor...' : `${results.length} sonuç bulundu`}
        </p>
      )}

      {!q && !loading && (
        <div className="card p-12 text-center">
          <SearchIcon size={32} className="mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">Aramak istediğiniz ürünü yazın.</p>
        </div>
      )}

      {q && !loading && results.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-earth-500">Sonuç bulunamadı. Farklı bir kelime deneyin.</p>
          <Link to="/urunler" className="btn-primary mt-4">Tüm Ürünleri Gör</Link>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
