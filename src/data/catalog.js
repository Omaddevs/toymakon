/** Asosiy 3 ta yo‘nalish — katalog va qidiruv shu sluglar bo‘yicha ishlaydi */
export const PRIMARY_CATEGORIES = [
  {
    id: 'venue',
    slug: 'toyxona',
    title: "To‘yxona topib berish",
    shortLabel: "To‘yxona",
    subtitle: 'Zal, mehmonlar sig‘imi, joylashuv va narx',
    icon: 'ph-buildings',
    searchHint: 'To‘yxona, zal, restoran',
  },
  {
    id: 'media',
    slug: 'foto-video',
    title: 'Fotograf / videograf topib berish',
    shortLabel: 'Foto / video',
    subtitle: 'To‘y, love story, operator va montaj',
    icon: 'ph-camera',
    searchHint: 'Fotograf, videograf, studio',
  },
  {
    id: 'decor',
    slug: 'dekor',
    title: 'Dekor / marry me joy topib berish',
    shortLabel: 'Dekor / Marry me',
    subtitle: 'Zal bezatish, marry me, fotozona',
    icon: 'ph-sparkle',
    searchHint: 'Dekor, marry me, arxa fon',
  },
];

const cat = (slug) => PRIMARY_CATEGORIES.find((c) => c.slug === slug);

