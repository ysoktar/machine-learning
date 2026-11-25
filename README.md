# Yapay Öğrenme: etkileşimli ders çalışma sitesi

BİL/YAP 470 – BİL 570 Yapay Öğrenme (TOBB ETÜ, 2026–2027 Güz) dersinin baştan sona çalışma sitesi. Dersin 12 haftası
tek bir akış olarak anlatılır: her hafta bir önceki haftanın eksiğini kapatır ve bir sonrakine bağlanır. Sınavlar kâğıt
üzerinde ve hesap makinesizdir; site bu yüzden her elle hesabı adım adım öğretir ve sınırsız alıştırma üretir.

**Site:** https://ysoktar.github.io/machine-learning/

## Ne var?

**Konular (12 hafta, tek bölüm).** Giriş ve temel kavramlar; veri, öznitelik ve değerlendirme (PCA, ROC-AUC); kNN ve
model seçimi; doğrusal modeller (en küçük kareler, gradyan inişi, lojistik regresyon, perceptron); karar ağaçları;
topluluk yöntemleri; SVM; yapay sinir ağları; derin öğrenme pratiği ve CNN; diziler, dikkat ve Transformer (RNN, LSTM,
GRU, gömmeler, LLM); gözetimsiz öğrenme ve Naive Bayes (k-ortalamalar, dendrogram, DBSCAN, GMM/EM, otokodlayıcı);
pekiştirmeli öğrenme (MDP, değer yinelemesi, Q-öğrenme) ve güvenilir makine öğrenmesi.

Her hafta sayfası aynı akışı izler:

1. **Nereden geldik, nereye gidiyoruz?** Konunun neden şimdi geldiği ve sonraki haftaya bağı.
2. **Özün özü.** Bütün sayfa beş cümlede; geri kalanı bu cümlelerin açılımı.
3. **Anlatım.** Sezgi kutusu, bağlantılı Türkçe metin, her formülün altında bütün sembolleri açıklayan bir “Burada:”
   kutusu, çizimler; sınavda istenmeyen türetmeler kapalı kutularda.
4. **Etkileşimli araçlar.** Öğrenci kendi verisini, filtresini, ağırlıklarını yazar ya da tıklayarak çizer; ön ayarlar
   ders örneklerini yükler. Her araç sonucu numaralı adımlarla (ne yapılıyor, formül, sayılar, sonuç) ve bir çizimle verir.
   Örnekler: 1B/2B evrişimi konum konum izlemek, kendi görüntüne ve filtrene öznitelik haritası, katman katman CNN
   çizimi, sorguyu taşıyarak dikkat ağırlıkları, koridorda Q-öğrenme ajanı eğitmek, ID3'ün kurduğu ağacın çizimi,
   sürüklenebilir noktalarla kNN, perceptron ve SVM, Boole ifadesinden MLP şeması.
5. **Sınav tipi problemler.** Her çözüm “kullanılan formüller” kutusu ve kısa adımlarla.
6. **Sınırsız alıştırma.** O haftanın hesap kalıplarından her basışta yeni soru, cevap denetimi ve adım adım çözüm.
7. **Sık hatalar, hiperparametre tablosu, kısa sorular** (her yanlış şık için neden yanlış olduğu yazar).

**Sınavlar ve alıştırma.** Final rehberi (bütün dersin kapsamı, soru kalıpları, geçmiş final sorularının sitede nerede
çözüldüğü, adım adım çözümlü deneme soruları, çalışma planı), ara sınav rehberi ve örnek ara sınavın tam çözümü,
alıştırma üreteci (22 hesap türü), hiperparametre tablosu alıştırması, formül kâğıdı, terim ve formül sözlüğü
(terimler sayfalarda altı çizili; üzerine gelince tanım ve İngilizce karşılık çıkar) ve matematik ön bilgisi.

1–11. hafta sayfaları bu dönemin slaytlarından hazırlandı. 12. hafta sayfası, slaytları yayımlanmadan önce izlencedeki
konu listesine ve önceki dönemin ders notlarına dayanarak hazırlandı; slaytlar yayımlanınca güncellenecek.

Bu resmî bir ders sitesi değildir ve ders slaytlarını içermez; anlatımlar yeniden yazılmıştır. Tarih ve kurallar için
ders platformunu ve izlenceyi esas alın. Site statiktir, bağımlılığı yoktur; hiçbir veri tarayıcıdan çıkmaz
(“çalıştım” işaretleri ve alıştırma skoru yalnız tarayıcının yerel deposunda).

## Geliştirme

Node 20 veya üstü gerekir.

```sh
npm run dev     # site/ klasörünü http://localhost:8000 adresinde sunar
npm test        # hesap testleri ve site yapısı (bağlantılar, çapalar, araçlar, sorular)
npm run build   # yayımlanacak siteyi dist/ altına yazar (CSS ve betiklere sürüm etiketi ekler)
```

`main` dalına her gönderimde GitHub Actions testleri çalıştırır ve siteyi GitHub Pages'e yayımlar
(depo ayarlarında Pages kaynağı “GitHub Actions” olmalı).

## Yapı

```
site/
  index.html                 genel bakış, takvim, çalışma sırası
  w1-intro.html … w12-rl.html hafta sayfaları
  exam-final.html, exam-midterm.html, sample-midterm.html, drill.html, hyper.html, cheatsheet.html, sozluk.html, on-bilgi.html
  css/style.css              açık/koyu tema
  js/layout.js               site haritası, menü, başlık, sınama soruları, “çalıştım” işaretleri, İngilizce terimler düğmesi
  js/widgets.js              etkileşimli araçlar ve alıştırma üreteci (<div data-widget="…">)
  js/interactive.js          sürüklenebilir noktalı araçlar (kNN, perceptron, SVM, …)
  js/figures.js              açıklayıcı SVG çizimler (<div data-widget="fig" data-fig="…">)
  js/guides.js               her aracın “ne gösteriyor, nasıl kullanılır” kutusu
  js/glossary.js, glossary-data.js   altı çizili terimler ve tanımları
  js/lib/ml.js               hesaplar (DOM yok, test edilir)
  js/lib/plot.js, editor.js, ui.js   grafikler, nokta düzenleyici, girdi okuma yardımcıları
test/                        node:test (ml.test.mjs: hesaplar; site.test.mjs: yapı)
scripts/                     build ve yerel sunucu
```
