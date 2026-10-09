import { Link } from 'react-router-dom';
import { Truck, Shield, Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-earth-100 bg-earth-50">
      {/* Trust badges */}
      <div className="border-b border-earth-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center">
              <Truck className="text-primary-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-earth-800">Hızlı Kargo</p>
                <p className="text-xs text-earth-500">Tüm Türkiye'ye teslimat</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Shield className="text-primary-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-earth-800">Güvenli Ödeme</p>
                <p className="text-xs text-earth-500">PCI-DSS uyumlu sistem</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Leaf className="text-primary-600" size={28} />
              <div>
                <p className="text-sm font-semibold text-earth-800">Doğal Ürünler</p>
                <p className="text-xs text-earth-500">Köyden sofranıza</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-earth-600 max-w-xs">
              Türkiye'nin farklı bölgelerinden gelen doğal, yöresel ve köy ürünlerini
              sofranıza ulaştırıyoruz.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-earth-800 mb-4">Kurumsal</h3>
            <ul className="space-y-2">
              <li><Link to="/hakkimizda" className="text-sm text-earth-600 hover:text-primary-700">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="text-sm text-earth-600 hover:text-primary-700">İletişim</Link></li>
              <li><Link to="/urunler" className="text-sm text-earth-600 hover:text-primary-700">Ürünler</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-earth-800 mb-4">Hesabım</h3>
            <ul className="space-y-2">
              <li><Link to="/giris" className="text-sm text-earth-600 hover:text-primary-700">Giriş Yap</Link></li>
              <li><Link to="/kayit-ol" className="text-sm text-earth-600 hover:text-primary-700">Üye Ol</Link></li>
              <li><Link to="/hesabim" className="text-sm text-earth-600 hover:text-primary-700">Hesabım</Link></li>
              <li><Link to="/sepet" className="text-sm text-earth-600 hover:text-primary-700">Sepetim</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-earth-800 mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-earth-600">
                <Phone size={16} className="text-primary-600" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-earth-600">
                <Mail size={16} className="text-primary-600" />
                <span>info@gumuskoyden.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-earth-600">
                <MapPin size={16} className="text-primary-600" />
                <span>Gümüşhane, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-earth-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-earth-500">
            © 2026 Gümüşköyden. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-earth-500">
            Köyden sofranıza, doğal lezzetler.
          </p>
        </div>
      </div>
    </footer>
  );
}
