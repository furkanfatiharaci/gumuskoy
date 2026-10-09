import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-earth-900">Sayfa Bulunamadı</h1>
        <p className="mt-2 text-earth-500">Aradığınız sayfa mevcut değil.</p>
        <Link to="/" className="btn-primary mt-6">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}
