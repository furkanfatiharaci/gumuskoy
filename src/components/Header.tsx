import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User, Heart, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import type { Category, Product } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatPrice, getEffectivePrice } from '@/lib/format';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSuggestions, setMobileSuggestions] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const catRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (query: string, setFn: (p: Product[]) => void) => {
    if (query.trim().length < 2) {
      setFn([]);
      return;
    }
    setSearchLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .or(`name.ilike.%${query.trim()}%,short_description.ilike.%${query.trim()}%`)
      .order('popularity', { ascending: false })
      .limit(6);
    setFn((data as Product[]) ?? []);
    setSearchLoading(false);
  }, []);

  // Debounced desktop suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestions(searchQuery, setSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // Debounced mobile suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mobileSearchQuery.trim().length >= 2) {
        fetchSuggestions(mobileSearchQuery, setMobileSuggestions);
      } else {
        setMobileSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [mobileSearchQuery, fetchSuggestions]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ara?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setMobileOpen(false);
    }
  }

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/ara?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
      setMobileSuggestions([]);
      setMobileOpen(false);
    }
  }

  function goToProduct(slug: string) {
    navigate(`/urun/${slug}`);
    setSearchQuery('');
    setMobileSearchQuery('');
    setShowSuggestions(false);
    setMobileSuggestions([]);
    setMobileOpen(false);
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary-700 ${
      isActive ? 'text-primary-700' : 'text-earth-700'
    }`;

  const renderSuggestions = (items: Product[], isMobile: boolean) => {
    if (searchLoading && items.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-earth-400">Aranıyor...</div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-earth-400">Sonuç bulunamadı.</div>
      );
    }
    return items.map((p) => (
      <button
        key={p.id}
        onClick={() => goToProduct(p.slug)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-primary-50 transition-colors"
      >
        <img
          src={p.image_url ?? ''}
          alt={p.name}
          className="h-10 w-10 rounded-lg object-cover bg-cream-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-earth-800 line-clamp-1">{p.name}</p>
          {p.category && <p className="text-xs text-earth-400">{p.category.name}</p>}
        </div>
        <span className="text-sm font-bold text-primary-700 flex-shrink-0">
          {formatPrice(getEffectivePrice(p))}
        </span>
      </button>
    ));
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary-700 text-white text-center text-xs py-2 px-4">
        500 TL ve üzeri siparişlerinizde kargo ücretsiz
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-earth-100 bg-cream-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-earth-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <NavLink to="/" className={navLinkClass} end>
                Ana Sayfa
              </NavLink>
              <NavLink to="/urunler" className={navLinkClass}>
                Ürünler
              </NavLink>
              <div ref={catRef} className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-earth-700 hover:text-primary-700 transition-colors"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  Kategoriler
                  <ChevronDown size={16} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl border border-earth-100 bg-white shadow-xl py-2 animate-slide-down">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/kategori/${cat.slug}`}
                        className="block px-4 py-2.5 text-sm text-earth-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <NavLink to="/hakkimizda" className={navLinkClass}>
                Hakkımızda
              </NavLink>
              <NavLink to="/iletisim" className={navLinkClass}>
                İletişim
              </NavLink>
            </nav>

            {/* Search (desktop) with live suggestions */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xs relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Ürün ara..."
                    className="w-full rounded-full border border-earth-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-primary-600">
                    <Search size={18} />
                  </button>
                </div>
              </form>
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-earth-100 bg-white shadow-xl overflow-hidden animate-slide-down z-50">
                  {renderSuggestions(suggestions, false)}
                  {suggestions.length > 0 && (
                    <button
                      onClick={handleSearch}
                      className="w-full border-t border-earth-100 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                      Tüm sonuçları gör: "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {user && (
                <Link
                  to="/hesabim/favorilerim"
                  className="relative p-2 text-earth-700 hover:text-primary-700 transition-colors"
                  aria-label="Favoriler"
                >
                  <Heart size={22} />
                  {favorites.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-500 px-1 text-[10px] font-bold text-white">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to="/sepet"
                className="relative p-2 text-earth-700 hover:text-primary-700 transition-colors"
                aria-label="Sepet"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to={user ? '/hesabim' : '/giris'}
                className="p-2 text-earth-700 hover:text-primary-700 transition-colors"
                aria-label="Hesabım"
              >
                <User size={22} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-earth-100 bg-cream-50 animate-slide-down">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <form onSubmit={handleMobileSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      placeholder="Ürün ara..."
                      className="w-full rounded-full border border-earth-200 bg-white py-2.5 pl-4 pr-10 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
                      <Search size={18} />
                    </button>
                  </div>
                </form>
                {mobileSearchQuery.trim().length >= 2 && mobileSuggestions.length > 0 && (
                  <div className="mt-2 rounded-2xl border border-earth-100 bg-white shadow-lg overflow-hidden">
                    {renderSuggestions(mobileSuggestions, true)}
                  </div>
                )}
                {mobileSearchQuery.trim().length >= 2 && !searchLoading && mobileSuggestions.length === 0 && (
                  <div className="mt-2 rounded-2xl border border-earth-100 bg-white shadow-lg px-4 py-3 text-sm text-earth-400">
                    Sonuç bulunamadı.
                  </div>
                )}
              </div>
              <nav className="flex flex-col gap-1">
                <Link to="/" className="py-2.5 text-sm font-medium text-earth-800" onClick={() => setMobileOpen(false)}>
                  Ana Sayfa
                </Link>
                <Link to="/urunler" className="py-2.5 text-sm font-medium text-earth-800" onClick={() => setMobileOpen(false)}>
                  Ürünler
                </Link>
                <div className="py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-earth-400 mb-2">Kategoriler</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/kategori/${cat.slug}`}
                      className="block py-2 pl-3 text-sm text-earth-700 border-l-2 border-earth-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <Link to="/hakkimizda" className="py-2.5 text-sm font-medium text-earth-800" onClick={() => setMobileOpen(false)}>
                  Hakkımızda
                </Link>
                <Link to="/iletisim" className="py-2.5 text-sm font-medium text-earth-800" onClick={() => setMobileOpen(false)}>
                  İletişim
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
