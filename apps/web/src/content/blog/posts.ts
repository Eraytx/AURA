export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  author: string;
  category: string;
  tags: string[];
  lang: "tr" | "en";
  featured: boolean;
  readingTime: number;
  content: string; // HTML format for rendering
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "NFP Verisi XAUUSD'yi Nasıl Etkiler? Tarihsel Analiz",
    slug: "nfp-xauusd-etkisi",
    description: "Tarım Dışı İstihdam (NFP) verisinin altın fiyatları (XAUUSD) üzerindeki tarihsel etkisi ve volatilite kalıplarının derinlemesine analizi.",
    publishedAt: "2026-07-01",
    author: "AURA Analiz Ekibi",
    category: "Makro Analiz",
    tags: ["NFP", "XAUUSD", "İstihdam"],
    lang: "tr",
    featured: true,
    readingTime: 8,
    content: `
      <h2>Tarım Dışı İstihdam (NFP) Nedir ve Altın İçin Neden Önemlidir?</h2>
      <p>Tarım Dışı İstihdam (Non-Farm Payrolls - NFP) verisi, ABD ekonomisindeki istihdam durumunu gösteren en kritik makroekonomik veridir. Her ayın ilk Cuma günü açıklanan bu veri, tarım sektörü dışındaki çalışanların sayısındaki değişimi ölçer. Verinin beklentilerden güçlü veya zayıf gelmesi, Federal Rezerv (Fed) para politikası kararları üzerinde doğrudan belirleyicidir.</p>
      
      <h2>NFP ve XAUUSD Arasındaki Ters Korelasyon</h2>
      <p>Tarihsel olarak, güçlü bir istihdam verisi ABD Dolarını desteklerken altın fiyatlarında satış baskısı yaratır. Bunun temel nedeni, güçlü istihdamın ekonomik canlanmayı ve dolayısıyla olası enflasyonist baskıları simgelemesidir. Fed, güçlü istihdam ortamında faizleri yüksek tutma veya artırma eğilimindedir. Altın, faiz getirmeyen bir varlık olduğu için yüksek faiz ortamlarında cazibesini yitirir.</p>

      <h2>Tarihsel Volatilite Kalıpları</h2>
      <p>NFP açıklandığı ilk 5 dakika içinde XAUUSD paritesinde ortalama 100-250 pip ($10 - $25) arasında ani hareketler gözlemlenir. Verinin sürpriz sapma derecesi arttıkça volatilite boyutu katlanır. Başarılı altın traderları veri açıklanma anında spread açılmalarına karşı dikkatli olmalı ve anlık emir gönderimlerinden ziyade önceden belirlenmiş destek ve direnç kırılımlarına odaklanmalıdır.</p>
    `
  },
  {
    title: "Fed Faiz Kararları ve Altın Fiyatı İlişkisi",
    slug: "fed-faiz-karari-altin",
    description: "Fed faiz kararlarının ve faiz patikasının altın (XAUUSD) fiyatlamaları üzerindeki kısa ve uzun vadeli etkileri.",
    publishedAt: "2026-06-25",
    author: "AURA Analiz Ekibi",
    category: "Fed Politika",
    tags: ["Fed", "Faiz", "XAUUSD"],
    lang: "tr",
    featured: false,
    readingTime: 6,
    content: `
      <h2>Faiz Oranları ve Fırsat Maliyeti</h2>
      <p>Fed'in faiz kararları, altın fiyatlarının yönünü tayin eden en güçlü katalizördür. Faiz oranları yükseldiğinde, devlet tahvilleri gibi risksiz getiri sağlayan varlıkların cazibesi artar. Bu durum, faiz ödemesi yapmayan fiziksel altının 'fırsat maliyetini' yükseltir ve yatırımcıları altından uzaklaştırır. Aksine, faiz indirim dönemlerinde altının çekim gücü katlanır.</p>

      <h2>Uzun Vadeli Döngüler</h2>
      <p>Tarihsel trendler incelendiğinde, Fed'in faiz artırım döngülerinin sonuna gelindiğinde altının ralli başlattığı görülmektedir. 'Piyasa beklentiyi satın alır, gerçekleşeni satar' kuralı gereğince, faiz artışlarının durdurulacağı sinyali geldiği an XAUUSD paritesi dip seviyelerinden güçlü bir toparlanma sürecine girer.</p>
    `
  },
  {
    title: "CPI Enflasyon Verisi Yayınlandığında Altında Ne Olur?",
    slug: "cpi-enflasyon-altin-etkisi",
    description: "Tüketici Fiyat Endeksi (CPI) enflasyon verisi açıklandığı an altın fiyatlarındaki anlık ve trend yönlü değişimler.",
    publishedAt: "2026-06-18",
    author: "AURA Analiz Ekibi",
    category: "Enflasyon",
    tags: ["CPI", "Enflasyon", "XAUUSD"],
    lang: "tr",
    featured: false,
    readingTime: 7,
    content: `
      <h2>Altının Enflasyondan Korunma Aracı Rolü</h2>
      <p>Tüketici Fiyat Endeksi (CPI), enflasyonu ölçen ana göstergedir. Altın geleneksel olarak enflasyona karşı bir koruma (hedge) aracı olarak kabul edilse de, modern finansal piyasalardaki tepkiler daha karmaşıktır. Yüksek enflasyon verisi geldiğinde altın ilk etapta yükselme eğilimi gösterebilir. Ancak bu durum Fed'in daha şahin bir faiz artırımına gideceği beklentisini tetiklerse, doların güçlenmesiyle altın sert düşüşler yaşayabilir.</p>
    `
  },
  {
    title: "DXY Dolar Endeksi ile XAUUSD Korelasyonu",
    slug: "dxy-dolar-endeksi-altin",
    description: "ABD Doları Endeksi (DXY) ile ons altın arasındaki ters korelasyon mekanizmasının analizi.",
    publishedAt: "2026-06-10",
    author: "AURA Analiz Ekibi",
    category: "Korelasyonlar",
    tags: ["DXY", "USD", "Altın"],
    lang: "tr",
    featured: false,
    readingTime: 5,
    content: `
      <h2>Ters Korelasyonun Temelleri</h2>
      <p>DXY endeksi, ABD Dolarının diğer 6 majör para birimi sepetine karşı değerini ölçer. Altın ons bazında USD ile fiyatlandırıldığı için, doların değer kazanması (DXY yükselişi) altının diğer para birimlerini kullanan alıcılar için pahalılaşmasına yol açar ve talebi azaltarak fiyatı düşürür. DXY düştüğünde ise altın ucuzlar ve alıcı bulur.</p>
    `
  },
  {
    title: "XAUUSD Trading'de Ekonomik Takvim Kullanımı",
    slug: "ekonomik-takvim-altin-trading",
    description: "Altın işlemlerinde ekonomik takvim verilerini doğru okuma ve planlama yöntemleri.",
    publishedAt: "2026-06-03",
    author: "AURA Analiz Ekibi",
    category: "Eğitim",
    tags: ["Takvim", "Forex", "Trading"],
    lang: "tr",
    featured: false,
    readingTime: 6,
    content: `
      <h2>Ekonomik Takvimi Okuma Sanatı</h2>
      <p>Ekonomik takvimler, başarılı bir traderın yol haritasıdır. Yalnızca haberin açıklanacağı saati bilmek yetmez; beklenti (forecast) ve önceki (previous) değerler arasındaki farkların piyasa tarafından nasıl fiyatlandırıldığını analiz etmek gerekir. AURA XAUUSD portalı, bu takvim verilerini yapay zeka ve geçmiş tepki grafikleriyle birleştirerek size eşsiz bir avantaj sunar.</p>
    `
  }
];