export const VENDORS = [
  {
    id: 'v-versal',
    categoryId: 'venue',
    slug: 'versal-restaurant',
    name: 'Versal Restaurant',
    district: "Yunusobod",
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    ],
    priceLabel: "50 000 so'm",
    priceNote: '/ kishi',
    badge: 'Top',
    footerLine: '400 – 800 kishi',
    footerIcon: 'ph-users',
    phone: '+998 71 200 00 01',
    description:
      "Zamonaviy zal, sahna yoritmasi va ovoz yechimi bilan to‘liq jihozlangan. Mehmonlar uchun alohida kirish va avtoturargoh mavjud.",
    specs: [
      { label: 'Sig‘im', value: '400 – 800 kishi' },
      { label: 'Joylashuv', value: "Yunusobod tumani" },
      { label: 'Ovqat', value: 'Milliy va Yevropa menyusi' },
    ],
  },
  {
    id: 'v-osiyo',
    categoryId: 'venue',
    slug: 'osiyo-grand',
    name: 'Osiyo Grand Hall',
    district: 'Chilonzor',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80'],
    priceLabel: "45 000 so'm",
    priceNote: '/ kishi',
    badge: null,
    footerLine: '300 – 600 kishi',
    footerIcon: 'ph-users',
    phone: '+998 71 200 00 02',
    description:
      'Katta zal va VIP xonalar. To‘y tartibi bo‘yicha maslahatchi va registrator xizmati mavjud.',
    specs: [
      { label: 'Sig‘im', value: '300 – 600 kishi' },
      { label: 'Joylashuv', value: 'Chilonzor' },
      { label: 'Qo‘shimcha', value: 'LED ekran, tadbir koordinatori' },
    ],
  },
  {
    id: 'v-humo',
    categoryId: 'venue',
    slug: 'humo-event',
    name: 'Humo Event',
    district: "Mirzo Ulug'bek",
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    priceLabel: "60 000 so'm",
    priceNote: '/ kishi',
    badge: 'Yangi',
    footerLine: '200 – 450 kishi',
    footerIcon: 'ph-users',
    phone: '+998 71 200 00 03',
    description:
      "Yorqin interyer va ochiq havoda suratga olish maydonchasi. Kichik va o‘rta hajmdagi to‘ylar uchun qulay.",
    specs: [
      { label: 'Sig‘im', value: '200 – 450 kishi' },
      { label: 'Joylashuv', value: "Mirzo Ulug'bek" },
      { label: 'Maydon', value: 'Ochiq terrasa' },
    ],
  },
  {
    id: 'v-azizov',
    categoryId: 'media',
    slug: 'azizov-studio',
    name: 'Azizov Studio',
    district: 'Chilonzor',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a09a3b91e17a?auto=format&fit=crop&w=800&q=80',
    ],
    priceLabel: "2 000 000 so'm",
    priceNote: 'to‘liq paketdan',
    badge: 'Top',
    footerLine: '4.9 · 120 sharh',
    footerIcon: 'ph-star',
    phone: '+998 90 123 45 67',
    description:
      'To‘y kunining to‘liq foto va video qayd etish: 2 operator, dron, tez montajli treyler. Love story alohida paket.',
    specs: [
      { label: 'Xizmat', value: 'Foto + video + montaj' },
      { label: 'Muddat', value: 'To‘y kuni + 10 ish kuni ichida treyler' },
      { label: 'Qo‘shimcha', value: 'Dron, yorug‘lik jihozlari' },
    ],
  },
  {
    id: 'v-lens',
    categoryId: 'media',
    slug: 'lens-art',
    name: 'Lens Art Media',
    district: 'Yakkasaroy',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    priceLabel: "1 500 000 so'm",
    priceNote: 'foto paket',
    badge: null,
    footerLine: '4.8 · 64 sharh',
    footerIcon: 'ph-star',
    phone: '+998 91 234 56 78',
    description:
      'Natural rang va tez javob. To‘y oldi love story va engagement suratlari.',
    specs: [
      { label: 'Xizmat', value: 'Foto, video, grafik dizayn' },
      { label: 'Uslub', value: 'Minimal, film look' },
      { label: 'Joy', value: 'Studiya + chiqish' },
    ],
  },
  {
    id: 'v-kino',
    categoryId: 'media',
    slug: 'kino-uz',
    name: 'KinoUZ Videoteam',
    district: 'Shayxontohur',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    priceLabel: "3 500 000 so'm",
    priceNote: 'kino format',
    badge: null,
    footerLine: '5.0 · 38 sharh',
    footerIcon: 'ph-star',
    phone: '+998 93 345 67 89',
    description:
      'Kinematografik operatorlar, gimbal, yoritish. To‘ydan keyin to‘liq film (20–40 daqiqa).',
    specs: [
      { label: 'Xizmat', value: '2 kamera, pro yoritish' },
      { label: 'Natija', value: 'Treyler + to‘liq film' },
      { label: 'Til', value: 'O‘zbek, rus' },
    ],
  },
  {
    id: 'v-royal',
    categoryId: 'decor',
    slug: 'royal-decorators',
    name: 'Royal Decorators',
    district: "Mirzo Ulug'bek",
    image: 'https://images.unsplash.com/photo-1561571994-3f61c114d1d9?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f29da43c0f?auto=format&fit=crop&w=800&q=80',
    ],
    priceLabel: "5 000 000 so'm",
    priceNote: 'boshlab',
    badge: 'Premium',
    footerLine: 'Zal + kirish gullari',
    footerIcon: 'ph-flower',
    phone: '+998 94 456 78 90',
    description:
      'Klassik va zamonaviy bezatish: archa, fon, stol dekoratsiyasi. Marry me zonasi va fotowall alohida loyiha.',
    specs: [
      { label: 'Yo‘nalish', value: 'Zal dekor, fotozona' },
      { label: 'Marry me', value: 'Park / roof / studiya' },
      { label: 'Material', value: 'Jonli gullar, mato, LED' },
    ],
  },
  {
    id: 'v-bloom',
    categoryId: 'decor',
    slug: 'bloom-marry',
    name: 'Bloom Marry Me',
    district: 'Yunusobod',
    image: 'https://images.unsplash.com/photo-1522673607200-164506f2ce48?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    priceLabel: "2 800 000 so'm",
    priceNote: 'marry me paket',
    badge: null,
    footerLine: 'Joy + bezatish + foto',
    footerIcon: 'ph-heart',
    phone: '+998 95 567 89 01',
    description:
      "Taklif uchun tayyor joylar: botanika bog‘i, tom, studiya. So‘zlarni yozish, muzika va suratga olish rejasi.",
    specs: [
      { label: 'Marry me', value: 'Joy tanlash, sxema' },
      { label: 'Vaqt', value: 'Kechqurun / ertalab' },
      { label: 'Bonus', value: 'Qisqa video clip' },
    ],
  },
  {
    id: 'v-minimal',
    categoryId: 'decor',
    slug: 'minimal-stage',
    name: 'Minimal Stage',
    district: 'Sergeli',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80',
    gallery: [],
    priceLabel: "3 200 000 so'm",
    priceNote: 'sahna + LED',
    badge: null,
    footerLine: 'Geometrik arka',
    footerIcon: 'ph-polygon',
    phone: '+998 97 678 90 12',
    description:
      'Zamonaviy geometrik arka va rangli LED. Kichik zallar uchun optimallashtirilgan.',
    specs: [
      { label: 'Uslub', value: 'Minimal, LED' },
      { label: 'Sig‘im', value: '100 – 250 kishi zallar' },
      { label: 'Muddat', value: 'O‘rnatish 1 kun' },
    ],
  },
];

export function getCategoryBySlug(slug) {
  return PRIMARY_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getVendorsByCategoryId(categoryId) {
  return VENDORS.filter((v) => v.categoryId === categoryId);
}

export function getVendorById(id) {
  return VENDORS.find((v) => v.id === id) ?? null;
}

export function searchVendors(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return VENDORS;
  return VENDORS.filter((v) => {
    const cat = PRIMARY_CATEGORIES.find((c) => c.id === v.categoryId);
    const hay = `${v.name} ${v.district} ${cat?.title ?? ''} ${cat?.searchHint ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}
