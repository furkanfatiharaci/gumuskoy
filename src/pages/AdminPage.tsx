import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users,
  LogOut, Plus, Pencil, Trash2, X, Check, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { orderStatusLabels, orderStatusColors, paymentStatusLabels } from '@/lib/constants';
import type { Product, Category, Order, Profile, Review } from '@/types';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'reviews';

export default function AdminPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/giris');
      return;
    }
    if (!isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const navItems: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Ürünler', icon: Package },
    { key: 'categories', label: 'Kategoriler', icon: FolderTree },
    { key: 'orders', label: 'Siparişler', icon: ShoppingCart },
    { key: 'users', label: 'Kullanıcılar', icon: Users },
    { key: 'reviews', label: 'Yorumlar', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-earth-900">Admin Panel</h1>
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="flex items-center gap-2 text-sm font-medium text-error-600 hover:text-error-700"
          >
            <LogOut size={18} /> Çıkış
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="card p-3 space-y-1 lg:sticky lg:top-24">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    tab === item.key ? 'bg-primary-600 text-white' : 'text-earth-600 hover:bg-cream-100'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-4">
            {tab === 'dashboard' && <DashboardTab />}
            {tab === 'products' && <ProductsAdminTab />}
            {tab === 'categories' && <CategoriesAdminTab />}
            {tab === 'orders' && <OrdersAdminTab />}
            {tab === 'users' && <UsersTab />}
            {tab === 'reviews' && <ReviewsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardTab() {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    lowStockProducts: [] as Product[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

      const { data: orders } = await supabase.from('orders').select('total, status, created_at');
      const totalSales = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
      const today = new Date().toISOString().split('T')[0];
      const todaySales = orders?.filter((o) => o.created_at.startsWith(today)).reduce((s, o) => s + Number(o.total), 0) ?? 0;
      const pending = orders?.filter((o) => o.status === 'pending_payment' || o.status === 'paid' || o.status === 'preparing').length ?? 0;

      const { data: lowStock } = await supabase.from('products').select('*').lt('stock', 10).limit(10);

      setStats({
        totalSales,
        todaySales,
        totalOrders: orderCount ?? 0,
        pendingOrders: pending,
        totalUsers: userCount ?? 0,
        totalProducts: productCount ?? 0,
        lowStockProducts: (lowStock as Product[]) ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-earth-500">Yükleniyor...</p>;

  const cards = [
    { label: 'Toplam Satış', value: formatPrice(stats.totalSales), color: 'bg-primary-50 text-primary-700' },
    { label: 'Bugünkü Satış', value: formatPrice(stats.todaySales), color: 'bg-secondary-50 text-secondary-700' },
    { label: 'Toplam Sipariş', value: stats.totalOrders.toString(), color: 'bg-blue-50 text-blue-700' },
    { label: 'Bekleyen Sipariş', value: stats.pendingOrders.toString(), color: 'bg-amber-50 text-amber-700' },
    { label: 'Toplam Kullanıcı', value: stats.totalUsers.toString(), color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Toplam Ürün', value: stats.totalProducts.toString(), color: 'bg-earth-50 text-earth-700' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-earth-900">Dashboard</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-earth-500">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color.split(' ')[1]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-earth-900 mb-3">Düşük Stoklu Ürünler</h3>
          <div className="card divide-y divide-earth-100">
            {stats.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-earth-800">{p.name}</span>
                <span className="text-sm font-bold text-error-600">{p.stock} adet</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ PRODUCTS ADMIN ============
function ProductsAdminTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', description: '', price: '',
    discount_price: '', stock: '', gram: '', region: '', ingredients: '',
    storage: '', shipping_info: '', image_url: '', category_id: '',
    is_active: true, is_featured: false, seo_title: '', seo_description: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    setProducts((prods as Product[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({
      name: '', slug: '', short_description: '', description: '', price: '',
      discount_price: '', stock: '', gram: '', region: '', ingredients: '',
      storage: '', shipping_info: '', image_url: '', category_id: '',
      is_active: true, is_featured: false, seo_title: '', seo_description: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, short_description: p.short_description ?? '',
      description: p.description ?? '', price: String(p.price),
      discount_price: p.discount_price ? String(p.discount_price) : '',
      stock: String(p.stock), gram: p.gram ?? '', region: p.region ?? '',
      ingredients: p.ingredients ?? '', storage: p.storage ?? '',
      shipping_info: p.shipping_info ?? '', image_url: p.image_url ?? '',
      category_id: p.category_id ?? '', is_active: p.is_active,
      is_featured: p.is_featured, seo_title: p.seo_title ?? '',
      seo_description: p.seo_description ?? '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
    };
    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await supabase.from('products').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-earth-900">Ürünler ({products.length})</h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-secondary py-2 px-4">
            <Plus size={18} /> Ürün Ekle
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid sm:grid-cols-2 gap-4">
          <div><label className="label">Ürün Adı</label><input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Slug</label><input className="input" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="urun-slug" /></div>
          <div><label className="label">Kategori</label>
            <select className="input" value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
              <option value="">Kategori seçin</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Fiyat (TL)</label><input type="number" step="0.01" className="input" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
          <div><label className="label">İndirimli Fiyat</label><input type="number" step="0.01" className="input" value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))} /></div>
          <div><label className="label">Stok</label><input type="number" className="input" required value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></div>
          <div><label className="label">Gramaj</label><input className="input" value={form.gram} onChange={(e) => setForm((f) => ({ ...f, gram: e.target.value }))} /></div>
          <div><label className="label">Üretim Bölgesi</label><input className="input" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} /></div>
          <div><label className="label">Görsel URL</label><input className="input" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} /></div>
          <div><label className="label">Kısa Açıklama</label><input className="input" value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">Açıklama</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label">İçindekiler</label><input className="input" value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} /></div>
          <div><label className="label">Saklama</label><input className="input" value={form.storage} onChange={(e) => setForm((f) => ({ ...f, storage: e.target.value }))} /></div>
          <div><label className="label">Kargo Bilgisi</label><input className="input" value={form.shipping_info} onChange={(e) => setForm((f) => ({ ...f, shipping_info: e.target.value }))} /></div>
          <div><label className="label">SEO Title</label><input className="input" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">SEO Description</label><input className="input" value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded text-primary-600" /><span className="text-sm">Aktif</span></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="rounded text-primary-600" /><span className="text-sm">Öne Çıkan</span></label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Güncelle' : 'Ekle'}</button>
            <button type="button" onClick={resetForm} className="btn-outline">İptal</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-earth-500">Yükleniyor...</p>
      ) : (
        <div className="card divide-y divide-earth-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-earth-500 border-b border-earth-100">
                <th className="p-3">Ürün</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Fiyat</th>
                <th className="p-3">Stok</th>
                <th className="p-3">Durum</th>
                <th className="p-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-earth-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={p.image_url ?? ''} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-earth-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-earth-600">{p.category?.name ?? '-'}</td>
                  <td className="p-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="p-3"><span className={p.stock < 10 ? 'text-error-600 font-bold' : ''}>{p.stock}</span></td>
                  <td className="p-3">{p.is_active ? <span className="text-success-600">Aktif</span> : <span className="text-earth-400">Pasif</span>}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-earth-500 hover:text-primary-700"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-earth-500 hover:text-error-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ CATEGORIES ADMIN ============
function CategoriesAdminTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({ name: '', slug: '', description: '', image_url: '', sort_order: '0', is_active: true });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(c: Category) {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image_url: c.image_url ?? '', sort_order: String(c.sort_order), is_active: c.is_active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    if (editingId) {
      await supabase.from('categories').update(payload).eq('id', editingId);
    } else {
      await supabase.from('categories').insert(payload);
    }
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-earth-900">Kategoriler ({categories.length})</h2>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-secondary py-2 px-4">
            <Plus size={18} /> Kategori Ekle
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid sm:grid-cols-2 gap-4">
          <div><label className="label">Kategori Adı</label><input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Slug</label><input className="input" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">Açıklama</label><input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label">Görsel URL</label><input className="input" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} /></div>
          <div><label className="label">Sıra</label><input type="number" className="input" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded text-primary-600" /><span className="text-sm">Aktif</span></label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Güncelle' : 'Ekle'}</button>
            <button type="button" onClick={resetForm} className="btn-outline">İptal</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-earth-500">Yükleniyor...</p> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-4">
              <img src={c.image_url ?? ''} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-semibold text-earth-900">{c.name}</h3>
                <p className="text-sm text-earth-500 line-clamp-1">{c.description}</p>
                <p className="text-xs text-earth-400 mt-0.5">/{c.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="p-2 text-earth-500 hover:text-primary-700"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-earth-500 hover:text-error-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ORDERS ADMIN ============
function OrdersAdminTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    if (filter) query = query.ilike('order_number', `%${filter}%`);
    const { data } = await query;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [filter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateOrder(id: string) {
    const updates: Record<string, string> = {};
    if (newStatus) updates.status = newStatus;
    if (trackingNo) updates.tracking_number = trackingNo;
    await supabase.from('orders').update(updates).eq('id', id);
    setEditingId(null);
    setTrackingNo('');
    setNewStatus('');
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-earth-900">Siparişler</h2>

      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Sipariş no ara..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <p className="text-earth-500">Yükleniyor...</p> : orders.length === 0 ? (
        <div className="card p-8 text-center"><p className="text-earth-500">Sipariş bulunamadı.</p></div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-earth-900">#{order.order_number}</p>
                  <p className="text-xs text-earth-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColors[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                  {orderStatusLabels[order.status] ?? order.status}
                </span>
                <span className="text-sm text-earth-500">{paymentStatusLabels[order.payment_status] ?? order.payment_status}</span>
                <span className="font-bold text-primary-700">{formatPrice(order.total)}</span>
                <button onClick={() => { setEditingId(editingId === order.id ? null : order.id); setTrackingNo(order.tracking_number ?? ''); setNewStatus(order.status); }} className="text-sm text-primary-700 hover:underline">
                  {editingId === order.id ? 'Kapat' : 'Düzenle'}
                </button>
              </div>
              {editingId === order.id && (
                <div className="mt-4 pt-4 border-t border-earth-100 space-y-3 animate-slide-down">
                  <div className="flex flex-wrap gap-3">
                    <select className="input max-w-xs" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input className="input max-w-xs" placeholder="Kargo takip no" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
                    <button onClick={() => updateOrder(order.id)} className="btn-primary py-2">Kaydet</button>
                  </div>
                  <div className="text-sm text-earth-600">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between py-1">
                        <span>{item.quantity}× {item.product_name}</span>
                        <span>{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ USERS ADMIN ============
function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers((data as Profile[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-earth-900">Kullanıcılar ({users.length})</h2>
      {loading ? <p className="text-earth-500">Yükleniyor...</p> : (
        <div className="card divide-y divide-earth-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-earth-500 border-b border-earth-100">
              <th className="p-3">Ad Soyad</th><th className="p-3">E-posta</th><th className="p-3">Telefon</th><th className="p-3">Tarih</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-earth-50">
                  <td className="p-3 font-medium text-earth-800">{u.first_name} {u.last_name}</td>
                  <td className="p-3 text-earth-600">{u.email}</td>
                  <td className="p-3 text-earth-600">{u.phone ?? '-'}</td>
                  <td className="p-3 text-earth-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ REVIEWS ADMIN ============
function ReviewsTab() {
  const [reviews, setReviews] = useState<(Review & { product?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, product:products(name), profile:profiles(first_name, last_name)')
      .order('created_at', { ascending: false });
    setReviews((data as unknown as (Review & { product?: { name: string } })[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleApprove(id: string, current: boolean) {
    await supabase.from('reviews').update({ is_approved: !current }).eq('id', id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-earth-900">Yorumlar</h2>
      {loading ? <p className="text-earth-500">Yükleniyor...</p> : reviews.length === 0 ? (
        <div className="card p-8 text-center"><p className="text-earth-500">Yorum bulunamadı.</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-earth-900">{r.profile?.first_name} {r.profile?.last_name}</span>
                    {r.product && <span className="text-xs text-earth-400">· {r.product.name}</span>}
                  </div>
                  <div className="flex items-center gap-0.5 my-1">
                    {[1,2,3,4,5].map((s) => <span key={s} className={s <= r.rating ? 'text-secondary-400' : 'text-earth-200'}>★</span>)}
                  </div>
                  {r.comment && <p className="text-sm text-earth-600">{r.comment}</p>}
                  <p className="text-xs text-earth-400 mt-1">{new Date(r.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.is_approved ? (
                    <span className="flex items-center gap-1 text-xs text-success-600"><Check size={14} /> Onaylı</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-warning-600"><X size={14} /> Bekliyor</span>
                  )}
                  <button onClick={() => toggleApprove(r.id, r.is_approved)} className="text-xs text-primary-700 hover:underline">
                    {r.is_approved ? 'Onayı Kaldır' : 'Onayla'}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-earth-400 hover:text-error-600"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
