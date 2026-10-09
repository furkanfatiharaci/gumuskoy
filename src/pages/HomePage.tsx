import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, Award } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('popularity', { ascending: false })
      .limit(8)
      .then(({ data }) => setFeaturedProducts((data as Product[]) ?? []));

    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data as Category[]) ?? []));

    supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setNewProducts((data as Product[]) ?? []));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/39634737/pexels-photo-39634737.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-medium text-white">
              <Leaf size={14} />
              Doğal · Yöresel · Güvenilir
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Doğanın gerçek lezzetleri sofranızda.
            </h1>
            <p className="mt-6 text-lg text-primary-100 max-w-xl">
              Özenle seçilmiş doğal ve yöresel köy ürünlerini doğrudan kapınıza ulaştırıyoruz.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/urunler"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary-700 transition-all hover:bg-cream-100 active:scale-95"
              >
                Ürünleri Keşfet
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/kategori/kahvaltilik"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
              >
                Kategorileri Gör
              </Link>
            </div>
          </div>
        </div>
        {/* Wave decoration */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0 60V20C240 0 480 0 720 20C960 40 1200 40 1440 20V60H0Z" fill="#fffef9" />
        </svg>
      </section>

      {/* Features strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Leaf size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-earth-800">%100 Doğal</p>
              <p className="text-xs text-earth-500">Katkı maddesi içermeyen ürünler</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-earth-800">Hızlı Teslimat</p>
              <p className="text-xs text-earth-500">Tüm Türkiye'ye kargo</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream-200 text-earth-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-earth-800">Güvenilir</p>
              <p className="text-xs text-earth-500">Köyden özenle seçilmiş</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-earth-900">Kategoriler</h2>
            <p className="mt-2 text-sm text-earth-500">İhtiyacınıza uygun doğal ürünleri keşfedin</p>
          </div>
          <Link to="/urunler" className="text-sm font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/kategori/${cat.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={cat.image_url ?? ''}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-sm sm:text-base font-semibold text-white">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-earth-900">Öne Çıkan Ürünler</h2>
              <p className="mt-2 text-sm text-earth-500">En çok tercih edilen doğal lezzetler</p>
            </div>
            <Link to="/urunler" className="text-sm font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-1">
              Tümünü Gör <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      {newProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-earth-900">Yeni Ürünler</h2>
              <p className="mt-2 text-sm text-earth-500">Az önce köyden geldi</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-earth-700 px-8 py-14 sm:px-16 sm:py-20 text-center">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-bold text-cream-50">Doğal lezzetleri keşfetmeye hazır mısınız?</h2>
            <p className="mt-4 text-earth-200 max-w-2xl mx-auto">
              Türkiye'nin dört bir yanından özenle seçilmiş köy ürünleri, kapınızda.
            </p>
            <Link
              to="/urunler"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cream-50 px-8 py-4 text-sm font-semibold text-earth-800 transition-all hover:bg-white active:scale-95"
            >
              Alışverişe Başla
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
