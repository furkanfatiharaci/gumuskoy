import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, CreditCard, Truck, MapPin, FileText } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getEffectivePrice } from '@/lib/format';
import type { Address, ShippingMethod, Order } from '@/types';

type Step = 'address' | 'invoice' | 'shipping' | 'payment';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual');
  const [invoiceForm, setInvoiceForm] = useState({
    firstName: '', lastName: '', tcNo: '',
    company: '', taxNo: '', taxOffice: '', invoiceAddress: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/giris?redirect=/odeme');
      return;
    }
    if (items.length === 0) {
      navigate('/sepet');
      return;
    }
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).then(({ data }) => {
      setAddresses((data as Address[]) ?? []);
      if (data && data.length > 0) setSelectedAddressId(data[0].id);
    });
    supabase.from('shipping_methods').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setShippingMethods((data as ShippingMethod[]) ?? []);
      if (data && data.length > 0) setSelectedShippingId(data[0].id);
    });
  }, [user, items, navigate]);

  const selectedShipping = shippingMethods.find((s) => s.id === selectedShippingId);
  const shippingFee = selectedShipping?.fee ?? 0;
  const grandTotal = cartTotal + shippingFee;

  const steps: { key: Step; label: string; icon: typeof MapPin }[] = [
    { key: 'address', label: 'Teslimat Adresi', icon: MapPin },
    { key: 'invoice', label: 'Fatura Bilgileri', icon: FileText },
    { key: 'shipping', label: 'Kargo', icon: Truck },
    { key: 'payment', label: 'Ödeme', icon: CreditCard },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function nextStep() {
    const order: Step[] = ['address', 'invoice', 'shipping', 'payment'];
    const next = order[currentStepIndex + 1];
    if (next) setStep(next);
  }

  function prevStep() {
    const order: Step[] = ['address', 'invoice', 'shipping', 'payment'];
    const prev = order[currentStepIndex - 1];
    if (prev) setStep(prev);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      if (!selectedAddress || !user) {
        setError('Adres seçimi gerekli.');
        setProcessing(false);
        return;
      }

      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');
      if (!orderNumber) {
        setError('Sipariş numarası oluşturulamadı.');
        setProcessing(false);
        return;
      }

      // Create order
      const billingAddress = {
        type: invoiceType,
        ...invoiceForm,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'paid',
          payment_status: 'success',
          subtotal: cartTotal,
          discount_amount: 0,
          shipping_fee: shippingFee,
          total: grandTotal,
          shipping_address: selectedAddress,
          billing_address: billingAddress,
          invoice_type: invoiceType,
          shipping_method_id: selectedShippingId || null,
        })
        .select()
        .single();

      if (orderError || !order) {
        setError('Sipariş oluşturulamadı: ' + orderError?.message);
        setProcessing(false);
        return;
      }

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? '',
        product_image: item.product?.image_url ?? null,
        price: getEffectivePrice(item.product!),
        quantity: item.quantity,
        subtotal: getEffectivePrice(item.product!) * item.quantity,
      }));

      await supabase.from('order_items').insert(orderItems);

      // Create payment record (no card data stored)
      await supabase.from('payments').insert({
        order_id: order.id,
        provider: 'iyzico',
        provider_transaction_id: 'demo_' + Date.now(),
        amount: grandTotal,
        status: 'success',
      });

      // Clear cart
      await clearCart();

      // Navigate to order confirmation
      navigate('/hesabim/siparislerim');
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
    setProcessing(false);
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-8">Ödeme</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              step === s.key ? 'bg-primary-600 text-white' :
              idx < currentStepIndex ? 'bg-success-100 text-success-700' : 'bg-cream-100 text-earth-400'
            }`}>
              {idx < currentStepIndex ? <Check size={16} /> : <s.icon size={16} />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </div>
            {idx < steps.length - 1 && <ChevronRight size={16} className="text-earth-300" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step: Address */}
          {step === 'address' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Teslimat Adresi</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-earth-500 mb-4">Kayıtlı adresiniz yok.</p>
                  <button onClick={() => navigate('/hesabim/adreslerim')} className="btn-primary">
                    Adres Ekle
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`block card p-4 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'ring-2 ring-primary-500' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 text-primary-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-earth-900">{addr.title}</span>
                              {addr.is_default && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">Varsayılan</span>}
                            </div>
                            <p className="text-sm text-earth-600 mt-1">{addr.first_name} {addr.last_name} · {addr.phone}</p>
                            <p className="text-sm text-earth-500">{addr.address_line}, {addr.district}/{addr.city}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button onClick={nextStep} disabled={!selectedAddressId} className="btn-primary mt-6">Devam Et</button>
                </>
              )}
            </div>
          )}

          {/* Step: Invoice */}
          {step === 'invoice' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Fatura Bilgileri</h2>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setInvoiceType('individual')} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${invoiceType === 'individual' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-earth-200 text-earth-600'}`}>
                  Bireysel
                </button>
                <button onClick={() => setInvoiceType('corporate')} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${invoiceType === 'corporate' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-earth-200 text-earth-600'}`}>
                  Kurumsal
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {invoiceType === 'individual' ? (
                  <>
                    <div><label className="label">Ad</label><input className="input" required value={invoiceForm.firstName} onChange={(e) => setInvoiceForm((f) => ({ ...f, firstName: e.target.value }))} /></div>
                    <div><label className="label">Soyad</label><input className="input" required value={invoiceForm.lastName} onChange={(e) => setInvoiceForm((f) => ({ ...f, lastName: e.target.value }))} /></div>
                    <div className="sm:col-span-2"><label className="label">T.C. Kimlik No</label><input className="input" value={invoiceForm.tcNo} onChange={(e) => setInvoiceForm((f) => ({ ...f, tcNo: e.target.value }))} /></div>
                  </>
                ) : (
                  <>
                    <div className="sm:col-span-2"><label className="label">Firma Adı</label><input className="input" required value={invoiceForm.company} onChange={(e) => setInvoiceForm((f) => ({ ...f, company: e.target.value }))} /></div>
                    <div><label className="label">Vergi Numarası</label><input className="input" required value={invoiceForm.taxNo} onChange={(e) => setInvoiceForm((f) => ({ ...f, taxNo: e.target.value }))} /></div>
                    <div><label className="label">Vergi Dairesi</label><input className="input" required value={invoiceForm.taxOffice} onChange={(e) => setInvoiceForm((f) => ({ ...f, taxOffice: e.target.value }))} /></div>
                  </>
                )}
                <div className="sm:col-span-2"><label className="label">Fatura Adresi</label><textarea className="input" rows={2} required value={invoiceForm.invoiceAddress} onChange={(e) => setInvoiceForm((f) => ({ ...f, invoiceAddress: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={prevStep} className="btn-outline">Geri</button>
                <button onClick={nextStep} className="btn-primary">Devam Et</button>
              </div>
            </div>
          )}

          {/* Step: Shipping */}
          {step === 'shipping' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-earth-900 mb-4">Kargo Seçenekleri</h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label key={method.id} className={`block card p-4 cursor-pointer transition-all ${selectedShippingId === method.id ? 'ring-2 ring-primary-500' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" checked={selectedShippingId === method.id} onChange={() => setSelectedShippingId(method.id)} className="text-primary-600" />
                        <div>
                          <p className="font-semibold text-earth-900">{method.name}</p>
                          <p className="text-sm text-earth-500">{method.description} · {method.estimated_days}</p>
                        </div>
                      </div>
                      <span className="font-bold text-primary-700">{method.fee === 0 ? 'Ücretsiz' : formatPrice(method.fee)}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={prevStep} className="btn-outline">Geri</button>
                <button onClick={nextStep} disabled={!selectedShippingId} className="btn-primary">Devam Et</button>
              </div>
            </div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <form onSubmit={handlePayment} className="card p-6">
              <h2 className="text-lg font-semibold text-earth-900 mb-1">Ödeme</h2>
              <p className="text-sm text-earth-500 mb-4">
                Kredi/banka kartı ile ödeme. Kart bilgileriniz güvenli ödeme sağlayıcısı üzerinden işlenir, veritabanımızda saklanmaz.
              </p>
              {error && <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700 mb-4">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="label">Kart Numarası</label>
                  <input className="input" required maxLength={19} placeholder="0000 0000 0000 0000" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm((f) => ({ ...f, cardNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Kart Üzerindeki İsim</label>
                  <input className="input" required value={paymentForm.cardName} onChange={(e) => setPaymentForm((f) => ({ ...f, cardName: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Son Kullanma Tarihi</label>
                    <input className="input" required placeholder="MM/YY" maxLength={5} value={paymentForm.expiry} onChange={(e) => setPaymentForm((f) => ({ ...f, expiry: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">CVV</label>
                    <input className="input" required maxLength={4} placeholder="123" value={paymentForm.cvv} onChange={(e) => setPaymentForm((f) => ({ ...f, cvv: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={prevStep} className="btn-outline">Geri</button>
                <button type="submit" disabled={processing} className="btn-primary flex-1">
                  {processing ? 'İşleniyor...' : `${formatPrice(grandTotal)} Öde`}
                </button>
              </div>
              <p className="mt-4 text-xs text-earth-400 flex items-center gap-1.5">
                <CreditCard size={14} />
                Ödemeniz PCI-DSS uyumlu ödeme sağlayıcısı tarafından güvenle işlenir.
              </p>
            </form>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-earth-900 mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <img src={item.product?.image_url ?? ''} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-earth-800 line-clamp-1">{item.product?.name}</p>
                    <p className="text-earth-500">{item.quantity} × {formatPrice(getEffectivePrice(item.product!))}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-earth-100 pt-4">
              <div className="flex justify-between"><span className="text-earth-600">Ara Toplam</span><span className="font-medium">{formatPrice(cartTotal)}</span></div>
              <div className="flex justify-between"><span className="text-earth-600">Kargo</span><span className="font-medium">{shippingFee === 0 ? 'Ücretsiz' : formatPrice(shippingFee)}</span></div>
              <div className="flex justify-between border-t border-earth-100 pt-2"><span className="font-semibold text-earth-900">Toplam</span><span className="text-lg font-bold text-primary-700">{formatPrice(grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
