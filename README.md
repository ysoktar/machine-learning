# Yapay Öğrenme: ara sınav ve final çalışma sitesi

BİL/YAP 470 – BİL 570 Yapay Öğrenme (TOBB ETÜ, 2026–2027 Güz) için etkileşimli bir çalışma sitesi.
**Ara sınav: 9 Kasım 2026 Pazartesi 16:30** (ders saati, 1–7. haftalar, kâğıt üzerinde, hesap makinesi yok).

- **Hafta sayfaları (1–7)**: veri ve değerlendirme, kNN ve model seçimi, doğrusal modeller, karar ağaçları, topluluk
  yöntemleri, SVM. Her sayfada kısa anlatım, sınav kalıpları, o haftanın hiperparametre satırları ve sınama soruları.
- **Hesaplayıcılar**: sınavda elle yapılan her hesap için tabloyu adım adım kuran bir araç: ölçekleme, karmaşıklık
  matrisi ve ölçütler, ROC-AUC, 2B PCA, kNN (grafiğe tıklayarak), LOO, en küçük kareler, gradyan inişi, lojistik
  regresyon adımı, perceptron (epoch epoch), softmax, ID3 (her düğümde bütün adaylar; Gini ve kazanç oranı), sayısal eşik,
  regresyon ağacı, çoğunluk oyu, bootstrap, AdaBoost, gradyan artırma, SVM marjı, sert marjlı SVM (destek vektörleri,
  w, b ve α), yumuşak marj karşılaştırması, çekirdekler.
- **Ara sınav**: rehber (biçim, süre planı, sık hatalar, kısa sorular), örnek ara sınavın tam çözümü, alıştırma üreteci
  (12 hesap türünde sınırsız rastgele soru, cevap denetimiyle), hiperparametre tablosu alıştırması, formül kâğıdı ve
  sözlük.
- **Final**: yapay sinir ağları (Boole ifadesinden MLP tasarlayan ve doğruluk tablosunu denetleyen araç, 2-2-1 ağında
  ileri/geri yayılım), CNN (elle evrişim, çıktı boyutu, parametre sayısı) ve final rehberi.

Bütün hesaplar `site/js/lib/ml.js` içinde; `test/ml.test.mjs` bunları ders slaytlarındaki, alıştırma kâğıtlarındaki ve
örnek sınavdaki çözümlü örneklere karşı denetler. Site statiktir, bağımlılığı yoktur; hiçbir veri tarayıcıdan çıkmaz
(“çalıştım” işaretleri ve alıştırma skoru yalnız tarayıcının yerel deposunda).

Bu resmî bir ders sitesi değildir ve ders slaytlarını içermez; anlatımlar yeniden yazılmıştır. Tarih ve kurallar için
ders platformunu ve izlenceyi esas alın.

## Geliştirme

Node 20 veya üstü gerekir.

```sh
npm run dev     # site/ klasörünü http://localhost:8000 adresinde sunar
npm test        # hesaplayıcı testleri ve site yapısı (bağlantılar, çapalar, araçlar, sorular)
npm run build   # yayımlanacak siteyi dist/ altına yazar
```

`main` dalına her gönderimde GitHub Actions testleri çalıştırır ve siteyi GitHub Pages'e yayımlar
(depo ayarlarında Pages kaynağı “GitHub Actions” olmalı).

## Yapı

```
site/
  index.html, w1-intro.html … w9-cnn.html, exam-*.html, sample-midterm.html, drill.html, hyper.html, cheatsheet.html
  css/style.css        açık/koyu tema
  js/layout.js         menü, başlık, geri sayım, sınama soruları, "çalıştım" işaretleri
  js/widgets.js        bütün etkileşimli araçlar (<div data-widget="…">)
  js/lib/ml.js         hesaplar (DOM yok, test edilir)
  js/lib/plot.js       SVG grafikler
test/                  node:test
scripts/               build ve yerel sunucu
```
