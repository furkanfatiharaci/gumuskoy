import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, NavLink } from 'react-router-dom';
import {
  User, MapPin, Package, Heart, LogOut, KeyRound, Plus, Pencil,
  Trash2, Star, Check, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getEffectivePrice } from '@/lib/format';
import { orderStatusLabels, orderStatusColors, orderStatusDot } from '@/lib/constants';
import type { Address, Order, Profile, Favorite, Product } from '@/types';

type Tab = 'profil' | 'adreslerim' | 'siparislerim' | 'favorilerim' | 'sifre';

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profil', label: 'Profil Bilgilerim', icon: User },
  { key: 'adreslerim', label: 'Adreslerim', icon: MapPin },
  { key: 'siparislerim', label: 'Siparişlerim', icon: Package },
  { key: 'favorilerim', label: 'Favorilerim', icon: Heart },
  { key: 'sifre', label: 'Şifre Değiştirme', icon: KeyRound },
];

export default function AccountPage() {
  const { tab } = useParams();
  const activeTab = (tab as Tab) || 'profil';
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/giris');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
          {(profile?.first_name ?? 'K')[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-earth-900">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <p className="text-sm text-earth-500">{user.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-4 space-y-1">
            {tabs.map((t) => (
              <NavLink
                key={t.key}
                to={`/hesabim/${t.key}`}
                className={() =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-earth-600 hover:bg-cream-100'
                  }`
                }
              >
                <t.icon size={18} />
                {t.label}
              </NavLink>
            ))}
            <button
              onClick={() => signOut().then(() => navigate('/'))}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
            >
              <LogOut size={18} />
              Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profil' && <ProfileTab profile={profile} onUpdate={refreshProfile} />}
          {activeTab === 'adreslerim' && <AddressesTab />}
          {activeTab === 'siparislerim' && <OrdersTab />}
          {activeTab === 'favorilerim' && (
            <FavoritesTab favorites={favorites} toggleFavorite={toggleFavorite} />
          )}
          {activeTab === 'sifre' && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, onUpdate }: { profile: Profile | null; onUpdate: () => Promise<void> }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    email: user?.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      })
      .eq('id', user!.id);
    await onUpdate();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-earth-900 mb-6">Profil Bilgilerim</h2>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ad</label>
            <input className="input" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Soyad</label>
            <input className="input" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input bg-cream-100" value={form.email} disabled />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-success-700 bg-success-50 rounded-xl px-4 py-2">
            <Check size={16} /> Profil güncellendi.
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}

function AddressesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', first_name: '', last_name: '', phone: '', city: '',
    district: '', neighborhood: '', address_line: '', postal_code: '', is_default: false,
  });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
    setAddresses((data as Address[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({ title: '', first_name: '', last_name: '', phone: '', city: '', district: '', neighborhood: '', address_line: '', postal_code: '', is_default: false });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (editingId) {
      await supabase.from('addresses').update(form).eq('id', editingId);
    } else {
      await supabase.from('addresses').insert({ ...form, user_id: user.id });
    }
    if (form.is_default) {
      const all = addresses.filter((a) => a.id !== editingId);
      for (const a of all) {
        if (a.is_default) await supabase.from('addresses').update({ is_default: false }).eq('id', a.id);
      }
    }
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from('addresses').delete().eq('id', id);
    load();
  }

  function handleEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      title: addr.title, first_name: addr.first_name, last_name: addr.last_name,
      phone: addr.phone, city: addr.city, district: addr.district,
      neighborhood: addr.neighborhood ?? '', address_line: addr.address_line,
      postal_code: addr.postal_code ?? '', is_default: addr.is_default,
    });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-earth-900">Adreslerim</h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-secondary py-2 px-4">
            <Plus size={18} /> Yeni Adres
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Adres Başlığı</label>
            <input className="input" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ev, İş..." />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input className="input" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Ad</label>
            <input className="input" required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Soyad</label>
            <input className="input" required value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">İl</label>
            <input className="input" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className="label">İlçe</label>
            <input className="input" required value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} />
          </div>
          <div>
            <label className="label">Mahalle</label>
            <input className="input" value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} />
          </div>
          <div>
            <label className="label">Posta Kodu</label>
            <input className="input" value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Açık Adres</label>
            <textarea className="input" required rows={2} value={form.address_line} onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} className="rounded border-earth-300 text-primary-600" />
            <span className="text-sm text-earth-600">Varsayılan adres olarak ayarla</span>
          </label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Güncelle' : 'Kaydet'}</button>
            <button type="button" onClick={resetForm} className="btn-outline">İptal</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-earth-500">Yükleniyor...</p>
      ) : addresses.length === 0 ? (
        <div className="card p-8 text-center">
          <MapPin size={32} className="mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">Henüz kayıtlı adresiniz yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-earth-900">{addr.title}</h3>
                    {addr.is_default && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">Varsayılan</span>
                    )}
                  </div>
                  <p className="text-sm text-earth-600">
                    {addr.first_name} {addr.last_name} · {addr.phone}
                  </p>
                  <p className="text-sm text-earth-500 mt-1">
                    {addr.address_line}, {addr.neighborhood}, {addr.district}/{addr.city} {addr.postal_code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="p-2 text-earth-500 hover:text-primary-700">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-earth-500 hover:text-error-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p className="text-earth-500">Yükleniyor...</p>;

  if (orders.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Package size={32} className="mx-auto text-earth-300 mb-3" />
        <p className="text-earth-500">Henüz siparişiniz yok.</p>
        <Link to="/urunler" className="btn-primary mt-4">Alışverişe Başla</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-earth-900 mb-6">Siparişlerim</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-cream-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${orderStatusDot[order.status] ?? 'bg-gray-400'}`} />
                <div className="text-left">
                  <p className="font-semibold text-earth-900">Sipariş #{order.order_number}</p>
                  <p className="text-xs text-earth-500">
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                  {orderStatusLabels[order.status] ?? order.status}
                </span>
                <span className="font-bold text-primary-700">{formatPrice(order.total)}</span>
                <ChevronRight size={18} className={`text-earth-400 transition-transform ${expandedId === order.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {expandedId === order.id && (
              <div className="border-t border-earth-100 p-5 space-y-3 animate-slide-down">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.product_image ?? ''} alt={item.product_name} className="h-14 w-14 rounded-lg object-cover bg-cream-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-earth-800">{item.product_name}</p>
                      <p className="text-xs text-earth-500">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div className="border-t border-earth-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-earth-600"><span>Ara Toplam</span><span>{formatPrice(order.subtotal)}</span></div>
                  {order.discount_amount > 0 && <div className="flex justify-between text-success-600"><span>İndirim</span><span>-{formatPrice(order.discount_amount)}</span></div>}
                  <div className="flex justify-between text-earth-600"><span>Kargo</span><span>{order.shipping_fee === 0 ? 'Ücretsiz' : formatPrice(order.shipping_fee)}</span></div>
                  <div className="flex justify-between font-bold text-earth-900"><span>Toplam</span><span>{formatPrice(order.total)}</span></div>
                  {order.tracking_number && (
                    <div className="flex justify-between text-earth-600 pt-2 border-t border-earth-100"><span>Kargo Takip</span><span>{order.tracking_number}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoritesTab({
  favorites,
  toggleFavorite,
}: {
  favorites: Favorite[];
  toggleFavorite: (p: Product) => Promise<void>;
}) {
  if (favorites.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Heart size={32} className="mx-auto text-earth-300 mb-3" />
        <p className="text-earth-500">Henüz favori ürününüz yok.</p>
        <Link to="/urunler" className="btn-primary mt-4">Ürünleri Keşfet</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-earth-900 mb-6">Favorilerim</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {favorites.map((fav) => {
          const p = fav.product;
          if (!p) return null;
          return (
            <div key={p.id} className="card p-4 flex gap-4">
              <Link to={`/urun/${p.slug}`}>
                <img src={p.image_url ?? ''} alt={p.name} className="h-20 w-20 rounded-xl object-cover bg-cream-100" />
              </Link>
              <div className="flex-1">
                <Link to={`/urun/${p.slug}`}>
                  <h3 className="text-sm font-semibold text-earth-900 hover:text-primary-700">{p.name}</h3>
                </Link>
                <p className="mt-1 text-sm font-bold text-primary-700">{formatPrice(getEffectivePrice(p))}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Link to={`/urun/${p.slug}`} className="text-xs font-medium text-primary-700 hover:underline">Ürünü Gör</Link>
                  <button onClick={() => toggleFavorite(p)} className="text-xs text-error-500 hover:underline">Kaldır</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasswordTab() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else { setSuccess(true); setPassword(''); setConfirm(''); setTimeout(() => setSuccess(false), 3000); }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-earth-900 mb-6">Şifre Değiştirme</h2>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-md">
        {error && <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
        {success && <div className="flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700"><Check size={16} /> Şifreniz güncellendi.</div>}
        <div>
          <label className="label">Yeni Şifre</label>
          <input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Yeni Şifre (Tekrar)</label>
          <input type="password" className="input" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</button>
      </form>
    </div>
  );
}
