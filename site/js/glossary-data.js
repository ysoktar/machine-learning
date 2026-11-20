// Generated from the glossary page data: hover definitions for terms (see glossary.js).
export const TERMS = [
{
"term": "Accuracy",
"def": "Bütün tahminlerin yüzde kaçı doğru? En sezgisel ölçüt ama sınıflar dengesizse yanıltır: 1000 işlemin 20'si sahteyse “hepsi normal” diyen model %98 alır. ((TP + TN) / n)",
"id": "t-accuracy-dogruluk",
"match": "accuracy",
"week": 2,
"en": "accuracy"
},
{
"term": "AdaBoost",
"def": "Zayıf modelleri (genelde tek sorulu karar kütükleri) sırayla eğitir; her turda yanlış bilinen örneklerin ağırlığını artırır ki sonraki model onlara odaklansın. Sonunda modeller α ağırlıklı oy verir. (α = ½ ln((1 − ε)/ε))",
"id": "t-adaboost",
"match": "AdaBoost",
"week": 6,
"en": "adaptive boosting"
},
{
"term": "Adillik",
"def": "Modelin farklı gruplara sistematik olarak farklı davranmaması; demografik eşitlik, fırsat eşitliği gibi ölçütlerle ölçülür.",
"id": "t-adillik",
"match": "adillik",
"week": 12,
"en": "fairness"
},
{
"term": "Ağırlık",
"def": "Modelin öğrendiği sayılardan biri: bir özniteliğin karara ne kadar ve hangi yönde katkı yaptığı. w = (2, −1) ise x₁ artınca skor artar, x₂ artınca azalır. (ŷ = w·x + b)",
"id": "t-agirlik",
"match": "ağırlık(?!lı|land)",
"week": 4,
"en": "weight",
"skip": [
"w6-ensembles"
]
},
{
"term": "Aktarımlı öğrenme",
"def": "Büyük bir veri setinde önceden eğitilmiş bir modeli alıp kendi küçük verinizde yalnız son katmanlarını eğitmek (ya da hafifçe ince ayar yapmak). Erken katmanlar kenar, doku gibi genel desenleri zaten öğrenmiştir.",
"id": "t-aktarimli-ogrenme",
"match": "aktarımlı öğrenme",
"week": 9,
"en": "transfer learning"
},
{
"term": "Ampirik risk",
"def": "Eğitim verisindeki ortalama kayıp, yani eğitim hatası. Gerçek risk (bütün olası örneklerdeki ortalama kayıp) bilinmediği için bunu küçültürüz. (R̂(h) = (1/n)Σ L)",
"id": "t-ampirik-risk",
"match": "ampirik risk",
"week": 3,
"en": "empirical risk"
},
{
"term": "Anomali tespiti",
"def": "Verinin büyük çoğunluğundan belirgin biçimde farklı örnekleri bulmak (sahtekârlık, arıza); genellikle gözetimsiz yapılır.",
"id": "t-anomali-tespiti",
"match": "anomali",
"week": 11,
"en": "anomaly detection"
},
{
"term": "Artık bağlantı",
"def": "Bir bloğun çıktısına girdisini doğrudan eklemek (ResNet). Gradyan kısayoldan bozulmadan geri akar. (y = F(x) + x)",
"id": "t-artik-baglanti",
"match": "artık bağlantı",
"week": 9,
"en": "residual (skip) connection"
},
{
"term": "Aşırı uyum",
"def": "Modelin eğitim verisini, gürültüsüyle birlikte ezberlemesi: eğitim hatası çok düşük, yeni verideki hata yüksek. Sınavı ezberleyip konuyu anlamamış öğrenci gibi. (eğitim ≪ doğrulama hatası)",
"id": "t-asiri-uyum",
"match": "aşırı uyum",
"week": 3,
"en": "overfitting"
},
{
"term": "AUC",
"def": "ROC eğrisinin altındaki alan. Rastgele seçilen bir pozitife, rastgele seçilen bir negatiften daha yüksek skor verme olasılığı. 0.5 rastgele, 1 kusursuz; eşik seçmekten bağımsızdır. (doğru sıralı (pozitif, negatif) çift / (P·N))",
"id": "t-auc",
"match": "AUC",
"week": 2,
"en": "area under the ROC curve"
},
{
"term": "Bagging",
"def": "Veriden yerine koyarak çekilmiş birçok örneklem (bootstrap) oluşturup her birinde ayrı model eğitmek ve oylarını birleştirmek. Tek tek kararsız modellerin (derin ağaçların) varyansını azaltır.",
"id": "t-bagging-torbalama",
"match": "bagging|torbalama",
"week": 6,
"en": "bootstrap aggregating"
},
{
"term": "Batch, mini-batch, SGD",
"def": "Gradyanı her adımda kaç örnekle hesapladığımız: hepsiyle (batch), tek örnekle (SGD) ya da 32–512 örnekle (mini-batch, derin öğrenmede standart).",
"id": "t-batch-mini-batch-sgd",
"match": "mini-batch|SGD",
"week": 4,
"en": "batch / stochastic gradient descent"
},
{
"term": "BERT ve GPT",
"def": "Transformer'ın iki ailesi. BERT yalnız kodlayıcıdır, iki yöne bakar ve maskelenmiş kelimeyi tahmin eder; GPT yalnız kod çözücüdür, yalnız geçmişi görür ve sonraki kelimeyi tahmin eder.",
"id": "t-bert-ve-gpt",
"match": "BERT|GPT",
"week": 10,
"en": "BERT / GPT"
},
{
"term": "Bias",
"def": "Doğrusal modeldeki sabit sayı: karar sınırını orijinden kaydırır. “Yanlılık-varyans”taki yanlılıkla aynı kelime ama farklı kavram. (ŷ = w·x + b)",
"id": "t-bias-yanlilik-terimi-b",
"match": "(?<!inductive )bias",
"week": 4,
"en": "bias / intercept"
},
{
"term": "Bilgi kazancı",
"def": "Bir özniteliğe göre bölünce belirsizliğin (entropinin) ne kadar azaldığı. ID3 her düğümde kazancı en büyük özniteliği seçer. (IG = H(D) − Σ (|D_v|/|D|)·H(D_v))",
"id": "t-bilgi-kazanci",
"match": "bilgi kazanc|bilgi kazanım",
"week": 5,
"en": "information gain"
},
{
"term": "Boosting",
"def": "Modelleri sırayla eğitip her yenisini öncekilerin hatalarına odaklayan topluluk yöntemi (AdaBoost, gradyan artırma). Yanlılığı azaltır.",
"id": "t-boosting-artirma",
"match": "boosting",
"week": 6,
"en": "boosting"
},
{
"term": "Bootstrap örneklemi",
"def": "n örnekten yerine koyarak n örnek çekmek. Bazı örnekler birkaç kez, ortalama %37'si hiç seçilmez (torba dışı). ((1 − 1/n)ⁿ → 0.368)",
"id": "t-bootstrap-orneklemi",
"match": "bootstrap",
"week": 6,
"en": "bootstrap sample"
},
{
"term": "Boyut laneti",
"def": "Öznitelik sayısı arttıkça uzay o kadar hızlı büyür ki veri seyrekleşir ve bütün uzaklıklar birbirine benzer; “en yakın komşu” anlamını yitirir.",
"id": "t-boyut-laneti",
"match": "boyut laneti",
"week": 3,
"en": "curse of dimensionality"
},
{
"term": "BPTT",
"def": "RNN'yi zamanda açıp derin bir ağ gibi geri yayılım yapmak. Bütün adımlar aynı ağırlıkları paylaştığı için adımların gradyanları toplanır.",
"id": "t-bptt-zamanda-geri-yayilim",
"match": "BPTT|zamanda geri yayılım",
"week": 10,
"en": "backpropagation through time"
},
{
"term": "Budama",
"def": "Karar ağacını küçültmek: ya büyümeden durdurmak (ön budama) ya da tam büyütüp yararsız dalları kesmek (sonradan budama). Aşırı uyuma karşı. (R_α(T) = R(T) + α·|T|)",
"id": "t-budama",
"match": "budama",
"week": 5,
"en": "pruning"
},
{
"term": "Çapraz doğrulama",
"def": "Veriyi k parçaya bölüp her seferinde birini doğrulama, kalanını eğitim yaparak k kez değerlendirmek; sonucun ortalaması ± std. Küçük veride tek bölmeden daha güvenilir. (k-katlı CV)",
"id": "t-capraz-dogrulama",
"match": "çapraz doğrulama",
"week": 2,
"en": "cross-validation"
},
{
"term": "Çekirdek",
"def": "İki noktanın “benzerliğini” ölçen fonksiyon; SVM'de veriyi açıkça yüksek boyuta taşımadan oradaki iç çarpımı hesaplamayı sağlar (çekirdek hilesi). (RBF: exp(−γ‖x − z‖²))",
"id": "t-cekirdek-kernel",
"match": "çekirdek|kernel",
"week": 7,
"en": "kernel"
},
{
"term": "Çoğunluk sınıfı",
"def": "Hiçbir şey öğrenmeden her örneğe en sık sınıfı söylemek. Her model en azından bunu geçmeli.",
"id": "t-cogunluk-sinifi-taban-cizgisi",
"match": "taban çizgisi|çoğunluk sınıfı",
"week": 3,
"en": "majority baseline"
},
{
"term": "Dal",
"def": "Karar ağacında bir sorunun bir cevabına karşılık gelen kol (örneğin “Rüzgâr = Hafif” dalı).",
"id": "t-dal",
"match": "dal(?!ga)",
"week": 5,
"en": "branch"
},
{
"term": "DBSCAN",
"def": "Kümeleri yoğun bölgeler olarak bulan algoritma (ε yarıçapı, minPts); her biçimdeki kümeyi bulur, gürültüyü ayrıca işaretler.",
"id": "t-dbscan",
"match": "DBSCAN",
"week": 11,
"en": "density-based clustering"
},
{
"term": "Değer fonksiyonu",
"def": "Bir durumun (V) ya da durum-eylem çiftinin (Q) gelecekte getireceği beklenen indirimli toplam ödül. (V(s), Q(s, a))",
"id": "t-deger-fonksiyonu",
"match": "değer fonksiyonu|değer yinelemesi",
"week": 12,
"en": "value function"
},
{
"term": "Dendrogram",
"def": "Hiyerarşik kümelemede birleşmelerin sırasını ve uzaklığını gösteren ağaç; yatay bir kesim küme sayısını belirler.",
"id": "t-dendrogram",
"match": "dendrogram",
"week": 11,
"en": "dendrogram"
},
{
"term": "Destek vektörü",
"def": "SVM'de karar sınırına en yakın, “sokağın” kenarına değen noktalar. Çözüm yalnız onlara bağlıdır; diğer noktaları silmek sınırı değiştirmez. (y·(w·x + b) = 1)",
"id": "t-destek-vektoru",
"match": "destek vektör",
"week": 7,
"en": "support vector"
},
{
"term": "Dikkat mekanizması",
"def": "Her kelimenin bütün kelimelere bakıp hangisinin ne kadar önemli olduğuna karar vermesi: sorgu ile anahtarların benzerlikleri softmax ile ağırlığa çevrilir, değerler bu ağırlıklarla toplanır. (softmax(Q·Kᵀ/√dₖ)·V)",
"id": "t-dikkat-mekanizmasi",
"match": "dikkat mekanizması|öz-dikkat|çok başlı dikkat|maskeli dikkat|çapraz dikkat",
"week": 10,
"en": "attention mechanism"
},
{
"term": "Dirsek yöntemi",
"def": "k-ortalamalarda farklı k değerleri için küme içi kare toplamını çizip eğrinin büküldüğü (düzleştiği) k'yı seçmek.",
"id": "t-dirsek-yontemi",
"match": "dirsek yöntemi",
"week": 11,
"en": "elbow method"
},
{
"term": "Doğrulama kümesi",
"def": "Hiperparametre seçmek ve modelleri karşılaştırmak için ayrılan veri. Test kümesi en sona saklanır.",
"id": "t-dogrulama-kumesi",
"match": "doğrulama kümesi|doğrulama(?! eğrisi)",
"week": 2,
"en": "validation set"
},
{
"term": "Dolgu",
"def": "Evrişimden önce görüntünün ya da sinyalin kenarlarına sıfır (ya da kenar değeri) eklemek; “same” dolgu çıktıyı girdiyle aynı boyda tutar. (p = (k − 1)/2 (adım 1 iken same))",
"id": "t-dolgu",
"match": "dolgu",
"week": 9,
"en": "padding"
},
{
"term": "DQN",
"def": "Q tablosu yerine durumdan Q değerlerini tahmin eden sinir ağı; deneyim tekrarı ve hedef ağla eğitilir.",
"id": "t-dqn-derin-q-agi",
"match": "DQN",
"week": 12,
"en": "deep Q-network"
},
{
"term": "Dropout",
"def": "Eğitimde her adımda nöronların bir kısmını rastgele kapatmak; ağ tek bir nörona güvenmeyi öğrenmez. Düzenlileştiricidir.",
"id": "t-dropout-seyreltme",
"match": "dropout|seyreltme",
"week": 9,
"en": "dropout"
},
{
"term": "Düğüm",
"def": "Karar ağacında bir soru sorulan nokta; ağacın en üstteki düğümü köktür.",
"id": "t-dugum",
"match": "düğüm",
"week": 5,
"en": "node"
},
{
"term": "Düzenlileştirme",
"def": "Kayba “karmaşıklık cezası” ekleyerek modeli basit kalmaya zorlamak (ridge, lasso, budama, dropout). Aşırı uyumu azaltır, biraz yanlılık ekler. (min kayıp + λ·ceza)",
"id": "t-duzenlilestirme",
"match": "düzenlileştirme",
"week": 3,
"en": "regularization"
},
{
"term": "Eğitim",
"def": "Modelin parametrelerini eğitim verisine bakarak ayarlama süreci; genelde kaybı küçültmek demektir.",
"id": "t-egitim",
"match": "eğitim",
"week": 1,
"en": "training"
},
{
"term": "Entropi",
"def": "Bir kümenin ne kadar “karışık” olduğu. Hepsi aynı sınıfsa 0, iki sınıf yarı yarıyaysa 1 bit. “Bu örneğin sınıfını öğrenmek için ortalama kaç evet/hayır sorusu gerekir?” (H = −Σ pᵢ log₂ pᵢ)",
"id": "t-entropi",
"match": "entropi",
"week": 5,
"en": "entropy"
},
{
"term": "Epoch",
"def": "Eğitim verisinin tamamının üzerinden bir kez geçmek.",
"id": "t-epoch",
"match": "epoch",
"week": 4,
"en": "epoch"
},
{
"term": "Erken durdurma",
"def": "Doğrulama hatası birkaç epoch boyunca iyileşmezse eğitimi durdurmak; aşırı uyum başlamadan en iyi noktada kalmak.",
"id": "t-erken-durdurma",
"match": "erken durdurma",
"week": 8,
"en": "early stopping"
},
{
"term": "Eşik",
"def": "Skoru sınıfa çeviren sınır: p ≥ 0.5 ise pozitif. Eşiği değiştirmek precision/recall dengesini değiştirir. Ağaçlarda “x ≤ 4” bölmesindeki 4 de bir eşiktir.",
"id": "t-esik",
"match": "eşik",
"week": 2,
"en": "threshold"
},
{
"term": "Etiket",
"def": "Bir örneğin doğru cevabı: e-postanın spam olup olmadığı, evin fiyatı. Gözetimli öğrenmede model etiketlerden öğrenir. (y)",
"id": "t-etiket",
"match": "etiket(?!leyerek)",
"week": 1,
"en": "label / target"
},
{
"term": "Etkinleştirme işlevi",
"def": "Nöronun toplamını (z) çıktıya çeviren doğrusal olmayan fonksiyon: sigmoid, tanh, ReLU, step, sign. (h = g(z))",
"id": "t-etkinlestirme-islevi",
"match": "etkinleştirme",
"week": 8,
"en": "activation function"
},
{
"term": "Evrişim",
"def": "Küçük bir filtreyi görüntü (ya da sinyal) üzerinde kaydırıp her konumda çarpımların toplamını almak. Aynı filtre her yerde kullanıldığı için parametre azdır. (çıktı = ⌊(n + 2p − k)/s⌋ + 1)",
"id": "t-evrisim",
"match": "evrişim",
"week": 9,
"en": "convolution"
},
{
"term": "F1",
"def": "Precision ve recall'un harmonik ortalaması: ikisi de yüksekse yüksek. Dengesiz veride accuracy'den çok daha bilgilendirici. (2·Precision·Recall / (Precision + Recall) = 2TP / (2TP + FP + FN))",
"id": "t-f1",
"match": "F1",
"week": 2,
"en": "F1 score"
},
{
"term": "Genelleme",
"def": "Modelin görmediği yeni veride de iyi çalışması. Makine öğrenmesinin asıl amacı.",
"id": "t-genelleme",
"match": "genelleme",
"week": 1,
"en": "generalization"
},
{
"term": "Geri yayılım",
"def": "Sinir ağında kaybın her ağırlığa göre türevini, çıktıdan girdiye doğru zincir kuralıyla verimli hesaplamak. (δ = δ_sonraki·v·g′(z))",
"id": "t-geri-yayilim",
"match": "geri yayılım",
"week": 8,
"en": "backpropagation"
},
{
"term": "Gevşek değişken",
"def": "Yumuşak marjlı SVM'de bir noktanın marj kuralını ne kadar çiğnediği: 0 = sorun yok, 0–1 arası sokağın içinde, 1'den büyük yanlış tarafta. (ξ = max(0, 1 − y·f(x)))",
"id": "t-gevsek-degisken",
"match": "gevşek değişken",
"week": 7,
"en": "slack variable (ξ)"
},
{
"term": "Gini safsızlığı",
"def": "Entropiye benzer karışıklık ölçüsü (CART kullanır): rastgele iki örnek çekince farklı sınıftan olma olasılığı. (1 − Σ pᵢ²)",
"id": "t-gini-safsizligi",
"match": "gini",
"week": 5,
"en": "Gini impurity"
},
{
"term": "Gizli durum",
"def": "RNN'nin o ana kadar okuduklarının özetini taşıyan vektör. Her adımda yeni girdiyle güncellenir.",
"id": "t-gizli-durum",
"match": "gizli durum",
"week": 10,
"en": "hidden state"
},
{
"term": "GMM ve EM",
"def": "Veriyi Gauss dağılımlarının karışımıyla modelleyen yumuşak kümeleme; parametreler E (sorumluluklar) ve M (güncelleme) adımlarıyla bulunur.",
"id": "t-gmm-ve-em",
"match": "GMM|Gauss karışım|EM algoritma",
"week": 11,
"en": "Gaussian mixture model / expectation–maximization"
},
{
"term": "Gömme vektörü",
"def": "Bir kelimeyi (ya da görüntüyü, cümleyi) kısa ve yoğun bir sayı vektörüyle temsil etmek; anlamca benzer olanlar uzayda birbirine yakın düşer.",
"id": "t-gomme-vektoru",
"match": "gömme(?!li)",
"week": 10,
"en": "embedding"
},
{
"term": "Gözetimsiz öğrenme",
"def": "Etiket olmadan verinin içindeki yapıyı bulmak: kümeleme, boyut indirgeme, yoğunluk kestirimi, anomali tespiti.",
"id": "t-gozetimsiz-ogrenme",
"match": "gözetimsiz",
"week": 11,
"en": "unsupervised learning"
},
{
"term": "Gradyan",
"def": "Kaybın her parametreye göre türevlerinden oluşan vektör; kaybın en hızlı arttığı yön. Ters yöne gidilir. (∇L)",
"id": "t-gradyan",
"match": "gradyan(?! inişi| artırma)",
"week": 0,
"en": "gradient"
},
{
"term": "Gradyan artırma",
"def": "Her turda, o ana kadarki modelin kalıntılarına (hatalarına) küçük bir ağaç uydurup η ile çarparak eklemek. (F ← F + η·f)",
"id": "t-gradyan-artirma",
"match": "gradyan artırma",
"week": 6,
"en": "gradient boosting"
},
{
"term": "Gradyan inişi",
"def": "Kaybı küçültmek için parametreleri gradyanın tersi yönünde küçük adımlarla güncellemek. (w ← w − η∇L)",
"id": "t-gradyan-inisi",
"match": "gradyan inişi",
"week": 4,
"en": "gradient descent"
},
{
"term": "Gradyan kırpma",
"def": "Gradyanın uzunluğu bir eşiği aşınca onu, yönünü koruyarak eşik uzunluğuna küçültmek. Patlayan gradyanı önler, kaybolanı çözmez. (‖g‖ > c ise g ← c·g/‖g‖)",
"id": "t-gradyan-kirpma",
"match": "gradyan kırpma",
"week": 10,
"en": "gradient clipping"
},
{
"term": "GRU",
"def": "LSTM'nin sade hâli: ayrı bellek yok, iki kapı (sıfırlama ve güncelleme). Yaklaşık %25 daha az parametre. (hₜ = (1 − zₜ)⊙hₜ₋₁ + zₜ⊙h′ₜ)",
"id": "t-gru",
"match": "GRU(?![a-zçğıöşüA-ZÇĞİÖŞÜ])",
"week": 10,
"en": "gated recurrent unit"
},
{
"term": "Havuzlama",
"def": "Görüntüyü küçük bloklara bölüp her bloktan tek değer (en büyük ya da ortalama) bırakmak. Boyutu küçültür, parametresi yoktur.",
"id": "t-havuzlama",
"match": "havuzlama",
"week": 9,
"en": "pooling"
},
{
"term": "Hiperparametre",
"def": "Eğitimle öğrenilmeyen, bizim seçtiğimiz ayar: kNN'de k, ağaçta derinlik, SVM'de C ve γ, öğrenme oranı. Doğrulama kümesi ya da CV ile seçilir.",
"id": "t-hiperparametre",
"match": "hiperparametre",
"week": 0,
"en": "hyperparameter"
},
{
"term": "Hipotez uzayı",
"def": "Modelin ifade edebildiği bütün fonksiyonlar. Doğrusal modelin hipotez uzayı bütün doğrulardır; öğrenme bu uzayda iyi bir hipotez aramaktır.",
"id": "t-hipotez-uzayi",
"match": "hipotez uzayı",
"week": 1,
"en": "hypothesis space"
},
{
"term": "i.i.d.",
"def": "Eğitim ve test örneklerinin aynı dağılımdan ve birbirinden bağımsız geldiği varsayımı. Bozulursa (zaman serisi, aynı hastanın görüntüleri) skorlar iyimser çıkar.",
"id": "t-i-i-d",
"match": "i\\.i\\.d\\.",
"week": 3,
"en": "independent and identically distributed"
},
{
"term": "ID3",
"def": "Karar ağacı kurma algoritması: her düğümde bilgi kazancı en yüksek özniteliğe göre böl, dallarda tekrarla.",
"id": "t-id3",
"match": "ID3",
"week": 5,
"en": "Iterative Dichotomiser 3"
},
{
"term": "İç çarpım",
"def": "İki vektörün karşılıklı elemanlarını çarpıp toplamak: w·x = w₁x₁ + w₂x₂ + … Doğrusal modellerin skoru budur. (w·x)",
"id": "t-i-c-carpim",
"match": "iç çarpım",
"week": 0,
"en": "dot product"
},
{
"term": "İleri yayılım",
"def": "Girdiden başlayıp katman katman çıktıyı ve kaybı hesaplamak.",
"id": "t-i-leri-yayilim",
"match": "ileri yayılım",
"week": 8,
"en": "forward pass"
},
{
"term": "İnce ayar",
"def": "Önceden eğitilmiş bir modeli kendi küçük etiketli verinizde düşük öğrenme oranıyla biraz daha eğitmek.",
"id": "t-i-nce-ayar",
"match": "ince ayar",
"week": 9,
"en": "fine-tuning"
},
{
"term": "İndirim çarpanı",
"def": "Gelecekteki ödülleri küçülten 0 ile 1 arası sayı; uzak ödüller γ'nın kuvvetleriyle çarpılır. (G = r₁ + γr₂ + γ²r₃ + …)",
"id": "t-i-ndirim-carpani",
"match": "indirim çarpanı|indirimli",
"week": 12,
"en": "discount factor (γ)"
},
{
"term": "k-ortalamalar",
"def": "Her noktayı en yakın merkeze atayıp merkezleri kümelerin ortalaması yaparak, atamalar değişmeyene kadar tekrarlayan kümeleme algoritması. (SSE = Σⱼ Σ ‖x − mⱼ‖²)",
"id": "t-k-ortalamalar-k-means",
"match": "k-ortalamalar|k-means",
"week": 11,
"en": "k-means"
},
{
"term": "Kalıntı",
"def": "Gerçek değer ile tahmin arasındaki fark: y − ŷ.",
"id": "t-kalinti-artik",
"match": "kalıntı",
"week": 4,
"en": "residual"
},
{
"term": "Karar kütüğü",
"def": "Tek bölmeli (derinliği 1) karar ağacı: “x₂ ≥ 0.5 ise Evet”. AdaBoost'ta en sık kullanılan zayıf model.",
"id": "t-karar-kutugu",
"match": "karar kütüğü",
"week": 6,
"en": "decision stump"
},
{
"term": "Karar sınırı",
"def": "Modelin bir sınıftan diğerine geçtiği çizgi/yüzey. Doğrusal modelde w·x + b = 0 doğrusu.",
"id": "t-karar-siniri",
"match": "karar sınırı",
"week": 4,
"en": "decision boundary"
},
{
"term": "Karmaşıklık matrisi",
"def": "Gerçek sınıfa (satır) ve tahmine (sütun) göre örnekleri sayan 2×2 tablo: TP, FN, FP, TN. Bütün sınıflandırma ölçütleri buradan çıkar.",
"id": "t-karmasiklik-matrisi",
"match": "karmaşıklık matrisi|karışıklık matrisi",
"week": 2,
"en": "confusion matrix"
},
{
"term": "Kategorik öznitelik",
"def": "Değerleri sayı değil kategori olan öznitelik (şehir, renk, beden). Kullanmadan önce sayıya kodlanır.",
"id": "t-kategorik-oznitelik",
"match": "kategorik",
"week": 2,
"en": "categorical feature"
},
{
"term": "Kavram",
"def": "Bütün olası örneklerden hangilerinin pozitif olduğunu söyleyen etiketleme; öğrenmeye çalıştığımız gerçek kural.",
"id": "t-kavram",
"match": "kavram",
"week": 1,
"en": "concept",
"auto": false
},
{
"term": "Kaybolan / patlayan gradyan",
"def": "Geri yayılımda gradyan birçok çarpandan geçer; çarpanlar 1'den küçükse sıfıra yaklaşır (ilk katmanlar ya da ilk adımlar öğrenemez), büyükse patlar (kayıp NaN olur). (|J|ᵗ)",
"id": "t-kaybolan-patlayan-gradyan",
"match": "kaybolan gradyan|patlayan gradyan|kaybolan ve patlayan gradyan",
"week": 9,
"en": "vanishing / exploding gradient"
},
{
"term": "Kayıp",
"def": "Tek bir tahminin ne kadar kötü olduğunu ölçen sayı. Eğitim, ortalama kaybı küçültmektir. (kare: (y − ŷ)², log-loss, menteşe)",
"id": "t-kayip-fonksiyonu",
"match": "kayıp fonksiyonu|(?<!müşteri |bilgi |bir )kayıp|(?<!müşteri |bilgi )kaybı|(?<!müşteri |bilgi )kaybın",
"week": 3,
"en": "loss function"
},
{
"term": "Kazanç oranı",
"def": "Bilgi kazancının bölme bilgisine bölünmesi; çok değerli öznitelikleri (müşteri no gibi) kayırmayı düzeltir (C4.5). (IG / SplitInfo)",
"id": "t-kazanc-orani",
"match": "kazanç oranı",
"week": 5,
"en": "gain ratio"
},
{
"term": "Keşif ve sömürü",
"def": "Yeni eylemleri denemek (keşif) ile bilinen en iyi eylemi kullanmak (sömürü) arasındaki denge.",
"id": "t-kesif-ve-somuru",
"match": "keşif|sömürü",
"week": 12,
"en": "exploration vs exploitation"
},
{
"term": "kNN",
"def": "Yeni örneği, eğitim verisindeki en yakın k komşusunun çoğunluk oyuyla sınıflamak. Eğitimde hiçbir şey öğrenmez, yalnız veriyi saklar.",
"id": "t-knn",
"match": "kNN",
"week": 3,
"en": "k-nearest neighbours"
},
{
"term": "Konum kodlaması",
"def": "Dikkat sırayı bilmediği için her konuma özgü bir vektörü kelimenin gömmesine eklemek. (PE(p, 2i) = sin(p/10000^(2i/d)))",
"id": "t-konum-kodlamasi",
"match": "konum kodlaması",
"week": 10,
"en": "positional encoding"
},
{
"term": "Kosinüs benzerliği",
"def": "İki vektör arasındaki açının kosinüsü: yalnız yöne bakar, uzunluğu görmezden gelir. 1 aynı yön, 0 ilgisiz, −1 zıt yön. (cos(u, v) = u·v / (‖u‖·‖v‖))",
"id": "t-kosinus-benzerligi",
"match": "kosinüs benzerliği",
"week": 10,
"en": "cosine similarity"
},
{
"term": "Kovaryans",
"def": "İki değişkenin birlikte nasıl değiştiği: biri artarken öteki de artıyorsa pozitif. (Σ(x − x̄)(y − ȳ)/(n − 1))",
"id": "t-kovaryans",
"match": "kovaryans",
"week": 2,
"en": "covariance"
},
{
"term": "Kök",
"def": "Karar ağacının en üstteki düğümü; ID3'te bilgi kazancı en büyük öznitelik buraya konur.",
"id": "t-kok",
"match": "kök(?!ü al|ünü al|ü hiç)",
"week": 5,
"en": "root",
"skip": [
"on-bilgi",
"w2-data"
]
},
{
"term": "Kümeleme",
"def": "Benzer örnekleri aynı gruba, farklı olanları ayrı gruplara koymak; etiket kullanılmaz.",
"id": "t-kumeleme",
"match": "kümeleme|kümelem",
"week": 11,
"en": "clustering"
},
{
"term": "Laplace düzeltmesi",
"def": "Sayımlara 1 ekleyerek eğitimde görülmemiş bir değerin olasılığının 0 çıkmasını önlemek. ((sayı + 1)/(toplam + |V|))",
"id": "t-laplace-duzeltmesi",
"match": "Laplace",
"week": 11,
"en": "Laplace (add-one) smoothing"
},
{
"term": "Lasso",
"def": "Ağırlıkların mutlak değerleri toplamını cezalandıran düzenlileştirme; bazı ağırlıkları tam sıfır yaparak öznitelik seçer. (L + λΣ|wⱼ|)",
"id": "t-lasso",
"match": "lasso",
"week": 4,
"en": "lasso (L1)"
},
{
"term": "LLM",
"def": "Çok büyük metin derleminde sonraki kelime tahminiyle eğitilmiş, sonra yönerge ayarı ve insan geri bildirimiyle iyileştirilmiş Transformer.",
"id": "t-llm-buyuk-dil-modeli",
"match": "LLM|büyük dil model",
"week": 10,
"en": "large language model"
},
{
"term": "Log-loss",
"def": "Olasılık tahminlerinin kaybı: doğru sınıfa verilen olasılığın negatif logaritması. Emin olup yanılmayı çok ağır cezalandırır. (−[y ln p + (1 − y) ln(1 − p)])",
"id": "t-log-loss-capraz-entropi",
"match": "log-loss|çapraz entropi",
"week": 4,
"en": "log loss / cross-entropy"
},
{
"term": "Lojistik regresyon",
"def": "Doğrusal skoru sigmoidden geçirerek pozitif sınıfın olasılığını veren sınıflandırıcı. Adı “regresyon” ama sınıflandırma yapar. (p = σ(w·x + b))",
"id": "t-lojistik-regresyon",
"match": "lojistik regresyon",
"week": 4,
"en": "logistic regression"
},
{
"term": "LSTM",
"def": "Ayrı bir hücre durumu (bellek) ve üç kapısı (unutma, girdi, çıktı) olan RNN hücresi. Belleği toplamayla güncellediği için uzun bağımlılıkları öğrenebilir. (cₜ = fₜ⊙cₜ₋₁ + iₜ⊙gₜ, hₜ = oₜ⊙tanh(cₜ))",
"id": "t-lstm",
"match": "LSTM(?![a-zçğıöşüA-ZÇĞİÖŞÜ])",
"week": 10,
"en": "long short-term memory"
},
{
"term": "Marj",
"def": "SVM'de karar sınırı ile en yakın noktalar arasındaki uzaklık. SVM bunu en büyük yapan sınırı seçer. (1/‖w‖)",
"id": "t-marj",
"match": "marj",
"week": 7,
"en": "margin"
},
{
"term": "MDP",
"def": "Durumlar, eylemler, geçiş olasılıkları, ödüller ve indirim çarpanıyla tanımlanan karar problemi; gelecek yalnız şimdiki duruma bağlıdır. ((S, A, T, R, γ))",
"id": "t-mdp-markov-karar-sureci",
"match": "MDP|Markov karar",
"week": 12,
"en": "Markov decision process"
},
{
"term": "Menteşe kaybı",
"def": "SVM'nin kaybı: nokta doğru tarafta ve marjın dışındaysa 0, değilse marja ne kadar girdiyse o kadar. (max(0, 1 − y·f(x)))",
"id": "t-mentese-kaybi",
"match": "menteşe kaybı",
"week": 7,
"en": "hinge loss"
},
{
"term": "min-max ölçekleme",
"def": "Değerleri [0, 1] aralığına sıkıştırmak. ((x − min)/(max − min))",
"id": "t-min-max-olcekleme",
"match": "min-max",
"week": 2,
"en": "min-max scaling"
},
{
"term": "MLOps ve veri kayması",
"def": "Modelleri üretimde izlemek, sürümlemek ve yeniden eğitmek; veri kayması, girdi dağılımının zamanla değişip başarıyı düşürmesidir.",
"id": "t-mlops-ve-veri-kaymasi",
"match": "MLOps|veri kayması",
"week": 12,
"en": "MLOps / data drift"
},
{
"term": "MLP",
"def": "Nöronların katmanlar hâlinde bağlandığı sinir ağı; gizli katmanlar sayesinde XOR gibi doğrusal olmayan problemleri çözer.",
"id": "t-mlp-cok-katmanli-algilayici",
"match": "MLP|çok katmanlı algılayıcı",
"week": 8,
"en": "multilayer perceptron"
},
{
"term": "Model",
"def": "Veriden öğrenilmiş, girdiyi alıp tahmin üreten kural ya da fonksiyon (bir doğru, bir ağaç, bir sinir ağı).",
"id": "t-model",
"match": "model",
"week": 1,
"en": "model"
},
{
"term": "MSE, MAE, RMSE",
"def": "Regresyon hata ölçütleri: hataların karelerinin ortalaması, mutlak değerlerinin ortalaması, MSE'nin karekökü.",
"id": "t-mse-mae-rmse",
"match": "MSE|MAE|RMSE",
"week": 2,
"en": "mean squared / absolute error"
},
{
"term": "Naive Bayes",
"def": "Sınıf bilindiğinde özniteliklerin bağımsız olduğunu varsayan olasılıksal sınıflandırıcı; önsel ile her özniteliğin olasılığı çarpılır. (P(C | x) ∝ P(C)·Π P(xᵢ | C))",
"id": "t-naive-bayes",
"match": "Naive Bayes",
"week": 11,
"en": "naive Bayes"
},
{
"term": "Normalleştirme",
"def": "Öznitelikleri karşılaştırılabilir ölçeğe getirmek (min-max, z-score). Uzaklık ve gradyan temelli yöntemler için şart.",
"id": "t-normallestirme",
"match": "(?<!toplu )normalleştirme|normalizasyon",
"week": 2,
"en": "normalization / feature scaling",
"skip": [
"w6-ensembles"
]
},
{
"term": "One-hot kodlama",
"def": "Sırasız bir kategoriyi her değer için ayrı 0/1 sütunuyla göstermek: Ankara = (1, 0, 0).",
"id": "t-one-hot-kodlama",
"match": "one-hot",
"week": 2,
"en": "one-hot encoding"
},
{
"term": "OOB hata",
"def": "Her örneği, onu eğitimde hiç görmemiş ağaçların oyuyla tahmin edip ölçülen hata: bagging'de bedava doğrulama.",
"id": "t-oob-torba-disi-hata",
"match": "OOB|torba dışı",
"week": 6,
"en": "out-of-bag error"
},
{
"term": "Otokodlayıcı",
"def": "Girdisini dar bir orta katmandan geçirip yeniden üretmeyi öğrenen ağ; orta katman sıkıştırılmış temsildir. Gürültü giderme ve anomali tespitinde de kullanılır. (kayıp = ‖x − x̂‖²)",
"id": "t-otokodlayici",
"match": "otokodlayıcı",
"week": 11,
"en": "autoencoder"
},
{
"term": "Öğrenme oranı",
"def": "Gradyan inişinde her adımın büyüklüğü. Küçükse yavaş, büyükse savrulur ya da ıraksar.",
"id": "t-ogrenme-orani",
"match": "öğrenme oranı",
"week": 4,
"en": "learning rate (η)"
},
{
"term": "Örnek",
"def": "Veri tablosundaki bir satır: bir müşteri, bir e-posta, bir gün. Model her örnek için bir tahmin yapar.",
"id": "t-ornek-gozlem",
"match": "örnek(?!le)",
"week": 1,
"en": "instance / sample",
"auto": false
},
{
"term": "Öznitelik",
"def": "Bir örneği anlatan ölçülebilir özellik: yaş, gelir, piksel değeri. Tablodaki bir sütun.",
"id": "t-oznitelik",
"match": "öznitelik",
"week": 2,
"en": "feature"
},
{
"term": "Öznitelik seçimi / çıkarımı",
"def": "Seçim: var olan sütunlardan bir alt küme tutmak (yorumlanabilir). Çıkarım: eskilerden yeni sütunlar türetmek (PCA).",
"id": "t-oznitelik-secimi-cikarimi",
"match": "öznitelik seçimi|öznitelik çıkarımı",
"week": 2,
"en": "feature selection / extraction"
},
{
"term": "Parametre",
"def": "Modelin eğitim sırasında veriden öğrendiği sayılar (doğrusal modelde ağırlıklar, ağaçta bölme eşikleri). Bizim seçtiğimiz ayarlar ise hiperparametredir.",
"id": "t-parametre",
"match": "parametre",
"week": 1,
"en": "parameter"
},
{
"term": "PCA",
"def": "Veriyi en çok yayıldığı (varyansı en büyük) dik yönlere döndürüp az sayıda yönle özetlemek. Etiket kullanmaz. (λₖ/Σλ açıklanan varyans)",
"id": "t-pca",
"match": "PCA",
"week": 2,
"en": "principal component analysis"
},
{
"term": "Pekiştirmeli öğrenme",
"def": "Bir ajanın çevreyle etkileşerek, doğru eylem söylenmeden yalnız ödül sinyaliyle toplam ödülü en büyük yapan davranışı öğrenmesi.",
"id": "t-pekistirmeli-ogrenme",
"match": "pekiştirmeli",
"week": 12,
"en": "reinforcement learning"
},
{
"term": "Perceptron",
"def": "En basit doğrusal sınıflandırıcı: skor ≥ 0 ise +1. Yalnız yanlış sınıfladığı örnekte ağırlıklarını o örneğe doğru çeker. (hatada w ← w + η·y·x)",
"id": "t-perceptron-algilayici",
"match": "perceptron|algılayıcı",
"week": 4,
"en": "perceptron"
},
{
"term": "Politika",
"def": "Ajanın her durumda hangi eylemi seçeceğini belirleyen kural: π(s). (π(s))",
"id": "t-politika",
"match": "politika",
"week": 12,
"en": "policy"
},
{
"term": "Precision",
"def": "“Pozitif dediklerimin kaçı gerçekten pozitif?” Yanlış alarm (FP) pahalıysa önemli (spam filtresi). (TP/(TP + FP))",
"id": "t-precision-kesinlik",
"match": "precision|kesinlik",
"week": 2,
"en": "precision"
},
{
"term": "Q-öğrenme",
"def": "Durum-eylem değerlerini deneyimden öğrenen modelsiz yöntem; hedefte varılan durumdaki en iyi Q kullanılır. (Q ← Q + α[r + γ max Q(s′, ·) − Q])",
"id": "t-q-ogrenme",
"match": "Q-öğrenme",
"week": 12,
"en": "Q-learning"
},
{
"term": "RAG",
"def": "Erişimle zenginleştirilmiş üretim: soruyla ilgili belgeleri gömme benzerliğiyle bulup isteme ekleyerek dil modeline cevap ürettirmek.",
"id": "t-rag",
"match": "RAG(?![a-zçğıöşüA-ZÇĞİÖŞÜ])",
"week": 10,
"en": "retrieval-augmented generation"
},
{
"term": "Rastgele orman",
"def": "Bootstrap örneklemleri + her bölmede rastgele öznitelik alt kümesiyle eğitilmiş birçok ağacın oyu. (m ≈ √p)",
"id": "t-rastgele-orman",
"match": "rastgele orman",
"week": 6,
"en": "random forest"
},
{
"term": "Recall",
"def": "“Gerçek pozitiflerin kaçını yakaladım?” Kaçırmak (FN) pahalıysa önemli (kanser taraması). (TP/(TP + FN))",
"id": "t-recall-duyarlilik-tpr",
"match": "recall|duyarlılık",
"week": 2,
"en": "recall / sensitivity"
},
{
"term": "Ridge",
"def": "Ağırlıkların kareleri toplamını cezalandıran düzenlileştirme; ağırlıkları küçültür ama sıfırlamaz. (L + λΣwⱼ²)",
"id": "t-ridge",
"match": "ridge",
"week": 4,
"en": "ridge (L2)"
},
{
"term": "RNN",
"def": "Diziyi elemanlarını teker teker okuyarak işleyen ağ. Her adımda yeni girdiyi bir önceki gizli durumla birleştirir; aynı ağırlıklar her adımda kullanılır. (hₜ = tanh(W·xₜ + U·hₜ₋₁ + b))",
"id": "t-rnn-ozyinelemeli-sinir-agi",
"match": "RNN|özyinelemeli",
"week": 10,
"en": "recurrent neural network"
},
{
"term": "ROC eğrisi",
"def": "Eşik değiştikçe (FPR, TPR) noktalarının çizdiği eğri.",
"id": "t-roc-egrisi",
"match": "ROC",
"week": 2,
"en": "ROC curve"
},
{
"term": "R²",
"def": "Regresyon modelinin “hep ortalamayı söylemek”e göre ne kadar iyi olduğu: 1 kusursuz, 0 ortalama kadar, negatif daha kötü. (1 − SSE/SST)",
"id": "t-r",
"match": "R²",
"week": 2,
"en": "coefficient of determination"
},
{
"term": "Sigmoid",
"def": "Her sayıyı 0 ile 1 arasına sıkıştıran S biçimli fonksiyon; olasılık gibi okunur. (σ(z) = 1/(1 + e⁻ᶻ))",
"id": "t-sigmoid",
"match": "sigmoid",
"week": 4,
"en": "sigmoid / logistic function"
},
{
"term": "Siluet katsayısı",
"def": "Bir noktanın kendi kümesine ne kadar iyi oturduğunu komşu kümeyle karşılaştırarak ölçen −1 ile 1 arası değer. (s = (b − a)/max(a, b))",
"id": "t-siluet-katsayisi",
"match": "siluet",
"week": 11,
"en": "silhouette coefficient"
},
{
"term": "Sınıf",
"def": "Sınıflandırmada etiketin alabileceği kategorilerden biri: Evet/Hayır, +/−, spam/değil.",
"id": "t-sinif",
"match": "sınıf(?!la|ı?ndır)",
"week": 1,
"en": "class"
},
{
"term": "Skor",
"def": "Modelin bir örnek için ürettiği ham sayı (örneğin z = w·x + b); eşikle karşılaştırılarak sınıfa çevrilir.",
"id": "t-skor",
"match": "skor",
"week": 2,
"en": "score"
},
{
"term": "Softmax",
"def": "Birden çok sınıfın skorlarını toplamı 1 olan olasılıklara çevirir. (e^{zₖ}/Σe^{zⱼ})",
"id": "t-softmax",
"match": "softmax",
"week": 4,
"en": "softmax"
},
{
"term": "Specificity",
"def": "“Gerçek negatiflerin kaçını doğru bıraktım?” (TN/(TN + FP))",
"id": "t-specificity-ozgulluk",
"match": "specificity|özgüllük",
"week": 2,
"en": "specificity / TNR"
},
{
"term": "SVM",
"def": "Sınıfları en geniş “sokakla” ayıran doğrusal sınıflandırıcı; çekirdeklerle doğrusal olmayan sınırlar da çizer. (min ½‖w‖²)",
"id": "t-svm",
"match": "SVM",
"week": 7,
"en": "support vector machine"
},
{
"term": "t-SNE ve UMAP",
"def": "Yüksek boyutlu veriyi görselleştirmek için iki boyuta indiren, yerel komşuluğu koruyan yöntemler; kümeler arası uzaklıklar yorumlanmaz.",
"id": "t-t-sne-ve-umap",
"match": "t-SNE|UMAP",
"week": 11,
"en": "t-SNE / UMAP"
},
{
"term": "Tahmin",
"def": "Modelin bir örnek için verdiği cevap; ŷ (y şapka) ile gösterilir. (ŷ)",
"id": "t-tahmin",
"match": "tahmin",
"week": 1,
"en": "prediction",
"lower": true
},
{
"term": "TD öğrenme",
"def": "Her geçişten sonra değeri, ödül artı sonraki durumun tahminine doğru biraz kaydırarak öğrenmek; bölümün bitmesini beklemez. (V(s) ← V(s) + α[r + γV(s′) − V(s)])",
"id": "t-td-ogrenme",
"match": "zamansal fark|TD öğren|TD hata",
"week": 12,
"en": "temporal difference learning"
},
{
"term": "Tek / tam bağlantı",
"def": "Hiyerarşik kümelemede iki küme arasındaki uzaklık: tek bağlantıda en yakın, tam bağlantıda en uzak nokta çiftinin uzaklığı. (min d(a, b) / max d(a, b))",
"id": "t-tek-tam-baglanti",
"match": "tek bağlantı|tam bağlantı",
"week": 11,
"en": "single / complete linkage"
},
{
"term": "Test kümesi",
"def": "Yalnız en sonda, bir kez, modelin gerçek başarımını tahmin etmek için kullanılan veri. Karar vermek için kullanılırsa “görülmemiş” olmaktan çıkar.",
"id": "t-test-kumesi",
"match": "test kümesi|(?<!hastalık )test(?!ler| etme)",
"week": 2,
"en": "test set"
},
{
"term": "Token",
"def": "Dil modelinin işlediği en küçük metin parçası: bir kelime ya da kelime parçası.",
"id": "t-token",
"match": "token",
"week": 10,
"en": "token"
},
{
"term": "Toplu normalleştirme",
"def": "Bir katmanın değerlerini her mini yığın içinde ortalaması 0, varyansı 1 olacak biçimde ölçekleyip öğrenilen γ ve β ile yeniden ölçeklemek. Eğitimi hızlandırır ve kararlı kılar. (x̂ = (x − μ_B)/√(σ²_B + ε), y = γx̂ + β)",
"id": "t-toplu-normallestirme-bn",
"match": "toplu normalleştirme",
"week": 9,
"en": "batch normalization"
},
{
"term": "Transformer",
"def": "Özyineleme kullanmayan, yalnız dikkat katmanları, ileri beslemeli ağlar, artık bağlantılar ve konum kodlamasıyla kurulan ağ (2017). BERT ve GPT bu mimaridir.",
"id": "t-transformer",
"match": "Transformer",
"week": 10,
"en": "Transformer"
},
{
"term": "Tümevarımsal yanlılık",
"def": "Bir öğrenme algoritmasının veriyle eşit uyumlu hipotezler arasından birini seçmesini sağlayan varsayımları (doğrusal, basit, pürüzsüz…). Hiç varsayımı olmayan bir öğrenme algoritması genelleyemez.",
"id": "t-tumevarimsal-yanlilik",
"match": "tümevarımsal yanlılık",
"week": 1,
"en": "inductive bias"
},
{
"term": "Varyans",
"def": "Eğitim verisi biraz değişince modelin ne kadar değiştiği. Karmaşık modellerde yüksektir.",
"id": "t-varyans-model",
"match": "varyans",
"week": 3,
"en": "variance",
"skip": [
"w2-data",
"on-bilgi",
"w11-unsup"
]
},
{
"term": "Veri çoğaltma",
"def": "Eğitim örneklerinden etiketi değiştirmeyen dönüşümlerle (kırpma, çevirme, döndürme) yeni örnekler üretmek. Yalnız eğitim kümesine uygulanır.",
"id": "t-veri-cogaltma",
"match": "veri çoğaltma",
"week": 9,
"en": "data augmentation"
},
{
"term": "Veri sızıntısı",
"def": "Test (ya da gelecek) bilgisinin eğitime karışması: ölçekleyiciyi bütün veride fit etmek, etiketi ele veren öznitelik kullanmak. Skor gerçek olamayacak kadar iyi çıkar.",
"id": "t-veri-sizintisi",
"match": "veri sızıntısı",
"week": 3,
"en": "data leakage"
},
{
"term": "Word2Vec",
"def": "Kelime gömmelerini, her kelimenin penceredeki komşularını tahmin eden sığ bir ağla öğrenmek. Skip-gram merkezden komşuyu, CBOW komşulardan merkezi tahmin eder.",
"id": "t-word2vec",
"match": "Word2Vec|skip-gram|CBOW",
"week": 10,
"en": "Word2Vec"
},
{
"term": "Yanlılık",
"def": "Modelin basitliğinden gelen sistematik hata: sinüs eğrisine doğru uydurmak. Daha çok veri bunu düzeltmez.",
"id": "t-yanlilik-model",
"match": "yanlılık",
"week": 3,
"en": "bias",
"skip": [
"on-bilgi"
]
},
{
"term": "Yanlılık-varyans ayrışımı",
"def": "Beklenen test hatası = yanlılık² + varyans + gürültü. Esneklik arttıkça yanlılık düşer, varyans artar.",
"id": "t-yanlilik-varyans-ayrisimi",
"match": "yanlılık-varyans ayrışımı",
"week": 3,
"en": "bias-variance decomposition"
},
{
"term": "Yaprak",
"def": "Karar ağacında soru sorulmayan, sınıf (ya da sayı) tahmin eden son düğüm.",
"id": "t-yaprak",
"match": "yaprak",
"week": 5,
"en": "leaf"
},
{
"term": "Yetersiz uyum",
"def": "Model veriyi yakalayamayacak kadar basit: eğitim hatası da test hatası da yüksek.",
"id": "t-yetersiz-uyum",
"match": "yetersiz uyum",
"week": 3,
"en": "underfitting"
},
{
"term": "Yumuşak marj",
"def": "SVM'nin birkaç noktanın marjı çiğnemesine C ile ayarlanan bir bedel karşılığında izin veren biçimi; ayrılamayan ya da aykırı noktalı veride gerekli. (½‖w‖² + C·Σξ)",
"id": "t-yumusak-marj",
"match": "yumuşak marj",
"week": 7,
"en": "soft margin"
},
{
"term": "z-score",
"def": "Değerden ortalamayı çıkarıp standart sapmaya bölmek: “ortalamadan kaç standart sapma uzakta?” ((x − μ)/σ)",
"id": "t-z-score",
"match": "z-score|z-skoru",
"week": 2,
"en": "standardization"
},
{
"term": "ε-greedy",
"def": "Olasılık ε ile rastgele, 1 − ε ile en iyi bilinen eylemi seçerek keşif ile sömürüyü dengeleme. (P(en iyi) = 1 − ε + ε/|A|)",
"id": "t-greedy",
"match": "ε-greedy",
"week": 12,
"en": "epsilon-greedy"
}
];
