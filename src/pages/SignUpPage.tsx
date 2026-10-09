import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    const { error: err } = await signUp({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
    });
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="card p-8 max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
            <ArrowRight size={28} className="text-success-600" />
          </div>
          <h1 className="text-xl font-bold text-earth-900">Üyeliğiniz oluşturuldu!</h1>
          <p className="mt-2 text-earth-500">
            Hesabınıza giriş yapabilirsiniz.
          </p>
          <Link to="/giris" className="btn-primary mt-6">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-earth-900">Üye Ol</h1>
          <p className="mt-1 text-sm text-earth-500">Doğal lezzetler için hesabınızı oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ad</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                <input type="text" required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Ad" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Soyad</label>
              <input type="text" required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Soyad" className="input" />
            </div>
          </div>

          <div>
            <label className="label">E-posta</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="ornek@email.com" className="input pl-10" />
            </div>
          </div>

          <div>
            <label className="label">Telefon</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="05XX XXX XX XX" className="input pl-10" />
            </div>
          </div>

          <div>
            <label className="label">Şifre</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="En az 6 karakter" className="input pl-10" />
            </div>
          </div>

          <div>
            <label className="label">Şifre (Tekrar)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
              <input type="password" required value={form.passwordConfirm} onChange={(e) => update('passwordConfirm', e.target.value)} placeholder="••••••••" className="input pl-10" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Oluşturuluyor...' : 'Üye Ol'}
          </button>

          <p className="text-center text-sm text-earth-500">
            Hesabınız var mı?{' '}
            <Link to="/giris" className="font-semibold text-primary-700 hover:text-primary-800">
              Giriş Yapın
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
