// "How to use this tool" boxes shown at the top of each widget: what it shows, what to try, what you should notice.
// The point is that a tool supports the explanation around it instead of being thrown at the reader.
export const GUIDE = {
  conv1step: {
    what: "Filtreyi sinyalin üzerinde konum konum kaydırır; dolguyu (yok, sıfır, kenar tekrarı) ve adımı değiştirebilirsiniz. Altta sinyal ile çıktı aynı grafikte çizilir.",
    tryit: ["“sonraki konum” ile ilk üç hücrenin 3, 0, 0 olduğunu izleyin.", "Uçları “sıfır dolgu” yapın: ilk hücre 7/3 olur ve çıktı 10 uzunluğa çıkar.", "“basamak sinyali”ni seçip kutu ve fark filtreleri arasında geçiş yapın: biri yumuşatır, öteki sıçramaları yakalar."],
    see: "Alçak geçiren filtre ani değişimleri bastırır, yüksek geçiren filtre yalnız değişimleri bırakır; adım 2 çıktıyı yaklaşık yarıya indirir.",
  },
  poolstep: {
    what: "Görüntüyü bloklara böler ve her bloğun en büyüğünü ya da ortalamasını alır; şu anki blok ve çıktı hücresi birlikte vurgulanır.",
    tryit: ["Max havuzlamada sonucun [[2, 3], [2, 2]] olduğunu görün.", "Ortalamaya geçin.", "Sol üst bloktaki 2'yi bir hücre kaydırın (blok içinde kalacak biçimde): çıktı değişiyor mu?"],
    see: "Havuzlama parametresizdir ve boyutu küçültür; blok içindeki küçük kaymalar çıktıyı değiştirmez.",
  },
  template: {
    what: "Kendi görüntünüzü (6×6, piksellere tıklayarak) ve kendi filtrenizi (hücrelere tıklayarak, boyutu serbest) çizersiniz; filtrenin her konumdaki iç çarpımı renkli bir öznitelik haritası olarak çıkar.",
    tryit: ["X harfinde “\\” ve “/” köşegen filtrelerini karşılaştırın: güçlü yanıt nerelerde?", "Görüntüyü ok düğmeleriyle kaydırın: harita da kayar, filtre aynı kalır.", "Dikey kenar 3×3 filtresini seçip kendi bir kenarınızı çizin; sonra filtrenin bir hücresini değiştirip haritanın nasıl bozulduğunu izleyin."],
    see: "Bir filtre, kendisine benzeyen deseni bulan küçük bir şablondur; aynı birkaç ağırlık her konumda kullanıldığı için parametre azdır ve desen nereye kayarsa kaysın bulunur.",
  },
  cnnstack: {
    what: "Katmanları satır satır yazdığınız (ya da düğmelerle eklediğiniz) bir CNN'i çizer: her katmanın çıktısı, yüksekliği uzamsal boyutu, derinliği kanal sayısını gösteren bir blok olur; altta boyutlar ve parametrelerin tablosu.",
    tryit: ["SmallCNN'de toplamın 25,578 olduğunu ve parametrenin %80'inin son tam bağlı katmanda toplandığını görün.", "“+ pool 2” ekleyerek tam bağlı katmanın parametresini nasıl düşürdüğünü izleyin.", "“havuzlamasız (MLP gibi)” ön ayarıyla aynı görüntüde parametre sayısının nasıl patladığını görün."],
    see: "CNN'ler derine indikçe kanal sayısını artırıp uzamsal boyutu küçültür; parametreler filtrelerde değil çoğunlukla son tam bağlı katmanda toplanır.",
  },
  convstep: {
    what: "Filtreyi görüntünün üzerinde konum konum kaydırır: sarı pencere, filtre ve doldurulan çıktı hücresi birlikte görünür; her hücrenin çarpım toplamı yazılır.",
    tryit: ["“sonraki” ile dört konumu gezip çıktının 0, 2, −1, −1 olduğunu görün.", "Dolguyu 1 yapın: gri sıfır kenarı belirir ve çıktı 4×4 olur.", "Adımı 2 yapın: pencerenin ikişer atladığını ve bazı konumların hiç kullanılmadığını izleyin."],
    see: "Çıktı boyutu formülü, pencerenin sığabildiği konum sayısını sayar; adım büyüdükçe konum sayısı azalır.",
  },
  attnplay: {
    what: "Kendi yazdığınız (en çok dört) anahtarın bulunduğu bir düzlemde sorgu vektörünü tıklayarak taşırsınız; dikkat ağırlıkları çubuklarda ve noktaların büyüklüğünde anında değişir.",
    tryit: ["Sorguyu (1, 0) yönüne getirin: “kedi” ve “üstünde” ağırlık kazanır.", "Kaydırıcıyla sorguyu uzatın: ağırlık tek bir anahtara yığılır.", "√dₖ kutusunu kapatın: aynı sorguda dağılım daha keskin olur."],
    see: "Dikkat, sorguya en çok benzeyen anahtarlara daha çok ağırlık veren yumuşak bir aramadır; ölçek ne kadar büyükse arama o kadar “sert” olur.",
  },
  qcorridor: {
    what: "Bir koridorda ε-greedy davranan bir ajanı adım adım ya da bölüm bölüm eğitir; her adımda yapılan Q güncellemesini yazar. Kare sayısını, ödülleri, α, γ ve ε değerlerini serbestçe değiştirebilirsiniz.",
    tryit: ["Birkaç kez “bir adım”a basın: ilk bölümde yalnız hedefin yanındaki kare olumlu değer alır.", "“20 bölüm”e basın: değerler 4.58, 6.2, 8, 10'a yaklaşır, oklar sağı gösterir.", "ε'u 0 yapıp sıfırlayın: ajan hiç keşif yapmazsa ne oluyor?"],
    see: "Ödül hedeften geriye doğru, her bölümde bir iki kare yayılır; Q-öğrenme, keşif yaparken bile en iyi değerleri öğrenir.",
  },
  kmeans: {
    what: "Verdiğiniz noktalar ve başlangıç merkezleriyle k-ortalamaları yineleme yineleme yürütür: her yinelemede uzaklık kareleri tablosu, atama, yeni merkezler ve SSE.",
    tryit: ["Varsayılan veri sayfadaki örnektir: 2. yinelemede B'nin birinci kümeye geçtiğini görün.", "Merkezleri “1 1” ve “5 5” yapın: tek yinelemede doğru kümeler bulunur.", "Tek boyutlu Problem 1'i deneyin: noktalar 1 2 3 4 6 12 (her biri ayrı satırda), merkezler 2, 3, 4."],
    see: "SSE her yinelemede azalır ya da aynı kalır; atamalar değişmeyince algoritma durur. Kötü başlangıç daha çok yineleme gerektirir.",
  },
  linkage: {
    what: "Bir uzaklık matrisinden birleştirici hiyerarşik kümeleme yapar; her birleşmeyi ve güncellenen uzaklıkları yazar, dendrogramı çizer.",
    tryit: ["Varsayılan matriste tam bağlantının son birleşmesinin 10'da olduğunu görün.", "Bağlantıyı “tek” yapın: son birleşme 5'e iner.", "Problem 2'nin matrisini yazın (P Q R S)."],
    see: "Tam bağlantı en uzak çifte, tek bağlantı en yakın çifte bakar; bu yüzden tek bağlantı kümeleri daha alçakta birleştirir.",
  },
  nbayes: {
    what: "Etiketli metinlerden önsel ve Laplace düzeltmeli kelime olasılıklarını çıkarıp yeni bir metnin sınıf olasılıklarını adım adım hesaplar.",
    tryit: ["Varsayılan örnekte sonucun spam (0.6) çıktığını görün.", "Yeni metni “toplantı yarın” yapın.", "Problem 3'ün verisini yazın: olumlu: harika ürün, olumlu: harika hızlı kargo, olumsuz: kötü ürün, olumsuz: kötü kargo yavaş, olumsuz: yavaş."],
    see: "Önsel olasılık ve tek bir güçlü kelime kararı değiştirebilir; Laplace düzeltmesi görülmemiş kelimelerin çarpımı sıfırlamasını önler.",
  },
  qlearn: {
    what: "Tek bir Q-öğrenme güncellemesini dört adımda hesaplar: en iyi sonraki değer, hedef, fark ve yeni Q.",
    tryit: ["Varsayılan değerlerde sonucun 3.3 olduğunu görün.", "“s′ son durum” kutusunu işaretleyin: hedef yalnız ödül olur.", "α'yı 1 yapın: yeni değer doğrudan hedefe eşit olur."],
    see: "α, eski tahminin hedefe ne kadar yaklaştırılacağını belirler; γ, gelecekteki değerin ne kadar önemsendiğini.",
  },
  valueiter: {
    what: "Düz bir koridorda değer yinelemesini çalıştırır: her yinelemede her karenin değeri, en iyi eylemin ödülü artı varılan karenin indirimli değeridir.",
    tryit: ["Varsayılan ayarlarla değerlerin (6.2, 8, 10) olduğunu görün.", "γ'yı 0.5 yapın: uzaktaki kareler hedefi çok daha az önemser.", "Adım ödülünü 0 yapın: değerler yalnız γ ile küçülür."],
    see: "Hedefin değeri her yinelemede bir kare geriye yayılır; değerler değişmeyi bırakınca en iyi politika okunur.",
  },
  attention: {
    what: "Q, K ve V matrislerinden dikkat ağırlıklarını ve çıktıları hesaplar; seçtiğiniz satır için skor, ölçekleme, softmax ve ağırlıklı toplamı adım adım yazar.",
    tryit: ["Varsayılan değerler sayfadaki elle örnektir: 3. satırın ağırlıklarının 0.248, 0.248, 0.503 çıktığını görün.", "Q'nun ilk satırını 2 0 yapın: ağırlıklar nasıl keskinleşiyor?", "Nedensel maskeyi açın ve 2. satıra bakın: üçüncü kelimenin ağırlığı 0 oluyor."],
    see: "Her satırın ağırlıkları toplamı 1'dir ve çıktı, değer vektörlerinin bu ağırlıklarla karışımıdır. Sorgu büyüdükçe dağılım tek bir kelimeye yığılır.",
  },
  cosine: {
    what: "Yazdığınız vektörlerin her çifti için iç çarpımı, uzunlukları, kosinüs benzerliğini ve Öklid uzaklığını hesaplar; en benzer çiftin hesabını adım adım gösterir.",
    tryit: ["Varsayılan kedi, köpek, borsa örneğinde en benzer çiftin kedi ve köpek olduğunu görün.", "Yeni bir satır ekleyin: “kedi2: 4 2 0”. Kedi ile kosinüsü 1, Öklid uzaklığı ise büyük çıkar."],
    see: "Kosinüs yalnız yöne bakar, Öklid uzaklığı uzunluk farkını da sayar; metin karşılaştırmada kosinüsün tercih edilmesinin nedeni budur.",
  },
  rnnparams: {
    what: "Girdi ve gizli boyuttan yalın RNN, LSTM ve GRU katmanlarının parametre sayısını formülle adım adım hesaplar.",
    tryit: ["Varsayılan d = 4, h = 3 için 24, 96 ve 72 sonuçlarını okuyun.", "d = 128, h = 256 yazın: sayfadaki Problem 4'ün cevabı (394,240 ve 295,680)."],
    see: "Her kapı d + h uzunluğunda bir vektöre bakar; LSTM dört, GRU üç grup taşıdığı için GRU her zaman %25 daha küçüktür.",
  },
  w2v: {
    what: "Bir cümle ve pencere boyu için bütün skip-gram çiftlerini ve CBOW örneklerini listeler, toplam çift sayısını bulur.",
    tryit: ["Pencereyi 1 yapın: 7 kelimeden 12 çift çıkar (geçmiş finaldeki “2-gram” sorusu).", "Kendi 6 kelimelik cümlenizi yazın ve çiftleri önce kâğıtta sayın."],
    see: "Cümlenin uçlarındaki kelimelerin daha az komşusu vardır; toplam, her kelimenin komşu sayılarının toplamıdır.",
  },
  lstmstep: {
    what: "Kapı değerleri verilmiş bir LSTM hücresinde yeni belleği (cₜ) ve yeni gizli durumu (hₜ) adım adım hesaplar.",
    tryit: ["Unutma kapısını 0 yapın: eski bellek tamamen silinir.", "Girdi kapısını 0 yapın: belleğe hiçbir şey yazılmaz.", "Çıktı kapısını 0 yapın: bellek korunur ama dışarıya hiçbir şey verilmez."],
    see: "Bellek çarpılarak değil toplanarak güncellenir; kapılar yalnız ne kadarının kalacağını ve ne kadarının ekleneceğini ayarlar.",
  },
  hypspace: {
    what: "Her özniteliğin kaç değer alabildiğini yazınca kaç farklı örnek (gün), kaç farklı hipotez ve kaç olası kavram olduğunu hesaplar.",
    tryit: ["Varsayılan EnjoySport değerlerini (3 2 2 2 2 2) okuyun: 96 gün, 973 hipotez.", "Sona bir “2” daha ekleyin (yeni öznitelik): sayılar nasıl büyüyor?"],
    see: "Hipotez sayısı (VE'li dilin ifade edebildikleri), olası kavram sayısının (2^gün) yanında çok küçüktür: dili seçmek bir varsayımdır (tümevarımsal yanlılık).",
  },
  finds: {
    what: "Find-S algoritmasını örnek örnek izler: en özel hipotezden başlar, her pozitif örnekte uymayan kısıtı “?” yapar.",
    tryit: ["Tablodaki 3. satırın (Hayır) hipotezi değiştirmediğine dikkat edin.", "Bir satırın sonunu Evet yapın ya da bir değeri değiştirin: hangi kısıt “?” oluyor?"],
    see: "Find-S yalnız pozitif örneklerden öğrenir; sonuç, verideki pozitiflerin hepsini kapsayan en dar VE'li kuraldır.",
  },
  polyfit: {
    what: "10 gürültülü noktaya farklı derecelerde polinom uydurur. Solda eğri, sağda eğitim ve test hatası.",
    tryit: ["Dereceyi 0'dan 9'a kadar tek tek kaydırın ve iki hatayı izleyin.", "M = 9'da λ'yı 0.01 yapın: eğri sakinleşiyor mu?"],
    see: "Eğitim hatası derece arttıkça hep düşer; test hatası önce düşer, sonra (aşırı uyumla) yükselir. En iyi model test hatasının en düşük olduğu yerdedir.",
  },
  scaling: {
    what: "Bir sayı dizisini min-max ve z-score ile ölçekler; sınavdaki ara sütunları (x − μ, (x − μ)²) da gösterir.",
    tryit: ["Diziye 100 gibi uç bir değer ekleyin: min-max değerleri nasıl sıkışıyor?", "Test değeri kutusuna bir sayı yazın: eğitimin min, max, μ ve σ'sı kullanılıyor."],
    see: "Tek bir uç değer min-max'ı bozar; z-score daha dayanıklıdır. Test verisi her zaman eğitimin parametreleriyle dönüştürülür.",
  },
  confusion: {
    what: "Gerçek ve tahmin dizilerinden her örneği TP/FN/FP/TN diye etiketler, 2×2 matrisi kurar ve bütün ölçütleri formülleriyle hesaplar.",
    tryit: ["Tahmin dizisinde bir 0'ı 1 yapın: hangi kutu değişti, precision mı recall mı etkilendi?", "Girdi türünü “sayılar” yapıp 4 sayıyı doğrudan girin."],
    see: "FP artarsa precision düşer, FN artarsa recall düşer. Accuracy ikisini birden gizleyebilir.",
  },
  threshplay: {
    what: "Bir modelin 12 örneğe verdiği skorlar ve gerçek sınıflar. Eşiği kaydırınca hangi örneklere “pozitif” dendiği, karmaşıklık matrisi, ölçütler ve ROC eğrisindeki nokta birlikte değişir.",
    tryit: ["Eşiği en yükseğe çekin: hiç pozitif yok, precision tanımsız, recall 0.", "Eşiği yavaş yavaş düşürün: her + geçişte ROC noktası yukarı, her − geçişte sağa gider.", "Precision ile recall'un ters yönde hareket ettiği aralığı bulun."],
    see: "Eşik bir takastır: düşük eşik daha çok yakalar (recall ↑) ama daha çok yanlış alarm verir (precision ↓). ROC eğrisi bütün eşiklerin özeti, AUC tek sayılık özeti.",
  },
  roc: {
    what: "Skora göre sıralı + / − dizisinden ROC tablosunu, eğrisini ve AUC'yi (çift sayarak) çıkarır.",
    tryit: ["Diziyi hepsi önce + sonra − olacak şekilde yazın: AUC kaç?", "Sırayı tersine çevirin: AUC ne oldu?"],
    see: "Pozitifler ne kadar öndeyse eğri sol üst köşeye o kadar yaklaşır; kusursuz sıralama AUC = 1, rastgele 0.5.",
  },
  regmetrics: {
    what: "Gerçek ve tahmin değerlerinden hata tablosunu ve MSE, RMSE, MAE, R²'yi hesaplar.",
    tryit: ["Bir tahmini 5 birim kaydırın: MSE mi MAE mi daha çok arttı?"],
    see: "Kare aldığı için MSE tek büyük hatadan çok etkilenir; MAE doğrusal artar.",
  },
  pca: {
    what: "2B noktalarda PCA'yı elle yapılan sırayla gösterir: merkezleme, kovaryans, özdeğerler, PC1 yönü ve açıklanan varyans. Grafikte kesikli çizgi PC1.",
    tryit: ["Noktaları neredeyse bir doğru üzerine dizin: PC1'in payı %100'e yaklaşıyor mu?", "Noktaları bir kare gibi dağıtın: iki bileşen eşit mi?"],
    see: "Veri bir yönde uzanıyorsa o yön PC1 olur ve varyansın çoğunu taşır; o zaman tek boyuta inmek az bilgi kaybettirir.",
  },
  knn: {
    what: "Mavi daireler + sınıfı, kırmızı kareler − sınıfı, sarı elmas sorgu (q). q'ya en yakın k nokta halkalanır ve q'ya çizgiyle bağlanır; sağda uzaklık hesapları ve oylama var.",
    tryit: ["q'yu sürükleyip iki sınıfın arasında gezdirin: karar nerede değişiyor?", "k kaydırıcısını 1'den 7'ye çekin: aynı q için karar değişiyor mu?", "Manhattan'a geçin: komşuların sırası değişiyor mu?"],
    see: "Küçük k tek bir komşuya teslim olur (gürültüye duyarlı), büyük k uzaktaki noktaları da sayar. k, kNN'nin esneklik düğmesidir.",
  },
  loo: {
    what: "Doğrulama kümesi yokken k seçmek için: her nokta sırayla dışarıda bırakılır, kalanlarla tahmin edilir, doğruluk sayılır (birini dışarıda bırak, LOO).",
    tryit: ["Tablodaki ✗ satırlarına bakın: hangi noktalar yanlış tahmin ediliyor, neden?", "Denenecek k'lara 5 ekleyin."],
    see: "Eğitim doğruluğu (k = 1'de hep %100) yanıltıcıdır; LOO dürüst bir tahmindir ve en iyi k'yı gösterir.",
  },
  lsq: {
    what: "Tek değişkenli en küçük kareleri sınav tablosu gibi sütun sütun kurar ve doğruyu çizer.",
    tryit: ["Bir y değerini çok büyütün (aykırı nokta): eğim ne kadar değişiyor?"],
    see: "Doğru her zaman (x̄, ȳ)'den geçer ve artıkların toplamı 0'dır; tek bir aykırı nokta doğruyu kendine çekebilir.",
  },
  gdplay: {
    what: "Basit bir kayıp eğrisi L(w) üzerinde gradyan inişini adım adım çizer. Kırmızı noktalar w'nin her adımdaki yeri.",
    tryit: ["η = 0.2 ile “Bir adım”a birkaç kez basın: adımlar nasıl küçülüyor?", "η'yı 0.9 yapın: iki yana savrulma; 1.06 yapın: ıraksama."],
    see: "Her adım eğimin tersine gider; eğim minimumda 0 olduğu için adımlar kendiliğinden küçülür. η çok büyükse minimumu aşar.",
  },
  gd: {
    what: "Aynı gradyan inişini sınavdaki gibi tablo hâlinde yazar (ŷ = w·x, verilen noktalar).",
    tryit: ["η'yı 1 yapıp ıraksamayı tabloda görün."],
    see: "Her satırda: eğimi hesapla, w − η·eğim ile yeni w'yi bul.",
  },
  lineplay: {
    what: "Bir doğrusal sınıflandırıcının ağırlıklarını (w₁, w₂) ve kesişimini (b) elle ayarlıyorsunuz. Renkli bölgeler modelin + ve − dediği taraflar, ok w vektörü, çarpılı noktalar yanlış sınıflananlar.",
    tryit: ["Yalnız b'yi değiştirin: doğru kendine paralel kayıyor.", "Yalnız w₁ ya da w₂'yi değiştirin: doğru dönüyor.", "Görev: bütün çarpıları yok edin."],
    see: "w doğruya diktir ve + tarafı gösterir; b sınırı kaydırır. Her noktanın z = w·x + b değeri hem tarafını (işaret) hem uzaklığını (büyüklük) söyler.",
  },
  boundary: {
    what: "Verilen w, b için doğrunun denklemini, noktaların sınıfını ve sınıra uzaklıklarını tablo hâlinde verir.",
    tryit: ["w ve b'yi aynı sayıyla çarpın: hiçbir şey değişmiyor."],
    see: "Doğru aynı kalır; yalnız z'lerin ölçeği değişir.",
  },
  gates: {
    what: "Tek bir nöronun (z = w₁x₁ + w₂x₂ + b ≥ 0 ise çıktı 1) hangi mantık kapısını hesapladığını gösterir.",
    tryit: ["AND, OR, NAND düğmelerine basıp ağırlıkları inceleyin.", "XOR'u (0110) veren bir w, b bulmaya çalışın."],
    see: "AND/OR/NAND tek doğruyla ayrılır; XOR ayrılmaz: bu yüzden gizli katman gerekir.",
  },
  sigplay: {
    what: "Skor z'yi kaydırınca sigmoid'in verdiği olasılığı ve iki durumdaki log-loss'u gösterir.",
    tryit: ["z = 0: p = 0.5 ve iki kayıp da 0.693.", "z = 4'e çekin ve y = 0 kaybına bakın."],
    see: "Doğru sınıfa yüksek olasılık verirsen kayıp küçük; emin olup yanılırsan kayıp çok büyür.",
  },
  logstep: {
    what: "Tek bir örnek üzerinde lojistik regresyonun bir gradyan adımını sınav sırasıyla hesaplar: z, p, kayıp, gradyan, yeni w ve b, yeni p.",
    tryit: ["y'yi 0 yapın: ağırlıklar bu sefer hangi yöne değişiyor?", "η'yı büyütün: kayıp hâlâ düşüyor mu?"],
    see: "Adım her zaman doğru sınıfın olasılığını artırır (kayıp düşer); düşmüyorsa η çok büyüktür ya da işaret yanlıştır.",
  },
  perceptron: {
    what: "Perceptron'u örnek örnek oynatır. Halkalı nokta şu an işlenen örnek, kesikli gri çizgi bir önceki sınır, çarpılı noktalar şu an yanlış sınıflananlar; üstteki kutu her adımda ne olduğunu ve nedenini anlatır.",
    tryit: ["“İleri ▶” ile adım adım gidin ve her güncellemede doğrunun nasıl döndüğünü izleyin.", "Bir noktayı sürükleyip veriyi ayrılamaz yapın: algoritma hiç durmuyor.", "η'yı değiştirin: doğru ne kadar hızlı dönüyor?"],
    see: "Yalnız yanlış sınıflanan örnekler değişikliğe yol açar; her güncelleme sınırı o örneğin doğru tarafa geçeceği yöne çevirir. Ayrılabilir veride sonunda hatasız bir tur gelir.",
  },
  softmax: {
    what: "Sınıf skorlarını olasılıklara çevirir ve çapraz entropi kaybını hesaplar.",
    tryit: ["Bir skoru 3 artırın: olasılıklar nasıl yeniden dağılıyor?"],
    see: "Olasılıklar her zaman toplamı 1 olacak şekilde paylaşılır; en büyük skor en büyük payı alır.",
  },
  entplay: {
    what: "Bir düğümdeki Evet/Hayır sayılarını değiştirdikçe entropi ve Gini'nin hesabını ve eğrideki yerini gösterir.",
    tryit: ["Sayıları eşitleyin (örn. 4 ve 4): entropi 1.", "Birini 0 yapın: entropi 0 (saf düğüm)."],
    see: "Entropi karışıklığın ölçüsüdür: en çok yarı yarıyada, hiç saf düğümde. Ağaç her bölmede bu karışıklığı en çok azaltan soruyu seçer.",
  },
  id3: {
    what: "Tablodaki veriden ID3 ağacını kurar. Önce kökü tahmin etmenizi ister, sonra her seviyede bütün adayların kazanç tablosunu açar.",
    tryit: ["Tahmininizi seçin ve kazanç tablosunda neden doğru/yanlış olduğuna bakın.", "“Sonraki seviye” ile ağacın nasıl derinleştiğini izleyin.", "Ölçütü Gini ya da kazanç oranı yapın: kök değişiyor mu?"],
    see: "Kök, dallarını en saf yapan özniteliktir (en büyük kazanç). Saf dallar hemen yaprak olur; karışık dallarda aynı hesap kalan özniteliklerle tekrarlanır.",
  },
  threshold: {
    what: "Sayısal bir öznitelik için bütün aday eşikleri (ardışık değerlerin ortaları) ve her birinin kazancını hesaplar.",
    tryit: ["“Sınıf değişiyor mu?” sütununa bakın: en iyi eşik hep “evet” olanlardan biri mi?"],
    see: "Sınıfın değişmediği yere eşik koymak kazanç getirmez; sınavda yalnız sınıfın değiştiği orta noktaları denemek yeter.",
  },
  regtree: {
    what: "Regresyon ağacında bir bölmenin SSE'yi (kareler toplamını) ne kadar azalttığını hesaplar.",
    tryit: ["y değerlerini iki grup belirgin olacak şekilde değiştirin."],
    see: "En iyi bölme, iki tarafı kendi içinde en tutarlı yapan (SSE'yi en çok düşüren) eşiktir.",
  },
  vote: {
    what: "Bağımsız n modelin her biri p olasılıkla doğruysa çoğunluk oyunun hata olasılığını hesaplar.",
    tryit: ["p = 0.8 iken n'yi 1, 3, 5'e çıkarın.", "p'yi 0.45 yapın: kalabalık bu sefer daha mı kötü?"],
    see: "Modeller %50'den iyi ve bağımsızsa çoğunluk tek modelden iyidir. Gerçekte modeller benzer hatalar yaptığı için kazanç daha küçüktür.",
  },
  bootstrap: {
    what: "Yerine koyarak n çekilişte belirli bir örneğin hiç seçilmeme olasılığını verir.",
    tryit: ["n'yi 4, 10, 1000 yapın: değer nereye yaklaşıyor?"],
    see: "≈ %37 torba dışında kalır; bu örnekler o ağaç için bedava test verisidir.",
  },
  adaboost: {
    what: "AdaBoost'u tur tur oynatır. Noktaların büyüklüğü ağırlıklarıdır; seçilen kütüğün sınırı çizgiyle, yanlış bildiği noktalar çarpıyla gösterilir.",
    tryit: ["“Sonraki tur”a basın ve yanlış bilinen noktanın nasıl büyüdüğünü izleyin.", "Her turda seçilen kütüğün neden o olduğunu (ağırlıklı hata) okuyun."],
    see: "Her tur, önceki turların yanlış bildiği noktalara ağırlık verir; sonunda zayıf kütüklerin ağırlıklı oyu bütün noktaları doğru bilebilir.",
  },
  gboost: {
    what: "Gradyan artırmanın her turunda kalıntıları, kalıntılara uydurulan kütüğü ve güncellenen tahmini tablo hâlinde gösterir.",
    tryit: ["η'yı 1 yapın: ikinci tur bir şey ekleyebiliyor mu?"],
    see: "Her tur, o ana kadarki hatanın (kalıntının) bir kısmını düzeltir.",
  },
  svmpoint: {
    what: "Verilen w, b için marjı ve her noktanın sınıra göre konumunu (y·f, menteşe kaybı) hesaplar.",
    tryit: ["Bir noktayı sınıra yaklaştırın: y·f 1'in altına inince menteşe kaybı başlıyor."],
    see: "y·f ≥ 1: sokağın dışında, kayıp 0. 0 < y·f < 1: sokağın içinde. y·f < 0: yanlış tarafta.",
  },
  hardsvm: {
    what: "Noktalar için en geniş sokağı (sert marjlı SVM) hesaplar. Düz çizgi karar sınırı, kesikli çizgiler sokağın kenarları, halkalı (DV) noktalar destek vektörleri.",
    tryit: ["Destek vektörü olmayan bir noktayı sürükleyin: sokak değişmiyor.", "Bir destek vektörünü sürükleyin: sokak hemen değişiyor.", "Bir noktayı karşı sınıfın içine götürün: çözüm kayboluyor."],
    see: "SVM'nin çözümü yalnız destek vektörlerine bağlıdır. Sınavdaki hesap: destek vektörlerini seç, her biri için w·x + b = ±1 yaz, çöz.",
  },
  softsvm: {
    what: "İki aday sınırı yumuşak marj amacıyla (½‖w‖² + C·Σξ) karşılaştırır.",
    tryit: ["C değerlerine 0.1 ve 100 ekleyin: hangi aday ne zaman kazanıyor?"],
    see: "Küçük C geniş marjı tercih eder (birkaç ihlal olur), büyük C ihlalsizliği (dar marj).",
  },
  kernel: {
    what: "İki nokta için doğrusal, polinom ve RBF çekirdek değerlerini hesaplar.",
    tryit: ["γ'yı büyütün: RBF benzerliği ne kadar hızlı düşüyor?"],
    see: "Çekirdek, iki noktanın yüksek boyutlu bir uzaydaki iç çarpımıdır; o uzaya hiç gitmeden hesaplanır.",
  },
  hyper: {
    what: "Her satır için yanlılık, varyans ve aşırı uyum riskinin nasıl değiştiğini seçip denetleyin.",
    tryit: ["Önce kuralı hatırlayın: esneklik artarsa yanlılık ↓, varyans ↑."],
    see: "Kırmızı satırların “neden” sütununu okuyun: sınavda tek cümlelik gerekçe istenir.",
  },
  drill: {
    what: "Seçtiğiniz türden rastgele bir sınav sorusu üretir; cevaplarınızı denetler ve çözümü gösterir.",
    tryit: ["Önce kendi başınıza çözün, sonra “Denetle”.", "Kırmızı kutu varsa çözümü açmadan bir kez daha deneyin."],
    see: "Her soru bir numarayla tekrar üretilebilir; aynı türden 3 soruyu üst üste doğru yaptıysanız o konu hazır.",
  },
};
