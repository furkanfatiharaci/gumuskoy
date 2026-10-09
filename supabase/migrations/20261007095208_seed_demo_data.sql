/*
# Seed Categories and Products

## Overview
Inserts initial demo data: 7 categories, 12 products, shipping methods already inserted.
*/

-- Categories
INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
VALUES
  ('Kahvaltılık', 'kahvaltilik', 'Bal, reçel, tereyağı, peynir ve daha fazlası', 'https://images.pexels.com/photos/24206926/pexels-photo-24206926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1, true),
  ('Yöresel Ürünler', 'yoresel-urunler', 'Türkiye nin farklı bölgelerinden yöresel lezzetler', 'https://images.pexels.com/photos/39634737/pexels-photo-39634737.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2, true),
  ('Doğal Yağlar', 'dogal-yaglar', 'Kantaron yağı, zeytinyağı, çörek otu yağı ve diğer doğal yağlar', 'https://images.pexels.com/photos/7636382/pexels-photo-7636382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3, true),
  ('Kurutulmuş Ürünler', 'kurutulmus-urunler', 'Kurutulmuş meyveler, sebzeler ve otlar', 'https://images.pexels.com/photos/18435590/pexels-photo-18435590.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4, true),
  ('Bal ve Arı Ürünleri', 'bal-ve-ari-urunleri', 'Çiçek balı, yayla balı, petek bal, polen ve propolis', 'https://images.pexels.com/photos/9228574/pexels-photo-9228574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5, true),
  ('Ev Yapımı Ürünler', 'ev-yapimi-urunler', 'Ev yapımı reçeller, marmelatlar, turşular, salçalar ve soslar', 'https://images.pexels.com/photos/15209691/pexels-photo-15209691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6, true),
  ('Hediyelik Ürünler', 'hediyelik-urunler', 'Köy ürünleri hediye kutuları, kahvaltı setleri ve özel paketler', 'https://images.pexels.com/photos/33315959/pexels-photo-33315959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (category_id, name, slug, short_description, description, price, discount_price, stock, gram, region, ingredients, storage, shipping_info, image_url, is_active, is_featured, popularity, seo_title, seo_description)
SELECT c.id, v.name, v.slug, v.short_description, v.description, v.price, v.discount_price, v.stock, v.gram, v.region, v.ingredients, v.storage, v.shipping_info, v.image_url, v.is_active, v.is_featured, v.popularity, v.seo_title, v.seo_description
FROM categories c
RIGHT JOIN (VALUES
  ('kahvaltilik', 'Gümüşhane Köy Reçeli', 'gumushane-koy-receli', 'Geleneksel yöntemle yapılan köy reçeli', 'Gümüşhane yöresinde, geleneksel yöntemlerle üretilen doğal köy reçeli. Şeker katkısı içermez, mevsim meyvelerinden yapılır.', 85.00, 69.00, 120, '450g', 'Gümüşhane', 'Çilek, şeker, limon suyu', 'Serin ve kuru yerde saklayınız', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/26341194/pexels-photo-26341194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 150, 'Gümüşhane Köy Reçeli - Doğal ve Yöresel', 'Geleneksel yöntemle yapılan doğal Gümüşhane köy reçeli. Şeker katkısı içermez.'),
  ('kahvaltilik', 'Köy Tereyağı', 'koy-tereyagi', 'Köyde geleneksel yöntemle üretilen taze tereyağı', 'Köyde geleneksel yöntemlerle üretilen, doğal süt kaymağından yapılan taze tereyağı.', 120.00, NULL, 80, '500g', 'Trabzon', 'Pastörize süt kaymağı', 'Buzdolabında saklayınız', 'Soğuk zincir kargo', 'https://images.pexels.com/photos/24206926/pexels-photo-24206926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 130, 'Köy Tereyağı - Doğal Süt Kaymağından', 'Geleneksel yöntemle üretilen doğal köy tereyağı.'),
  ('bal-ve-ari-urunleri', 'Doğal Çiçek Balı', 'dogal-cicek-bali', 'Yayla çiçeklerinden doğal bal', 'Anadolu yaylalarında, binbir çeşit çiçekten polen toplayan arılardan elde edilen doğal çiçek balı. Süzme olarak sunulur.', 180.00, 149.00, 200, '750g', 'Anadolu Yaylaları', 'Çiçek nektarı', 'Oda sıcaklığında, güneş görmeyen yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/9228574/pexels-photo-9228574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 250, 'Doğal Çiçek Balı - Yayla Çiçeklerinden', 'Anadolu yaylalarından doğal süzme çiçek balı.'),
  ('bal-ve-ari-urunleri', 'Yayla Balı', 'yayla-bali', 'Yüksek rakımlı yaylalardan doğal bal', '2000 metre rakımlı yaylalardan elde edilen, aromatik ve zengin lezzetli doğal yayla balı.', 220.00, NULL, 90, '1kg', 'Bayburt Yaylaları', 'Yayla çiçek nektarı', 'Oda sıcaklığında, güneş görmeyen yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/27433887/pexels-photo-27433887.png?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 180, 'Yayla Balı - Yüksek Rakım Doğal Bal', '2000 metre rakımdan doğal yayla balı.'),
  ('bal-ve-ari-urunleri', 'Petek Bal', 'petek-bal', 'Doğal petek içinde saf bal', 'Arıların petek içinde olgunlaştırdığı, hiç işleme uğramamış saf petek balı.', 280.00, 239.00, 60, '500g', 'Gümüşhane', 'Çiçek nektarı, balmumu', 'Oda sıcaklığında', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/38773865/pexels-photo-38773865.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 95, 'Petek Bal - Doğal Petek İçinde Saf Bal', 'İşleme uğramamış saf petek balı.'),
  ('ev-yapimi-urunler', 'Ev Yapımı Çilek Reçeli', 'ev-yapimi-cilek-receli', 'Taze çilekten ev yapımı reçel', 'Yaz mevsiminde toplanan taze çileklerle, ev ortamında geleneksel tariflerle hazırlanan reçel.', 75.00, 59.00, 150, '400g', 'Giresun', 'Çilek, toz şeker, limon suyu', 'Serin yerde saklayınız', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/26341194/pexels-photo-26341194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 170, 'Ev Yapımı Çilek Reçeli - Taze Çilekten', 'Taze çileklerle geleneksel tarifle ev yapımı reçel.'),
  ('ev-yapimi-urunler', 'Karadut Pekmezi', 'karadut-pekmezi', 'Doğal karadut meyvesinden geleneksel pekmez', 'Karadut meyvesinden geleneksel yöntemlerle üretilen, demir açısından zengin doğal pekmez.', 95.00, NULL, 100, '450g', 'Gümüşhane', 'Karadut meyvesi', 'Serin ve kuru yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/15209691/pexels-photo-15209691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 140, 'Karadut Pekmezi - Doğal ve Demir Zengini', 'Karadut meyvesinden geleneksel pekmez.'),
  ('ev-yapimi-urunler', 'Ev Yapımı Salça', 'ev-yapimi-salca', 'Köyde geleneksel yöntemle yapılan domates salçası', 'Köyde, tam olgunlaşmış domateslerden geleneksel yöntemlerle üretilen ev yapımı salça.', 65.00, 49.00, 180, '700g', 'Gaziantep', 'Domates, tuz', 'Serin yerde, açıldıktan sonra buzdolabında', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/16767580/pexels-photo-16767580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 110, 'Ev Yapımı Salça - Geleneksel Domates Salçası', 'Köyde geleneksel yöntemle yapılan domates salçası.'),
  ('ev-yapimi-urunler', 'Köy Turşusu', 'koy-tursusu', 'Fermante edilmiş doğal köy turşusu', 'Köyde geleneksel fermantasyon yöntemiyle hazırlanan, çeşitli sebzelerden oluşan doğal turşu.', 55.00, NULL, 130, '1kg', 'Trabzon', 'Lahana, salatalık, havuç, biber, sarımsak, tuz, su', 'Serin yerde, açıldıktan sonra buzdolabında', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/13661817/pexels-photo-13661817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 85, 'Köy Turşusu - Geleneksel Fermantasyon', 'Doğal fermantasyonla yapılan köy turşusu.'),
  ('dogal-yaglar', 'Kantaron Yağı', 'kantaron-yagi', 'Doğal kantaron bitkisinden soğuk pres yağ', 'Dağlarda doğal olarak yetişen kantaron bitkisinden soğuk pres yöntemiyle elde edilen doğal yağ.', 110.00, 89.00, 70, '100ml', 'Anadolu Dağları', 'Kantaron bitkisi özü, zeytinyağı', 'Serin ve kuru yerde, güneş görmeyen', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/29387145/pexels-photo-29387145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 160, 'Kantaron Yağı - Soğuk Pres Doğal Yağ', 'Dağ kantaronundan soğuk pres doğal yağ.'),
  ('dogal-yaglar', 'Doğal Zeytinyağı', 'dogal-zeytinyagi', 'Soğuk sıkım naturel zeytinyağı', 'Ege bölgesinde, erken hasat zeytinlerden soğuk sıkım yöntemiyle elde edilen sızma zeytinyağı.', 160.00, NULL, 110, '1L', 'Aydın', 'Erken hasat zeytin', 'Serin ve karanlık yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/7636382/pexels-photo-7636382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 200, 'Doğal Zeytinyağı - Erken Hasat Soğuk Sıkım', 'Ege bölgesinden erken hasat sızma zeytinyağı.'),
  ('dogal-yaglar', 'Çörek Otu Yağı', 'corek-otu-yagi', 'Soğuk pres çörek otu yağı', 'Soğuk pres yöntemiyle elde edilen, hiçbir kimyasal işlem görmemiş saf çörek otu yağı.', 140.00, 119.00, 85, '250ml', 'Anadolu', 'Çörek otu', 'Serin ve kuru yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/29387140/pexels-photo-29387140.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 120, 'Çörek Otu Yağı - Soğuk Pres Saf Yağ', 'Soğuk pres yöntemiyle saf çörek otu yağı.'),
  ('kurutulmus-urunler', 'Doğal Elma Kurusu', 'dogal-elma-kurusu', 'Güneşte kurutulmuş doğal elma', 'Güneşte doğal olarak kurutulmuş, katkısız elma kurusu. Sağlıklı atıştırmalık.', 70.00, NULL, 140, '500g', 'Amasya', 'Elma', 'Serin ve kuru yerde', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/8992915/pexels-photo-8992915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 100, 'Doğal Elma Kurusu - Güneşte Kurutulmuş', 'Güneşte kurutulmuş katkısız elma kurusu.'),
  ('kurutulmus-urunler', 'Kurutulmuş Domates', 'kurutulmus-domates', 'Zeytinyağlı kurutulmuş domates', 'Güneşte kurutulmuş domateslerin zeytinyağı ve kekikle hazırlanmış hali.', 85.00, 69.00, 90, '300g', 'Aydın', 'Domates, zeytinyağı, kekik, sarımsak', 'Buzdolabında saklayınız', 'Tüm Türkiye''ye kargo', 'https://images.pexels.com/photos/30007504/pexels-photo-30007504.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 75, 'Kurutulmuş Domates - Zeytinyağlı ve Kekikli', 'Güneşte kurutulmuş zeytinyağlı domates.'),
  ('hediyelik-urunler', 'Kahvaltı Seti', 'kahvalti-seti', 'Doğal kahvaltı ürünlerinden oluşan hediye seti', 'Bal, reçel, tereyağı ve peynir içeren, özel hediye kutusunda sunulan doğal kahvaltı seti.', 350.00, 299.00, 40, 'Set', 'Karışık', 'Bal, reçel, tereyağı, peynir', 'Buzdolabında saklayınız', 'Özel hediye paketinde kargo', 'https://images.pexels.com/photos/33315959/pexels-photo-33315959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, true, 90, 'Kahvaltı Seti - Doğal Hediye Paketi', 'Doğal kahvaltı ürünlerinden özel hediye seti.'),
  ('hediyelik-urunler', 'Yöresel Hediye Kutusu', 'yoresel-hediye-kutusu', 'Farklı yörelerden lezzetler içeren hediye kutusu', 'Türkiye nin farklı yörelerinden seçilmiş doğal ürünlerin bir araya getirildiği özel hediye kutusu.', 450.00, NULL, 30, 'Set', 'Karışık', 'Pekmez, bal, reçel, salça, kurutulmuş meyve', 'Serin ve kuru yerde', 'Özel hediye paketinde kargo', 'https://images.pexels.com/photos/11576164/pexels-photo-11576164.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', true, false, 60, 'Yöresel Hediye Kutusu - Seçkin Lezzetler', 'Farklı yörelerden doğal ürünlerden hediye kutusu.')
) AS v(cat_slug, name, slug, short_description, description, price, discount_price, stock, gram, region, ingredients, storage, shipping_info, image_url, is_active, is_featured, popularity, seo_title, seo_description)
ON v.cat_slug = c.slug
ON CONFLICT (slug) DO NOTHING;

-- Insert product images for each product
INSERT INTO product_images (product_id, image_url, sort_order)
SELECT p.id, v.img_url, v.sort_order
FROM products p
JOIN (VALUES
  ('gumushane-koy-receli', 'https://images.pexels.com/photos/26341194/pexels-photo-26341194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('gumushane-koy-receli', 'https://images.pexels.com/photos/15209691/pexels-photo-15209691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('koy-tereyagi', 'https://images.pexels.com/photos/24206926/pexels-photo-24206926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('dogal-cicek-bali', 'https://images.pexels.com/photos/9228574/pexels-photo-9228574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('dogal-cicek-bali', 'https://images.pexels.com/photos/27433887/pexels-photo-27433887.png?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('yayla-bali', 'https://images.pexels.com/photos/27433887/pexels-photo-27433887.png?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('petek-bal', 'https://images.pexels.com/photos/38773865/pexels-photo-38773865.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('ev-yapimi-cilek-receli', 'https://images.pexels.com/photos/26341194/pexels-photo-26341194.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('ev-yapimi-cilek-receli', 'https://images.pexels.com/photos/15209696/pexels-photo-15209696.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('karadut-pekmezi', 'https://images.pexels.com/photos/15209691/pexels-photo-15209691.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('ev-yapimi-salca', 'https://images.pexels.com/photos/16767580/pexels-photo-16767580.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('koy-tursusu', 'https://images.pexels.com/photos/13661817/pexels-photo-13661817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('koy-tursusu', 'https://images.pexels.com/photos/13661818/pexels-photo-13661818.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('kantaron-yagi', 'https://images.pexels.com/photos/29387145/pexels-photo-29387145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('dogal-zeytinyagi', 'https://images.pexels.com/photos/7636382/pexels-photo-7636382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('corek-otu-yagi', 'https://images.pexels.com/photos/29387140/pexels-photo-29387140.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('dogal-elma-kurusu', 'https://images.pexels.com/photos/8992915/pexels-photo-8992915.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('kurutulmus-domates', 'https://images.pexels.com/photos/30007504/pexels-photo-30007504.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('kahvalti-seti', 'https://images.pexels.com/photos/33315959/pexels-photo-33315959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
  ('yoresel-hediye-kutusu', 'https://images.pexels.com/photos/11576164/pexels-photo-11576164.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0)
) AS v(slug, img_url, sort_order)
ON v.slug = p.slug
ON CONFLICT DO NOTHING;
