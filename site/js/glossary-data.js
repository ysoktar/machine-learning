// Generated from the glossary page data: hover definitions for terms (see glossary.js).
export const TERMS = [
{
"term": "Accuracy",
"def": "Bütün tahminlerin yüzde kaçı doğru? En sezgisel ölçüt ama sınıflar dengesizse yanıltır: 1000 işlemin 20'si sahteyse “hepsi normal” diyen model %98 alır. ((TP + TN) / n)",
"id": "t-accuracy-dogruluk",
"match": "accuracy",
"week": 2
},
{
"term": "AdaBoost",
"def": "Zayıf modelleri (genelde tek sorulu karar kütükleri) sırayla eğitir; her turda yanlış bilinen örneklerin ağırlığını artırır ki sonraki model onlara odaklansın. Sonunda modeller α ağırlıklı oy verir. (α = ½ ln((1 − ε)/ε))",
"id": "t-adaboost",
"match": "AdaBoost",
"week": 6
},
{
"term": "Ağırlık",
"def": "Modelin öğrendiği sayılardan biri: bir özniteliğin karara ne kadar ve hangi yönde katkı yaptığı. w = (2, −1) ise x₁ artınca skor artar, x₂ artınca azalır. (ŷ = w·x + b)",
"id": "t-agirlik",
"match": "ağırlık",
"week": 4,
"skip": [
"w6-ensembles"
]
},
{
"term": "Aktarımlı öğrenme",
"def": "Büyük bir veri setinde önceden eğitilmiş bir modeli alıp kendi küçük verinizde yalnız son katmanlarını eğitmek (ya da hafifçe ince ayar yapmak). Erken katmanlar kenar, doku gibi genel desenleri zaten öğrenmiştir.",
"id": "t-aktarimli-ogrenme",
"match": "aktarımlı öğrenme",
"week": 9
},
{
"term": "Ampirik risk",
"def": "Eğitim verisindeki ortalama kayıp, yani eğitim hatası. Gerçek risk (bütün olası örneklerdeki ortalama kayıp) bilinmediği için bunu küçültürüz. (R̂(h) = (1/n)Σ L)",
"id": "t-ampirik-risk",
"match": "ampirik risk",
"week": 3
},
{
"term": "Aşırı uyum",
"def": "Modelin eğitim verisini, gürültüsüyle birlikte ezberlemesi: eğitim hatası çok düşük, yeni verideki hata yüksek. Sınavı ezberleyip konuyu anlamamış öğrenci gibi. (eğitim ≪ doğrulama hatası)",
"id": "t-asiri-uyum",
"match": "aşırı uyum",
"week": 3
},
{
"term": "AUC",
"def": "ROC eğrisinin altındaki alan. Rastgele seçilen bir pozitife, rastgele seçilen bir negatiften daha yüksek skor verme olasılığı. 0.5 rastgele, 1 kusursuz; eşik seçmekten bağımsızdır. (doğru sıralı (pozitif, negatif) çift / (P·N))",
"id": "t-auc",
"match": "AUC",
"week": 2
},
{
"term": "Bagging",
"def": "Veriden yerine koyarak çekilmiş birçok örneklem (bootstrap) oluşturup her birinde ayrı model eğitmek ve oylarını birleştirmek. Tek tek kararsız modellerin (derin ağaçların) varyansını azaltır.",
"id": "t-bagging-torbalama",
"match": "bagging|torbalama",
"week": 6
},
{
"term": "Batch, mini-batch, SGD",
"def": "Gradyanı her adımda kaç örnekle hesapladığımız: hepsiyle (batch), tek örnekle (SGD) ya da 32–512 örnekle (mini-batch, derin öğrenmede standart).",
"id": "t-batch-mini-batch-sgd",
"match": "mini-batch|SGD",
"week": 4
},
{
"term": "Bias",
"def": "Doğrusal modeldeki sabit sayı: karar sınırını orijinden kaydırır. “Yanlılık-varyans”taki yanlılıkla aynı kelime ama farklı kavram. (ŷ = w·x + b)",
"id": "t-bias-yanlilik-terimi-b",
"match": "bias",
"week": 4
},
{
"term": "Bilgi kazancı",
"def": "Bir özniteliğe göre bölünce belirsizliğin (entropinin) ne kadar azaldığı. ID3 her düğümde kazancı en büyük özniteliği seçer. (IG = H(D) − Σ (|D_v|/|D|)·H(D_v))",
"id": "t-bilgi-kazanci",
"match": "bilgi kazanc|bilgi kazanım",
"week": 5
},
{
"term": "Boosting",
"def": "Modelleri sırayla eğitip her yenisini öncekilerin hatalarına odaklayan topluluk yöntemi (AdaBoost, gradyan artırma). Yanlılığı azaltır.",
"id": "t-boosting-artirma",
"match": "boosting",
"week": 6
},
{
"term": "Bootstrap örneklemi",
"def": "n örnekten yerine koyarak n örnek çekmek. Bazı örnekler birkaç kez, ortalama %37'si hiç seçilmez (torba dışı). ((1 − 1/n)ⁿ → 0.368)",
"id": "t-bootstrap-orneklemi",
"match": "bootstrap",
"week": 6
},
{
"term": "Boyut laneti",
"def": "Öznitelik sayısı arttıkça uzay o kadar hızlı büyür ki veri seyrekleşir ve bütün uzaklıklar birbirine benzer; “en yakın komşu” anlamını yitirir.",
"id": "t-boyut-laneti",
"match": "boyut laneti",
"week": 3
},
{
"term": "Budama",
"def": "Karar ağacını küçültmek: ya büyümeden durdurmak (ön budama) ya da tam büyütüp yararsız dalları kesmek (sonradan budama). Aşırı uyuma karşı. (R_α(T) = R(T) + α·|T|)",
"id": "t-budama",
"match": "budama",
"week": 5
},
{
"term": "Çapraz doğrulama",
"def": "Veriyi k parçaya bölüp her seferinde birini doğrulama, kalanını eğitim yaparak k kez değerlendirmek; sonucun ortalaması ± std. Küçük veride tek bölmeden daha güvenilir. (k-katlı CV)",
"id": "t-capraz-dogrulama",
"match": "çapraz doğrulama",
"week": 2
},
{
"term": "Çekirdek",
"def": "İki noktanın “benzerliğini” ölçen fonksiyon; SVM'de veriyi açıkça yüksek boyuta taşımadan oradaki iç çarpımı hesaplamayı sağlar (çekirdek hilesi). (RBF: exp(−γ‖x − z‖²))",
"id": "t-cekirdek-kernel",
"match": "çekirdek|kernel",
"week": 7
},
{
"term": "Çoğunluk sınıfı",
"def": "Hiçbir şey öğrenmeden her örneğe en sık sınıfı söylemek. Her model en azından bunu geçmeli.",
"id": "t-cogunluk-sinifi-taban-cizgisi",
"match": "taban çizgisi|çoğunluk sınıfı",
"week": 3
},
{
"term": "Dal",
"def": "Karar ağacında bir sorunun bir cevabına karşılık gelen kol (örneğin “Rüzgâr = Hafif” dalı).",
"id": "t-dal",
"match": "dal(?!ga)",
"week": 5
},
{
"term": "Destek vektörü",
"def": "SVM'de karar sınırına en yakın, “sokağın” kenarına değen noktalar. Çözüm yalnız onlara bağlıdır; diğer noktaları silmek sınırı değiştirmez. (y·(w·x + b) = 1)",
"id": "t-destek-vektoru",
"match": "destek vektör",
"week": 7
},
{
"term": "Doğrulama kümesi",
"def": "Hiperparametre seçmek ve modelleri karşılaştırmak için ayrılan veri. Test kümesi en sona saklanır.",
"id": "t-dogrulama-kumesi",
"match": "doğrulama kümesi",
"week": 2
},
{
"term": "Dropout",
"def": "Eğitimde her adımda nöronların bir kısmını rastgele kapatmak; ağ tek bir nörona güvenmeyi öğrenmez. Düzenlileştiricidir.",
"id": "t-dropout-seyreltme",
"match": "dropout|seyreltme",
"week": 9
},
{
"term": "Düğüm",
"def": "Karar ağacında bir soru sorulan nokta; ağacın en üstteki düğümü köktür.",
"id": "t-dugum",
"match": "düğüm",
"week": 5
},
{
"term": "Düzenlileştirme",
"def": "Kayba “karmaşıklık cezası” ekleyerek modeli basit kalmaya zorlamak (ridge, lasso, budama, dropout). Aşırı uyumu azaltır, biraz yanlılık ekler. (min kayıp + λ·ceza)",
"id": "t-duzenlilestirme",
"match": "düzenlileştirme",
"week": 3
},
{
"term": "Eğitim",
"def": "Modelin parametrelerini eğitim verisine bakarak ayarlama süreci; genelde kaybı küçültmek demektir.",
"id": "t-egitim",
"match": "eğitim",
"week": 1
},
{
"term": "Entropi",
"def": "Bir kümenin ne kadar “karışık” olduğu. Hepsi aynı sınıfsa 0, iki sınıf yarı yarıyaysa 1 bit. “Bu örneğin sınıfını öğrenmek için ortalama kaç evet/hayır sorusu gerekir?” (H = −Σ pᵢ log₂ pᵢ)",
"id": "t-entropi",
"match": "entropi",
"week": 5
},
{
"term": "Epoch",
"def": "Eğitim verisinin tamamının üzerinden bir kez geçmek.",
"id": "t-epoch",
"match": "epoch",
"week": 4
},
{
"term": "Erken durdurma",
"def": "Doğrulama hatası birkaç epoch boyunca iyileşmezse eğitimi durdurmak; aşırı uyum başlamadan en iyi noktada kalmak.",
"id": "t-erken-durdurma",
"match": "erken durdurma",
"week": 8
},
{
"term": "Eşik",
"def": "Skoru sınıfa çeviren sınır: p ≥ 0.5 ise pozitif. Eşiği değiştirmek precision/recall dengesini değiştirir. Ağaçlarda “x ≤ 4” bölmesindeki 4 de bir eşiktir.",
"id": "t-esik",
"match": "eşik",
"week": 2
},
{
"term": "Etiket",
"def": "Bir örneğin doğru cevabı: e-postanın spam olup olmadığı, evin fiyatı. Gözetimli öğrenmede model etiketlerden öğrenir. (y)",
"id": "t-etiket",
"match": "etiket",
"week": 1
},
{
"term": "Etkinleştirme işlevi",
"def": "Nöronun toplamını (z) çıktıya çeviren doğrusal olmayan fonksiyon: sigmoid, tanh, ReLU, step, sign. (h = g(z))",
"id": "t-etkinlestirme-islevi",
"match": "etkinleştirme",
"week": 8
},
{
"term": "Evrişim",
"def": "Küçük bir filtreyi görüntü (ya da sinyal) üzerinde kaydırıp her konumda çarpımların toplamını almak. Aynı filtre her yerde kullanıldığı için parametre azdır. (çıktı = ⌊(n + 2p − k)/s⌋ + 1)",
"id": "t-evrisim",
"match": "evrişim",
"week": 9
},
{
"term": "F1",
"def": "Precision ve recall'un harmonik ortalaması: ikisi de yüksekse yüksek. Dengesiz veride accuracy'den çok daha bilgilendirici. (2PR/(P + R) = 2TP/(2TP + FP + FN))",
"id": "t-f1",
"match": "F1",
"week": 2
},
{
"term": "Genelleme",
"def": "Modelin görmediği yeni veride de iyi çalışması. Makine öğrenmesinin asıl amacı.",
"id": "t-genelleme",
"match": "genelleme",
"week": 1
},
{
"term": "Geri yayılım",
"def": "Sinir ağında kaybın her ağırlığa göre türevini, çıktıdan girdiye doğru zincir kuralıyla verimli hesaplamak. (δ = δ_sonraki·v·g′(z))",
"id": "t-geri-yayilim",
"match": "geri yayılım",
"week": 8
},
{
"term": "Gevşek değişken",
"def": "Yumuşak marjlı SVM'de bir noktanın marj kuralını ne kadar çiğnediği: 0 = sorun yok, 0–1 arası sokağın içinde, 1'den büyük yanlış tarafta. (ξ = max(0, 1 − y·f(x)))",
"id": "t-gevsek-degisken",
"match": "gevşek değişken",
"week": 7
},
{
"term": "Gini safsızlığı",
"def": "Entropiye benzer karışıklık ölçüsü (CART kullanır): rastgele iki örnek çekince farklı sınıftan olma olasılığı. (1 − Σ pᵢ²)",
"id": "t-gini-safsizligi",
"match": "gini",
"week": 5
},
{
"term": "Gradyan",
"def": "Kaybın her parametreye göre türevlerinden oluşan vektör; kaybın en hızlı arttığı yön. Ters yöne gidilir. (∇L)",
"id": "t-gradyan",
"match": "gradyan(?! inişi| artırma)",
"week": 0
},
{
"term": "Gradyan artırma",
"def": "Her turda, o ana kadarki modelin kalıntılarına (hatalarına) küçük bir ağaç uydurup η ile çarparak eklemek. (F ← F + η·f)",
"id": "t-gradyan-artirma",
"match": "gradyan artırma",
"week": 6
},
{
"term": "Gradyan inişi",
"def": "Kaybı küçültmek için parametreleri gradyanın tersi yönünde küçük adımlarla güncellemek. (w ← w − η∇L)",
"id": "t-gradyan-inisi",
"match": "gradyan inişi",
"week": 4
},
{
"term": "Hiperparametre",
"def": "Eğitimle öğrenilmeyen, bizim seçtiğimiz ayar: kNN'de k, ağaçta derinlik, SVM'de C ve γ, öğrenme oranı. Doğrulama kümesi ya da CV ile seçilir.",
"id": "t-hiperparametre",
"match": "hiperparametre",
"week": 0
},
{
"term": "Hipotez uzayı",
"def": "Modelin ifade edebildiği bütün fonksiyonlar. Doğrusal modelin hipotez uzayı bütün doğrulardır; öğrenme bu uzayda iyi bir hipotez aramaktır.",
"id": "t-hipotez-uzayi",
"match": "hipotez uzayı",
"week": 1
},
{
"term": "i.i.d.",
"def": "Eğitim ve test örneklerinin aynı dağılımdan ve birbirinden bağımsız geldiği varsayımı. Bozulursa (zaman serisi, aynı hastanın görüntüleri) skorlar iyimser çıkar.",
"id": "t-i-i-d",
"match": "i\\.i\\.d\\.",
"week": 3
},
{
"term": "ID3",
"def": "Karar ağacı kurma algoritması: her düğümde bilgi kazancı en yüksek özniteliğe göre böl, dallarda tekrarla.",
"id": "t-id3",
"match": "ID3",
"week": 5
},
{
"term": "İç çarpım",
"def": "İki vektörün karşılıklı elemanlarını çarpıp toplamak: w·x = w₁x₁ + w₂x₂ + … Doğrusal modellerin skoru budur. (w·x)",
"id": "t-i-c-carpim",
"match": "iç çarpım",
"week": 0
},
{
"term": "İleri yayılım",
"def": "Girdiden başlayıp katman katman çıktıyı ve kaybı hesaplamak.",
"id": "t-i-leri-yayilim",
"match": "ileri yayılım",
"week": 8
},
{
"term": "Kalıntı",
"def": "Gerçek değer ile tahmin arasındaki fark: y − ŷ.",
"id": "t-kalinti-artik",
"match": "kalıntı",
"week": 4
},
{
"term": "Karar kütüğü",
"def": "Tek bölmeli (derinliği 1) karar ağacı: “x₂ ≥ 0.5 ise Evet”. AdaBoost'un tipik zayıf öğrenicisi.",
"id": "t-karar-kutugu",
"match": "karar kütüğü",
"week": 6
},
{
"term": "Karar sınırı",
"def": "Modelin bir sınıftan diğerine geçtiği çizgi/yüzey. Doğrusal modelde w·x + b = 0 doğrusu.",
"id": "t-karar-siniri",
"match": "karar sınırı",
"week": 4
},
{
"term": "Karmaşıklık matrisi",
"def": "Gerçek sınıfa (satır) ve tahmine (sütun) göre örnekleri sayan 2×2 tablo: TP, FN, FP, TN. Bütün sınıflandırma ölçütleri buradan çıkar.",
"id": "t-karmasiklik-matrisi",
"match": "karmaşıklık matrisi|karışıklık matrisi",
"week": 2
},
{
"term": "Kategorik öznitelik",
"def": "Değerleri sayı değil kategori olan öznitelik (şehir, renk, beden). Kullanmadan önce sayıya kodlanır.",
"id": "t-kategorik-oznitelik",
"match": "kategorik",
"week": 2
},
{
"term": "Kavram",
"def": "Bütün olası örneklerden hangilerinin pozitif olduğunu söyleyen etiketleme; öğrenmeye çalıştığımız gerçek kural.",
"id": "t-kavram",
"match": "kavram",
"week": 1,
"auto": false
},
{
"term": "Kayıp",
"def": "Tek bir tahminin ne kadar kötü olduğunu ölçen sayı. Eğitim, ortalama kaybı küçültmektir. (kare: (y − ŷ)², log-loss, menteşe)",
"id": "t-kayip-fonksiyonu",
"match": "kayıp fonksiyonu|kayıp|kaybı|kaybın",
"week": 3
},
{
"term": "Kazanç oranı",
"def": "Bilgi kazancının bölme bilgisine bölünmesi; çok değerli öznitelikleri (müşteri no gibi) kayırmayı düzeltir (C4.5). (IG / SplitInfo)",
"id": "t-kazanc-orani",
"match": "kazanç oranı",
"week": 5
},
{
"term": "kNN",
"def": "Yeni örneği, eğitim verisindeki en yakın k komşusunun çoğunluk oyuyla sınıflamak. Eğitimde hiçbir şey öğrenmez, yalnız veriyi saklar.",
"id": "t-knn",
"match": "kNN",
"week": 3
},
{
"term": "Kovaryans",
"def": "İki değişkenin birlikte nasıl değiştiği: biri artarken öteki de artıyorsa pozitif. (Σ(x − x̄)(y − ȳ)/(n − 1))",
"id": "t-kovaryans",
"match": "kovaryans",
"week": 2
},
{
"term": "Kök",
"def": "Karar ağacının en üstteki düğümü; ID3'te bilgi kazancı en büyük öznitelik buraya konur.",
"id": "t-kok",
"match": "kök",
"week": 5
},
{
"term": "Lasso",
"def": "Ağırlıkların mutlak değerleri toplamını cezalandıran düzenlileştirme; bazı ağırlıkları tam sıfır yaparak öznitelik seçer. (L + λΣ|wⱼ|)",
"id": "t-lasso",
"match": "lasso",
"week": 4
},
{
"term": "Log-loss",
"def": "Olasılık tahminlerinin kaybı: doğru sınıfa verilen olasılığın negatif logaritması. Emin olup yanılmayı çok ağır cezalandırır. (−[y ln p + (1 − y) ln(1 − p)])",
"id": "t-log-loss-capraz-entropi",
"match": "log-loss|çapraz entropi",
"week": 4
},
{
"term": "Lojistik regresyon",
"def": "Doğrusal skoru sigmoidden geçirerek pozitif sınıfın olasılığını veren sınıflandırıcı. Adı “regresyon” ama sınıflandırma yapar. (p = σ(w·x + b))",
"id": "t-lojistik-regresyon",
"match": "lojistik regresyon",
"week": 4
},
{
"term": "Marj",
"def": "SVM'de karar sınırı ile en yakın noktalar arasındaki uzaklık. SVM bunu en büyük yapan sınırı seçer. (1/‖w‖)",
"id": "t-marj",
"match": "marj",
"week": 7
},
{
"term": "Menteşe kaybı",
"def": "SVM'nin kaybı: nokta doğru tarafta ve marjın dışındaysa 0, değilse marja ne kadar girdiyse o kadar. (max(0, 1 − y·f(x)))",
"id": "t-mentese-kaybi",
"match": "menteşe kaybı",
"week": 7
},
{
"term": "min-max ölçekleme",
"def": "Değerleri [0, 1] aralığına sıkıştırmak. ((x − min)/(max − min))",
"id": "t-min-max-olcekleme",
"match": "min-max",
"week": 2
},
{
"term": "MLP",
"def": "Nöronların katmanlar hâlinde bağlandığı sinir ağı; gizli katmanlar sayesinde XOR gibi doğrusal olmayan problemleri çözer.",
"id": "t-mlp-cok-katmanli-algilayici",
"match": "MLP|çok katmanlı algılayıcı",
"week": 8
},
{
"term": "Model",
"def": "Veriden öğrenilmiş, girdiyi alıp tahmin üreten kural ya da fonksiyon (bir doğru, bir ağaç, bir sinir ağı).",
"id": "t-model",
"match": "model",
"week": 1
},
{
"term": "MSE, MAE, RMSE",
"def": "Regresyon hata ölçütleri: hataların karelerinin ortalaması, mutlak değerlerinin ortalaması, MSE'nin karekökü.",
"id": "t-mse-mae-rmse",
"match": "MSE|MAE|RMSE",
"week": 2
},
{
"term": "Normalleştirme",
"def": "Öznitelikleri karşılaştırılabilir ölçeğe getirmek (min-max, z-score). Uzaklık ve gradyan temelli yöntemler için şart.",
"id": "t-normallestirme",
"match": "normalleştirme|normalizasyon",
"week": 2
},
{
"term": "One-hot kodlama",
"def": "Sırasız bir kategoriyi her değer için ayrı 0/1 sütunuyla göstermek: Ankara = (1, 0, 0).",
"id": "t-one-hot-kodlama",
"match": "one-hot",
"week": 2
},
{
"term": "OOB hata",
"def": "Her örneği, onu eğitimde hiç görmemiş ağaçların oyuyla tahmin edip ölçülen hata: bagging'de bedava doğrulama.",
"id": "t-oob-torba-disi-hata",
"match": "OOB|torba dışı",
"week": 6
},
{
"term": "Öğrenme oranı",
"def": "Gradyan inişinde her adımın büyüklüğü. Küçükse yavaş, büyükse savrulur ya da ıraksar.",
"id": "t-ogrenme-orani",
"match": "öğrenme oranı",
"week": 4
},
{
"term": "Örnek",
"def": "Veri tablosundaki bir satır: bir müşteri, bir e-posta, bir gün. Model her örnek için bir tahmin yapar.",
"id": "t-ornek-gozlem",
"match": "örnek(?!le)",
"week": 1,
"auto": false
},
{
"term": "Öznitelik",
"def": "Bir örneği anlatan ölçülebilir özellik: yaş, gelir, piksel değeri. Tablodaki bir sütun.",
"id": "t-oznitelik",
"match": "öznitelik",
"week": 2
},
{
"term": "Öznitelik seçimi / çıkarımı",
"def": "Seçim: var olan sütunlardan bir alt küme tutmak (yorumlanabilir). Çıkarım: eskilerden yeni sütunlar türetmek (PCA).",
"id": "t-oznitelik-secimi-cikarimi",
"match": "öznitelik seçimi|öznitelik çıkarımı",
"week": 2
},
{
"term": "Parametre",
"def": "Modelin eğitim sırasında veriden öğrendiği sayılar (doğrusal modelde ağırlıklar, ağaçta bölme eşikleri). Bizim seçtiğimiz ayarlar ise hiperparametredir.",
"id": "t-parametre",
"match": "parametre",
"week": 1
},
{
"term": "PCA",
"def": "Veriyi en çok yayıldığı (varyansı en büyük) dik yönlere döndürüp az sayıda yönle özetlemek. Etiket kullanmaz. (λₖ/Σλ açıklanan varyans)",
"id": "t-pca",
"match": "PCA",
"week": 2
},
{
"term": "Perceptron",
"def": "En basit doğrusal sınıflandırıcı: skor ≥ 0 ise +1. Yalnız yanlış sınıfladığı örnekte ağırlıklarını o örneğe doğru çeker. (hatada w ← w + η·y·x)",
"id": "t-perceptron-algilayici",
"match": "perceptron|algılayıcı",
"week": 4
},
{
"term": "Precision",
"def": "“Pozitif dediklerimin kaçı gerçekten pozitif?” Yanlış alarm (FP) pahalıysa önemli (spam filtresi). (TP/(TP + FP))",
"id": "t-precision-kesinlik",
"match": "precision|kesinlik",
"week": 2
},
{
"term": "Rastgele orman",
"def": "Bootstrap örneklemleri + her bölmede rastgele öznitelik alt kümesiyle eğitilmiş birçok ağacın oyu. (m ≈ √p)",
"id": "t-rastgele-orman",
"match": "rastgele orman",
"week": 6
},
{
"term": "Recall",
"def": "“Gerçek pozitiflerin kaçını yakaladım?” Kaçırmak (FN) pahalıysa önemli (kanser taraması). (TP/(TP + FN))",
"id": "t-recall-duyarlilik-tpr",
"match": "recall|duyarlılık",
"week": 2
},
{
"term": "Ridge",
"def": "Ağırlıkların kareleri toplamını cezalandıran düzenlileştirme; ağırlıkları küçültür ama sıfırlamaz. (L + λΣwⱼ²)",
"id": "t-ridge",
"match": "ridge",
"week": 4
},
{
"term": "ROC eğrisi",
"def": "Eşik değiştikçe (FPR, TPR) noktalarının çizdiği eğri.",
"id": "t-roc-egrisi",
"match": "ROC",
"week": 2
},
{
"term": "R²",
"def": "Regresyon modelinin “hep ortalamayı söylemek”e göre ne kadar iyi olduğu: 1 kusursuz, 0 ortalama kadar, negatif daha kötü. (1 − SSE/SST)",
"id": "t-r",
"match": "R²",
"week": 2
},
{
"term": "Sigmoid",
"def": "Her sayıyı 0 ile 1 arasına sıkıştıran S biçimli fonksiyon; olasılık gibi okunur. (σ(z) = 1/(1 + e⁻ᶻ))",
"id": "t-sigmoid",
"match": "sigmoid",
"week": 4
},
{
"term": "Sınıf",
"def": "Sınıflandırmada etiketin alabileceği kategorilerden biri: Evet/Hayır, +/−, spam/değil.",
"id": "t-sinif",
"match": "sınıf(?!la|ı?ndır)",
"week": 1
},
{
"term": "Skor",
"def": "Modelin bir örnek için ürettiği ham sayı (örneğin z = w·x + b); eşikle karşılaştırılarak sınıfa çevrilir.",
"id": "t-skor",
"match": "skor",
"week": 2
},
{
"term": "Softmax",
"def": "Birden çok sınıfın skorlarını toplamı 1 olan olasılıklara çevirir. (e^{zₖ}/Σe^{zⱼ})",
"id": "t-softmax",
"match": "softmax",
"week": 4
},
{
"term": "Specificity",
"def": "“Gerçek negatiflerin kaçını doğru bıraktım?” (TN/(TN + FP))",
"id": "t-specificity-ozgulluk",
"match": "specificity|özgüllük",
"week": 2
},
{
"term": "SVM",
"def": "Sınıfları en geniş “sokakla” ayıran doğrusal sınıflandırıcı; çekirdeklerle doğrusal olmayan sınırlar da çizer. (min ½‖w‖²)",
"id": "t-svm",
"match": "SVM",
"week": 7
},
{
"term": "Tahmin",
"def": "Modelin bir örnek için verdiği cevap; ŷ (y şapka) ile gösterilir. (ŷ)",
"id": "t-tahmin",
"match": "tahmin",
"week": 1,
"lower": true
},
{
"term": "Test kümesi",
"def": "Yalnız en sonda, bir kez, modelin gerçek başarımını tahmin etmek için kullanılan veri. Karar vermek için kullanılırsa “görülmemiş” olmaktan çıkar.",
"id": "t-test-kumesi",
"match": "test kümesi",
"week": 2
},
{
"term": "Tümevarımsal yanlılık",
"def": "Bir öğrenicinin veriyle eşit uyumlu hipotezler arasından birini seçmesini sağlayan varsayımları (doğrusal, basit, pürüzsüz…). Hiç varsayımı olmayan öğrenici genelleyemez.",
"id": "t-tumevarimsal-yanlilik",
"match": "tümevarımsal yanlılık",
"week": 1
},
{
"term": "Varyans",
"def": "Eğitim verisi biraz değişince modelin ne kadar değiştiği. Karmaşık modellerde yüksektir.",
"id": "t-varyans-model",
"match": "varyans",
"week": 3
},
{
"term": "Veri sızıntısı",
"def": "Test (ya da gelecek) bilgisinin eğitime karışması: ölçekleyiciyi bütün veride fit etmek, etiketi ele veren öznitelik kullanmak. Skor gerçek olamayacak kadar iyi çıkar.",
"id": "t-veri-sizintisi",
"match": "veri sızıntısı",
"week": 3
},
{
"term": "Yanlılık",
"def": "Modelin basitliğinden gelen sistematik hata: sinüs eğrisine doğru uydurmak. Daha çok veri bunu düzeltmez.",
"id": "t-yanlilik-model",
"match": "yanlılık",
"week": 3
},
{
"term": "Yanlılık-varyans ayrışımı",
"def": "Beklenen test hatası = yanlılık² + varyans + gürültü. Esneklik arttıkça yanlılık düşer, varyans artar.",
"id": "t-yanlilik-varyans-ayrisimi",
"match": "yanlılık-varyans ayrışımı",
"week": 3
},
{
"term": "Yaprak",
"def": "Karar ağacında soru sorulmayan, sınıf (ya da sayı) tahmin eden son düğüm.",
"id": "t-yaprak",
"match": "yaprak",
"week": 5
},
{
"term": "Yetersiz uyum",
"def": "Model veriyi yakalayamayacak kadar basit: eğitim hatası da test hatası da yüksek.",
"id": "t-yetersiz-uyum",
"match": "yetersiz uyum",
"week": 3
},
{
"term": "Yumuşak marj",
"def": "SVM'nin birkaç noktanın marjı çiğnemesine C ile ayarlanan bir bedel karşılığında izin veren biçimi; ayrılamayan ya da aykırı noktalı veride gerekli. (½‖w‖² + C·Σξ)",
"id": "t-yumusak-marj",
"match": "yumuşak marj",
"week": 7
},
{
"term": "z-score",
"def": "Değerden ortalamayı çıkarıp standart sapmaya bölmek: “ortalamadan kaç standart sapma uzakta?” ((x − μ)/σ)",
"id": "t-z-score",
"match": "z-score|z-skoru",
"week": 2
}
];
