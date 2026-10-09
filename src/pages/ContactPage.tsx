import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-earth-900">İletişim</h1>
        <p className="mt-2 text-earth-500">Sorularınız için bizimle iletişime geçin</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-800">Telefon</p>
                <p className="text-sm text-earth-500">0850 123 45 67</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-800">E-posta</p>
                <p className="text-sm text-earth-500">info@gumuskoyden.com</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-800">Adres</p>
                <p className="text-sm text-earth-500">Gümüşhane, Türkiye</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-800">Çalışma Saatleri</p>
                <p className="text-sm text-earth-500">Pzt-Cum: 09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            {sent && (
              <div className="flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-sm text-success-700">
                <Check size={18} /> Mesajınız alındı. En kısa sürede dönüş yapacağız.
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Ad Soyad</label>
                <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">E-posta</label>
                <input type="email" className="input" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Konu</label>
              <input className="input" required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div>
              <label className="label">Mesaj</label>
              <textarea className="input" rows={5} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary">
              <Send size={18} /> Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
