import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-earth-900">Şifremi Unuttum</h1>
          <p className="mt-1 text-sm text-earth-500">E-posta adresinize sıfırlama bağlantısı gönderilecektir</p>
        </div>

        {success ? (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
              <Mail size={28} className="text-success-600" />
            </div>
            <h2 className="text-lg font-semibold text-earth-900">Bağlantı gönderildi!</h2>
            <p className="mt-2 text-sm text-earth-500">
              E-posta adresinizi kontrol edin ve şifre sıfırlama bağlantısına tıklayın.
            </p>
            <Link to="/giris" className="btn-primary mt-6">Giriş Sayfasına Dön</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="label">E-posta</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="input pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-sm text-earth-500">
              <Link to="/giris" className="font-semibold text-primary-700 hover:text-primary-800">
                Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
