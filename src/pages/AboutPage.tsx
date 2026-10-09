import { Link } from 'react-router-dom';
import { Leaf, Heart, Shield, Truck, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-800 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/39634737/pexels-photo-39634737.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white">Hakkımızda</h1>
          <p className="mt-4 text-lg text-primary-100">Köyden sofranıza, doğal lezzetler.</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-earth-900 mb-4">Hikayemiz</h2>
          <p className="text-earth-600 leading-relaxed">
            Gümüşköyden, Türkiye'nin farklı bölgelerinden gelen doğal, yöresel ve köy ürünlerini
            sofranıza ulaştırmak amacıyla kuruldu. Geleneksel üretim yöntemlerini modern
            teknoloji ile buluşturarak, köylerde üretilen değerli lezzetleri tüm Türkiye ile
            buluşturuyoruz.
          </p>
          <p className="text-earth-600 leading-relaxed mt-4">
            Her ürünü özenle seçiyor, üreticilerle doğrudan çalışıyor ve ürünlerin doğal yapısını
            koruyarak sizlere ulaştırıyoruz. Amacımız, köy ürünlerini değerlendirmek, yerel
            üreticiyi desteklemek ve sofralarınıza gerçek lezzetler taşımak.
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Leaf, title: 'Doğal', desc: 'Katkı maddesi içermeyen ürünler' },
            { icon: Heart, title: 'Samimi', desc: 'Üreticiden özenle seçilmiş' },
            { icon: Shield, title: 'Güvenilir', desc: 'Kaliteli ve izlenebilir ürünler' },
            { icon: Truck, title: 'Hızlı', desc: "Tüm Türkiye'ye teslimat" },
          ].map((v) => (
            <div key={v.title} className="card p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <v.icon size={24} />
              </div>
              <h3 className="font-semibold text-earth-900">{v.title}</h3>
              <p className="mt-1 text-sm text-earth-500">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="card p-8 bg-primary-50 border-primary-100">
          <div className="flex items-start gap-4">
            <Award size={32} className="text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-earth-900 mb-2">Misyonumuz</h2>
              <p className="text-earth-600 leading-relaxed">
                Türkiye'nin dört bir yanındaki köylerde, geleneksel yöntemlerle üretilen doğal
                ürünleri sizinle buluşturmak. Üreticiyi desteklemek, doğal ve sağlıklı ürünlere
                erişimi kolaylaştırmak ve sofralarınıza gerçek lezzetler taşımak için çalışıyoruz.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/urunler" className="btn-primary">Ürünleri Keşfet</Link>
        </div>
      </div>
    </div>
  );
}
