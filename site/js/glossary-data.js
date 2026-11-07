// Generated from the glossary page data: hover definitions for terms (see glossary.js).
export const TERMS = [
{
"term": "Accuracy",
"def": "Bütün tahminlerin yüzde kaçı doğru? En sezgisel ölçüt ama sınıflar dengesizse yanıltır: 1000 işlemin 20'si sahteyse “hepsi normal” diyen model %98 alır. ((TP + TN) / n)",
"id": "t-accuracy-dogruluk",
"match": "accuracy"
},
{
"term": "AdaBoost",
"def": "Zayıf modelleri (genelde tek sorulu karar kütükleri) sırayla eğitir; her turda yanlış bilinen örneklerin ağırlığını artırır ki sonraki model onlara odaklansın. Sonunda modeller α ağırlıklı oy verir. (α = ½ ln((1 − ε)/ε))",
"id": "t-adaboost",
"match": "AdaBoost"
},
{
"term": "Ağırlık",
"def": "Modelin öğrendiği sayılardan biri: bir özniteliğin karara ne kadar ve hangi yönde katkı yaptığı. w = (2, −1) ise x₁ artınca skor artar, x₂ artınca azalır. (ŷ = w·x + b)",
"id": "t-agirlik",
"match": "ağırlık"
},
{
"term": "Aktarımlı öğrenme",
"def": "Büyük bir veri setinde önceden eğitilmiş bir modeli alıp kendi küçük verinizde yalnız son katmanlarını eğitmek (ya da hafifçe ince ayar yapmak). Erken katmanlar kenar, doku gibi genel desenleri zaten öğrenmiştir.",
"id": "t-aktarimli-ogrenme",
"match": "aktarımlı öğrenme"
},
{
"term": "Aşırı uyum",
"def": "Modelin eğitim verisini, gürültüsüyle birlikte ezberlemesi: eğitim hatası çok düşük, yeni verideki hata yüksek. Sınavı ezberleyip konuyu anlamamış öğrenci gibi. (eğitim ≪ doğrulama hatası)",
"id": "t-asiri-uyum",
"match": "aşırı uyum"
},
{
"term": "AUC",
"def": "ROC eğrisinin altındaki alan. Rastgele seçilen bir pozitife, rastgele seçilen bir negatiften daha yüksek skor verme olasılığı. 0.5 rastgele, 1 kusursuz; eşik seçmekten bağımsızdır. (doğru sıralı (pozitif, negatif) çift / (P·N))",
"id": "t-auc",
"match": "AUC"
},
{
"term": "Bagging",
"def": "Veriden yerine koyarak çekilmiş birçok örneklem (bootstrap) oluşturup her birinde ayrı model eğitmek ve oylarını birleştirmek. Tek tek kararsız modellerin (derin ağaçların) varyansını azaltır.",
"id": "t-bagging-torbalama",
"match": "bagging|torbalama"
},
{
"term": "Batch, mini-batch, SGD",
"def": "Gradyanı her adımda kaç örnekle hesapladığımız: hepsiyle (batch), tek örnekle (SGD) ya da 32–512 örnekle (mini-batch, derin öğrenmede standart).",
"id": "t-batch-mini-batch-sgd",
"match": "mini-batch|SGD"
},
{
"term": "Bias",
"def": "Doğrusal modeldeki sabit sayı: karar sınırını orijinden kaydırır. “Yanlılık-varyans”taki yanlılıkla aynı kelime ama farklı kavram. (ŷ = w·x + b)",
"id": "t-bias-yanlilik-terimi-b",
"match": "bias"
},
{
"term": "Bilgi kazancı",
"def": "Bir özniteliğe göre bölünce belirsizliğin (entropinin) ne kadar azaldığı. ID3 her düğümde kazancı en büyük özniteliği seçer. (IG = H(D) − Σ (|D_v|/|D|)·H(D_v))",
"id": "t-bilgi-kazanci",
"match": "bilgi kazanc|bilgi kazanım"
},
{
"term": "Boosting",
"def": "Modelleri sırayla eğitip her yenisini öncekilerin hatalarına odaklayan topluluk yöntemi (AdaBoost, gradyan artırma). Yanlılığı azaltır.",
"id": "t-boosting-artirma",
"match": "boosting"
},
{
"term": "Bootstrap örneklemi",
"def": "n örnekten yerine koyarak n örnek çekmek. Bazı örnekler birkaç kez, ortalama %37'si hiç seçilmez (torba dışı). ((1 − 1/n)ⁿ → 0.368)",
"id": "t-bootstrap-orneklemi",
"match": "bootstrap"
},
{
"term": "Boyut laneti",
"def": "Öznitelik sayısı arttıkça uzay o kadar hızlı büyür ki veri seyrekleşir ve bütün uzaklıklar birbirine benzer; “en yakın komşu” anlamını yitirir.",
"id": "t-boyut-laneti",
"match": "boyut laneti"
},
{
"term": "Budama",
"def": "Karar ağacını küçültmek: ya büyümeden durdurmak (ön budama) ya da tam büyütüp yararsız dalları kesmek (sonradan budama). Aşırı uyuma karşı. (R_α(T) = R(T) + α·|T|)",
"id": "t-budama",
"match": "budama"
},
{
"term": "Çapraz doğrulama",
"def": "Veriyi k parçaya bölüp her seferinde birini doğrulama, kalanını eğitim yaparak k kez değerlendirmek; sonucun ortalaması ± std. Küçük veride tek bölmeden daha güvenilir. (k-katlı CV)",
"id": "t-capraz-dogrulama",
"match": "çapraz doğrulama"
},
{
"term": "Çekirdek",
"def": "İki noktanın “benzerliğini” ölçen fonksiyon; SVM'de veriyi açıkça yüksek boyuta taşımadan oradaki iç çarpımı hesaplamayı sağlar (çekirdek hilesi). (RBF: exp(−γ‖x − z‖²))",
"id": "t-cekirdek-kernel",
"match": "çekirdek|kernel"
},
{
"term": "Çoğunluk sınıfı",
"def": "Hiçbir şey öğrenmeden her örneğe en sık sınıfı söylemek. Her model en azından bunu geçmeli.",
"id": "t-cogunluk-sinifi-taban-cizgisi",
"match": "taban çizgisi|çoğunluk sınıfı"
},
{
"term": "Destek vektörü",
"def": "SVM'de karar sınırına en yakın, “sokağın” kenarına değen noktalar. Çözüm yalnız onlara bağlıdır; diğer noktaları silmek sınırı değiştirmez. (y·(w·x + b) = 1)",
"id": "t-destek-vektoru",
"match": "destek vektör"
},
{
"term": "Doğrulama kümesi",
"def": "Hiperparametre seçmek ve modelleri karşılaştırmak için ayrılan veri. Test kümesi en sona saklanır.",
"id": "t-dogrulama-kumesi",
"match": "doğrulama kümesi"
},
{
"term": "Dropout",
"def": "Eğitimde her adımda nöronların bir kısmını rastgele kapatmak; ağ tek bir nörona güvenmeyi öğrenmez. Düzenlileştiricidir.",
"id": "t-dropout-seyreltme",
"match": "dropout|seyreltme"
},
{
"term": "Düzenlileştirme",
"def": "Kayba “karmaşıklık cezası” ekleyerek modeli basit kalmaya zorlamak (ridge, lasso, budama, dropout). Aşırı uyumu azaltır, biraz yanlılık ekler. (min kayıp + λ·ceza)",
"id": "t-duzenlilestirme",
"match": "düzenlileştirme"
},
{
"term": "Entropi",
"def": "Bir kümenin ne kadar “karışık” olduğu. Hepsi aynı sınıfsa 0, iki sınıf yarı yarıyaysa 1 bit. “Bu örneğin sınıfını öğrenmek için ortalama kaç evet/hayır sorusu gerekir?” (H = −Σ pᵢ log₂ pᵢ)",
"id": "t-entropi",
"match": "entropi"
},
{
"term": "Epoch",
"def": "Eğitim verisinin tamamının üzerinden bir kez geçmek.",
"id": "t-epoch",
"match": "epoch"
},
{
"term": "Erken durdurma",
"def": "Doğrulama hatası birkaç epoch boyunca iyileşmezse eğitimi durdurmak; aşırı uyum başlamadan en iyi noktada kalmak.",
"id": "t-erken-durdurma",
"match": "erken durdurma"
},
{
"term": "Eşik",
"def": "Skoru sınıfa çeviren sınır: p ≥ 0.5 ise pozitif. Eşiği değiştirmek precision/recall dengesini değiştirir. Ağaçlarda “x ≤ 4” bölmesindeki 4 de bir eşiktir.",
"id": "t-esik",
"match": "eşik"
},
{
"term": "Etkinleştirme işlevi",
"def": "Nöronun toplamını (z) çıktıya çeviren doğrusal olmayan fonksiyon: sigmoid, tanh, ReLU, step, sign. (h = g(z))",
"id": "t-etkinlestirme-islevi",
"match": "etkinleştirme"
},
{
"term": "Evrişim",
"def": "Küçük bir filtreyi görüntü (ya da sinyal) üzerinde kaydırıp her konumda çarpımların toplamını almak. Aynı filtre her yerde kullanıldığı için parametre azdır. (çıktı = ⌊(n + 2p − k)/s⌋ + 1)",
"id": "t-evrisim",
"match": "evrişim"
},
{
"term": "F1",
"def": "Precision ve recall'un harmonik ortalaması: ikisi de yüksekse yüksek. Dengesiz veride accuracy'den çok daha bilgilendirici. (2PR/(P + R) = 2TP/(2TP + FP + FN))",
"id": "t-f1",
"match": "F1"
},
{
"term": "Genelleme",
"def": "Modelin görmediği yeni veride de iyi çalışması. Makine öğrenmesinin asıl amacı.",
"id": "t-genelleme",
"match": "genelleme"
},
{
"term": "Geri yayılım",
"def": "Sinir ağında kaybın her ağırlığa göre türevini, çıktıdan girdiye doğru zincir kuralıyla verimli hesaplamak. (δ = δ_sonraki·v·g′(z))",
"id": "t-geri-yayilim",
"match": "geri yayılım"
},
{
"term": "Gevşek değişken",
"def": "Yumuşak marjlı SVM'de bir noktanın marj kuralını ne kadar çiğnediği: 0 = sorun yok, 0–1 arası sokağın içinde, 1'den büyük yanlış tarafta. (ξ = max(0, 1 − y·f(x)))",
"id": "t-gevsek-degisken",
"match": "gevşek değişken"
},
{
"term": "Gini safsızlığı",
"def": "Entropiye benzer karışıklık ölçüsü (CART kullanır): rastgele iki örnek çekince farklı sınıftan olma olasılığı. (1 − Σ pᵢ²)",
"id": "t-gini-safsizligi",
"match": "gini"
},
{
"term": "Gradyan",
"def": "Kaybın her parametreye göre türevlerinden oluşan vektör; kaybın en hızlı arttığı yön. Ters yöne gidilir. (∇L)",
"id": "t-gradyan",
"match": "gradyan(?! inişi| artırma)"
},
{
"term": "Gradyan artırma",
"def": "Her turda, o ana kadarki modelin kalıntılarına (hatalarına) küçük bir ağaç uydurup η ile çarparak eklemek. (F ← F + η·f)",
"id": "t-gradyan-artirma",
"match": "gradyan artırma"
},
{
"term": "Gradyan inişi",
"def": "Kaybı küçültmek için parametreleri gradyanın tersi yönünde küçük adımlarla güncellemek. (w ← w − η∇L)",
"id": "t-gradyan-inisi",
"match": "gradyan inişi"
},
{
"term": "Hiperparametre",
"def": "Eğitimle öğrenilmeyen, bizim seçtiğimiz ayar: kNN'de k, ağaçta derinlik, SVM'de C ve γ, öğrenme oranı. Doğrulama kümesi ya da CV ile seçilir.",
"id": "t-hiperparametre",
"match": "hiperparametre"
},
{
"term": "Hipotez uzayı",
"def": "Modelin ifade edebildiği bütün fonksiyonlar. Doğrusal modelin hipotez uzayı bütün doğrulardır; öğrenme bu uzayda iyi bir hipotez aramaktır.",
"id": "t-hipotez-uzayi",
"match": "hipotez uzayı"
},
{
"term": "i.i.d.",
"def": "Eğitim ve test örneklerinin aynı dağılımdan ve birbirinden bağımsız geldiği varsayımı. Bozulursa (zaman serisi, aynı hastanın görüntüleri) skorlar iyimser çıkar.",
"id": "t-i-i-d",
"match": "i\\.i\\.d\\."
},
{
"term": "ID3",
"def": "Karar ağacı kurma algoritması: her düğümde bilgi kazancı en yüksek özniteliğe göre böl, dallarda tekrarla.",
"id": "t-id3",
"match": "ID3"
},
{
"term": "İleri yayılım",
"def": "Girdiden başlayıp katman katman çıktıyı ve kaybı hesaplamak.",
"id": "t-i-leri-yayilim",
"match": "ileri yayılım"
},
{
"term": "Kalıntı",
"def": "Gerçek değer ile tahmin arasındaki fark: y − ŷ.",
"id": "t-kalinti-artik",
"match": "kalıntı"
},
{
"term": "Karar kütüğü",
"def": "Tek bölmeli (derinliği 1) karar ağacı: “x₂ ≥ 0.5 ise Evet”. AdaBoost'un tipik zayıf öğrenicisi.",
"id": "t-karar-kutugu",
"match": "karar kütüğü"
},
{
"term": "Karar sınırı",
"def": "Modelin bir sınıftan diğerine geçtiği çizgi/yüzey. Doğrusal modelde w·x + b = 0 doğrusu.",
"id": "t-karar-siniri",
"match": "karar sınırı"
},
{
"term": "Karmaşıklık matrisi",
"def": "Gerçek sınıfa (satır) ve tahmine (sütun) göre örnekleri sayan 2×2 tablo: TP, FN, FP, TN. Bütün sınıflandırma ölçütleri buradan çıkar.",
"id": "t-karmasiklik-matrisi",
"match": "karmaşıklık matrisi|karışıklık matrisi"
},
{
"term": "Kayıp",
"def": "Tek bir tahminin ne kadar kötü olduğunu ölçen sayı. Eğitim, ortalama kaybı küçültmektir. (kare: (y − ŷ)², log-loss, menteşe)",
"id": "t-kayip-fonksiyonu",
"match": "kayıp fonksiyonu|kayıp|kaybı|kaybın"
},
{
"term": "Kazanç oranı",
"def": "Bilgi kazancının bölme bilgisine bölünmesi; çok değerli öznitelikleri (müşteri no gibi) kayırmayı düzeltir (C4.5). (IG / SplitInfo)",
"id": "t-kazanc-orani",
"match": "kazanç oranı"
},
{
"term": "kNN",
"def": "Yeni örneği, eğitim verisindeki en yakın k komşusunun çoğunluk oyuyla sınıflamak. Eğitimde hiçbir şey öğrenmez, yalnız veriyi saklar.",
"id": "t-knn",
"match": "kNN"
},
{
"term": "Kovaryans",
"def": "İki değişkenin birlikte nasıl değiştiği: biri artarken öteki de artıyorsa pozitif. (Σ(x − x̄)(y − ȳ)/(n − 1))",
"id": "t-kovaryans",
"match": "kovaryans"
},
{
"term": "Lasso",
"def": "Ağırlıkların mutlak değerleri toplamını cezalandıran düzenlileştirme; bazı ağırlıkları tam sıfır yaparak öznitelik seçer. (L + λΣ|wⱼ|)",
"id": "t-lasso",
"match": "lasso"
},
{
"term": "Log-loss",
"def": "Olasılık tahminlerinin kaybı: doğru sınıfa verilen olasılığın negatif logaritması. Emin olup yanılmayı çok ağır cezalandırır. (−[y ln p + (1 − y) ln(1 − p)])",
"id": "t-log-loss-capraz-entropi",
"match": "log-loss|çapraz entropi"
},
{
"term": "Lojistik regresyon",
"def": "Doğrusal skoru sigmoidden geçirerek pozitif sınıfın olasılığını veren sınıflandırıcı. Adı “regresyon” ama sınıflandırma yapar. (p = σ(w·x + b))",
"id": "t-lojistik-regresyon",
"match": "lojistik regresyon"
},
{
"term": "Marj",
"def": "SVM'de karar sınırı ile en yakın noktalar arasındaki uzaklık. SVM bunu en büyük yapan sınırı seçer. (1/‖w‖)",
"id": "t-marj",
"match": "marj"
},
{
"term": "Menteşe kaybı",
"def": "SVM'nin kaybı: nokta doğru tarafta ve marjın dışındaysa 0, değilse marja ne kadar girdiyse o kadar. (max(0, 1 − y·f(x)))",
"id": "t-mentese-kaybi",
"match": "menteşe kaybı"
},
{
"term": "min-max ölçekleme",
"def": "Değerleri [0, 1] aralığına sıkıştırmak. ((x − min)/(max − min))",
"id": "t-min-max-olcekleme",
"match": "min-max"
},
{
"term": "MLP",
"def": "Nöronların katmanlar hâlinde bağlandığı sinir ağı; gizli katmanlar sayesinde XOR gibi doğrusal olmayan problemleri çözer.",
"id": "t-mlp-cok-katmanli-algilayici",
"match": "MLP|çok katmanlı algılayıcı"
},
{
"term": "MSE, MAE, RMSE",
"def": "Regresyon hata ölçütleri: hataların karelerinin ortalaması, mutlak değerlerinin ortalaması, MSE'nin karekökü.",
"id": "t-mse-mae-rmse",
"match": "MSE|MAE|RMSE"
},
{
"term": "Normalleştirme",
"def": "Öznitelikleri karşılaştırılabilir ölçeğe getirmek (min-max, z-score). Uzaklık ve gradyan temelli yöntemler için şart.",
"id": "t-normallestirme",
"match": "normalleştirme|normalizasyon"
},
{
"term": "One-hot kodlama",
"def": "Sırasız bir kategoriyi her değer için ayrı 0/1 sütunuyla göstermek: Ankara = (1, 0, 0).",
"id": "t-one-hot-kodlama",
"match": "one-hot"
},
{
"term": "OOB hata",
"def": "Her örneği, onu eğitimde hiç görmemiş ağaçların oyuyla tahmin edip ölçülen hata: bagging'de bedava doğrulama.",
"id": "t-oob-torba-disi-hata",
"match": "OOB|torba dışı"
},
{
"term": "Öğrenme oranı",
"def": "Gradyan inişinde her adımın büyüklüğü. Küçükse yavaş, büyükse savrulur ya da ıraksar.",
"id": "t-ogrenme-orani",
"match": "öğrenme oranı"
},
{
"term": "Öznitelik",
"def": "Bir örneği anlatan ölçülebilir özellik: yaş, gelir, piksel değeri. Tablodaki bir sütun.",
"id": "t-oznitelik",
"match": "öznitelik"
},
{
"term": "Öznitelik seçimi / çıkarımı",
"def": "Seçim: var olan sütunlardan bir alt küme tutmak (yorumlanabilir). Çıkarım: eskilerden yeni sütunlar türetmek (PCA).",
"id": "t-oznitelik-secimi-cikarimi",
"match": "öznitelik seçimi|öznitelik çıkarımı"
},
{
"term": "PCA",
"def": "Veriyi en çok yayıldığı (varyansı en büyük) dik yönlere döndürüp az sayıda yönle özetlemek. Etiket kullanmaz. (λₖ/Σλ açıklanan varyans)",
"id": "t-pca",
"match": "PCA"
},
{
"term": "Perceptron",
"def": "En basit doğrusal sınıflandırıcı: skor ≥ 0 ise +1. Yalnız yanlış sınıfladığı örnekte ağırlıklarını o örneğe doğru çeker. (hatada w ← w + η·y·x)",
"id": "t-perceptron-algilayici",
"match": "perceptron|algılayıcı"
},
{
"term": "Precision",
"def": "“Pozitif dediklerimin kaçı gerçekten pozitif?” Yanlış alarm (FP) pahalıysa önemli (spam filtresi). (TP/(TP + FP))",
"id": "t-precision-kesinlik",
"match": "precision|kesinlik"
},
{
"term": "Rastgele orman",
"def": "Bootstrap örneklemleri + her bölmede rastgele öznitelik alt kümesiyle eğitilmiş birçok ağacın oyu. (m ≈ √p)",
"id": "t-rastgele-orman",
"match": "rastgele orman"
},
{
"term": "Recall",
"def": "“Gerçek pozitiflerin kaçını yakaladım?” Kaçırmak (FN) pahalıysa önemli (kanser taraması). (TP/(TP + FN))",
"id": "t-recall-duyarlilik-tpr",
"match": "recall|duyarlılık"
},
{
"term": "Ridge",
"def": "Ağırlıkların kareleri toplamını cezalandıran düzenlileştirme; ağırlıkları küçültür ama sıfırlamaz. (L + λΣwⱼ²)",
"id": "t-ridge",
"match": "ridge"
},
{
"term": "ROC eğrisi",
"def": "Eşik değiştikçe (FPR, TPR) noktalarının çizdiği eğri.",
"id": "t-roc-egrisi",
"match": "ROC"
},
{
"term": "R²",
"def": "Regresyon modelinin “hep ortalamayı söylemek”e göre ne kadar iyi olduğu: 1 kusursuz, 0 ortalama kadar, negatif daha kötü. (1 − SSE/SST)",
"id": "t-r",
"match": "R²"
},
{
"term": "Sigmoid",
"def": "Her sayıyı 0 ile 1 arasına sıkıştıran S biçimli fonksiyon; olasılık gibi okunur. (σ(z) = 1/(1 + e⁻ᶻ))",
"id": "t-sigmoid",
"match": "sigmoid"
},
{
"term": "Softmax",
"def": "Birden çok sınıfın skorlarını toplamı 1 olan olasılıklara çevirir. (e^{zₖ}/Σe^{zⱼ})",
"id": "t-softmax",
"match": "softmax"
},
{
"term": "Specificity",
"def": "“Gerçek negatiflerin kaçını doğru bıraktım?” (TN/(TN + FP))",
"id": "t-specificity-ozgulluk",
"match": "specificity|özgüllük"
},
{
"term": "SVM",
"def": "Sınıfları en geniş “sokakla” ayıran doğrusal sınıflandırıcı; çekirdeklerle doğrusal olmayan sınırlar da çizer. (min ½‖w‖²)",
"id": "t-svm",
"match": "SVM"
},
{
"term": "Test kümesi",
"def": "Yalnız en sonda, bir kez, modelin gerçek başarımını tahmin etmek için kullanılan veri. Karar vermek için kullanılırsa “görülmemiş” olmaktan çıkar.",
"id": "t-test-kumesi",
"match": "test kümesi"
},
{
"term": "Tümevarımsal yanlılık",
"def": "Bir öğrenicinin veriyle eşit uyumlu hipotezler arasından birini seçmesini sağlayan varsayımları (doğrusal, basit, pürüzsüz…). Hiç varsayımı olmayan öğrenici genelleyemez.",
"id": "t-tumevarimsal-yanlilik",
"match": "tümevarımsal yanlılık"
},
{
"term": "Varyans",
"def": "Eğitim verisi biraz değişince modelin ne kadar değiştiği. Karmaşık modellerde yüksektir.",
"id": "t-varyans-model",
"match": "varyans"
},
{
"term": "Veri sızıntısı",
"def": "Test (ya da gelecek) bilgisinin eğitime karışması: ölçekleyiciyi bütün veride fit etmek, etiketi ele veren öznitelik kullanmak. Skor gerçek olamayacak kadar iyi çıkar.",
"id": "t-veri-sizintisi",
"match": "veri sızıntısı"
},
{
"term": "Yanlılık",
"def": "Modelin basitliğinden gelen sistematik hata: sinüs eğrisine doğru uydurmak. Daha çok veri bunu düzeltmez.",
"id": "t-yanlilik-model",
"match": "yanlılık"
},
{
"term": "Yanlılık-varyans ayrışımı",
"def": "Beklenen test hatası = yanlılık² + varyans + gürültü. Esneklik arttıkça yanlılık düşer, varyans artar.",
"id": "t-yanlilik-varyans-ayrisimi",
"match": "yanlılık-varyans ayrışımı"
},
{
"term": "Yetersiz uyum",
"def": "Model veriyi yakalayamayacak kadar basit: eğitim hatası da test hatası da yüksek.",
"id": "t-yetersiz-uyum",
"match": "yetersiz uyum"
},
{
"term": "Yumuşak marj",
"def": "SVM'nin birkaç noktanın marjı çiğnemesine C ile ayarlanan bir bedel karşılığında izin veren biçimi; ayrılamayan ya da aykırı noktalı veride gerekli. (½‖w‖² + C·Σξ)",
"id": "t-yumusak-marj",
"match": "yumuşak marj"
},
{
"term": "z-score",
"def": "Değerden ortalamayı çıkarıp standart sapmaya bölmek: “ortalamadan kaç standart sapma uzakta?” ((x − μ)/σ)",
"id": "t-z-score",
"match": "z-score|z-skoru"
}
];
