// "How to use this tool" boxes shown at the top of each widget: what it shows, what to try, what you should notice.
// The point is that a tool supports the explanation around it instead of being thrown at the reader.
export const GUIDE = {
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
    what: "Tek bir nöronun (z = w₁x₁ + w₂x₂ + b ≥ 0 → 1) hangi mantık kapısını hesapladığını gösterir.",
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
