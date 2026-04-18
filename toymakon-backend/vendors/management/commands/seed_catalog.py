import copy

from django.core.management.base import BaseCommand

from vendors.models import Category, Review, Vendor, VendorImage, VendorSpec

SEED_CATEGORIES = [
    {
        'id': 'venue',
        'slug': 'toyxona',
        'title': "To‘yxona topib berish",
        'short_label': "To‘yxona",
        'subtitle': 'Zal, mehmonlar sig‘imi, joylashuv va narx',
        'icon': 'ph-buildings',
        'search_hint': 'To‘yxona, zal, restoran',
        'is_primary': True,
    },
    {
        'id': 'media',
        'slug': 'fotostudio',
        'title': 'FotoStudio — fotograf va videograf',
        'short_label': 'FotoStudio',
        'subtitle': 'To‘y, love story, operator va montaj',
        'icon': 'ph-camera',
        'search_hint': 'FotoStudio, fotograf, videograf, studio',
        'is_primary': True,
    },
    {
        'id': 'decor',
        'slug': 'dekor',
        'title': 'Dekor va zal bezatish',
        'short_label': 'Dekor',
        'subtitle': 'Archa, fon, stol, fotozona, LED',
        'icon': 'ph-confetti',
        'search_hint': 'Dekor, zal, archa, gullar, LED',
        'is_primary': True,
    },
    {
        'id': 'marryme',
        'slug': 'marry-me',
        'title': 'Marry me joy va taklif',
        'short_label': 'Marry me',
        'subtitle': 'Taklif maydoni, bezatish, joy, sxema',
        'icon': 'ph-heart',
        'search_hint': 'Marry me, taklif, romantik joy, engagement',
        'is_primary': True,
    },
    {
        'id': 'invitation',
        'slug': 'taklifnoma',
        'title': 'Taklifnoma va poligrafiya',
        'short_label': 'Taklifnoma',
        'subtitle': 'Dizayn, bosma, lazerniy kesish, onlayn taklif',
        'icon': 'ph-envelope-open',
        'search_hint': 'Taklifnoma, qog‘oz, bosma, kartochka',
        'is_primary': False,
    },
    {
        'id': 'attire',
        'slug': 'liboslar',
        'title': 'Kelin va kuyov liboslari',
        'short_label': 'Liboslar',
        'subtitle': 'Ijaraga yoki sotuv, milliy va klassik',
        'icon': 'ph-dress',
        'search_hint': 'Libos, kelin, kuyov, milliy kiyim',
        'is_primary': False,
    },
    {
        'id': 'transport',
        'slug': 'avto',
        'title': 'To‘y avto va transfer',
        'short_label': 'Avto xizmat',
        'subtitle': 'Retro, limuzin, VIP transfer, konvoy',
        'icon': 'ph-car-profile',
        'search_hint': 'Avto, limuzin, transfer, retro mashina',
        'is_primary': False,
    },
    {
        'id': 'mc',
        'slug': 'tamada',
        'title': 'Tamada va dastur boshlovchisi',
        'short_label': 'Tamada',
        'subtitle': 'O‘zbek va rus tilida, jonli dastur',
        'icon': 'ph-microphone-stage',
        'search_hint': 'Tamada, vedushchi, dastur, o‘yinlar',
        'is_primary': False,
    },
]

SEED_VENDORS = [
    {
        'id': 'v-versal',
        'category_id': 'venue',
        'slug': 'versal-restaurant',
        'name': 'Versal Restaurant',
        'district': 'Yunusobod',
        'location': "Yunusobod tumani, Amir Temur shoh ko‘chasi 12",
        'description': "Zamonaviy zal, sahna yoritmasi va ovoz yechimi bilan to‘liq jihozlangan. Mehmonlar uchun alohida kirish va avtoturargoh mavjud.",
        'tagline': 'Zamonaviy zal, professional yoritma va ovoz — katta to‘ylar uchun.',
        'price_label': "50 000 so'm",
        'price_note': '/ kishi',
        'badge': 'Top',
        'footer_line': '400 – 800 kishi',
        'footer_icon': 'ph-users',
        'phone': '+998 71 200 00 01',
        'telegram': 'versal_wedding',
        'main_image': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
        'gallery': [
            'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
        ],
        'specs': [
            {'label': 'Sig‘im', 'value': '400 – 800 kishi'},
            {'label': 'Joylashuv', 'value': 'Yunusobod tumani'},
            {'label': 'Ovqat', 'value': 'Milliy va Yevropa menyusi'},
        ],
        'reviews': [
            {
                'author': 'Jasur',
                'rating': 5,
                'text': 'Zal juda chiroyli, ovoz va yoritma professional darajada. Tavsiya qilaman.',
            },
            {
                'author': 'Madina',
                'rating': 4,
                'text': 'Mehmonlar bilan joy yetarli, menejerlar yordam berishdi.',
            },
        ],
    },
    {
        'id': 'v-osiyo',
        'category_id': 'venue',
        'slug': 'osiyo-grand',
        'name': 'Osiyo Grand Hall',
        'district': 'Chilonzor',
        'location': 'Chilonzor tumani, Bunyodkor ko‘chasi 45',
        'description': 'Katta zal va VIP xonalar. To‘y tartibi bo‘yicha maslahatchi va registrator xizmati mavjud.',
        'tagline': 'Katta zal, VIP zonalar va LED — o‘rta va katta to‘ylar uchun.',
        'price_label': "45 000 so'm",
        'price_note': '/ kishi',
        'badge': '',
        'footer_line': '300 – 600 kishi',
        'footer_icon': 'ph-users',
        'phone': '+998 71 200 00 02',
        'telegram': 'osiyo_grand',
        'main_image': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
        'gallery': ['https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=800&q=80'],
        'specs': [
            {'label': 'Sig‘im', 'value': '300 – 600 kishi'},
            {'label': 'Joylashuv', 'value': 'Chilonzor'},
            {'label': 'Qo‘shimcha', 'value': 'LED ekran, tadbir koordinatori'},
        ],
        'reviews': [
            {
                'author': 'Dilshod',
                'rating': 5,
                'text': 'LED ekran va zal dizayni zo‘r. Narxlari ham mos keldi.',
            },
        ],
    },
    {
        'id': 'v-humo',
        'category_id': 'venue',
        'slug': 'humo-event',
        'name': 'Humo Event',
        'district': "Mirzo Ulug'bek",
        'location': "Mirzo Ulug'bek tumani, Buyuk ipak yo‘li 88",
        'description': "Yorqin interyer va ochiq havoda suratga olish maydonchasi. Kichik va o‘rta hajmdagi to‘ylar uchun qulay.",
        'tagline': 'Terrasa va zamonaviy interyer — kichik va o‘rta to‘ylar uchun.',
        'price_label': "60 000 so'm",
        'price_note': '/ kishi',
        'badge': 'Yangi',
        'footer_line': '200 – 450 kishi',
        'footer_icon': 'ph-users',
        'phone': '+998 71 200 00 03',
        'telegram': 'humo_event_uz',
        'main_image': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
        'gallery': [],
        'specs': [
            {'label': 'Sig‘im', 'value': '200 – 450 kishi'},
            {'label': 'Joylashuv', 'value': "Mirzo Ulug'bek"},
            {'label': 'Maydon', 'value': 'Ochiq terrasa'},
        ],
        'reviews': [],
    },
    {
        'id': 'v-azizov',
        'category_id': 'media',
        'slug': 'azizov-studio',
        'name': 'Azizov Studio',
        'district': 'Chilonzor',
        'location': 'Chilonzor',
        'description': 'To‘y kunining to‘liq foto va video qayd etish: 2 operator, dron, tez montajli treyler. Love story alohida paket.',
        'tagline': 'Professional foto va video — to‘y kuni va love story.',
        'price_label': "2 000 000 so'm",
        'price_note': 'to‘liq paketdan',
        'badge': 'Top',
        'footer_line': '4.9 · 120 sharh',
        'footer_icon': 'ph-star',
        'phone': '+998 90 123 45 67',
        'telegram': 'azizov_studio',
        'main_image': 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
        'gallery': [
            'https://images.unsplash.com/photo-1606800052052-a09a3b91e17a?auto=format&fit=crop&w=800&q=80',
        ],
        'specs': [
            {'label': 'Xizmat', 'value': 'Foto + video + montaj'},
            {'label': 'Muddat', 'value': 'To‘y kuni + 10 ish kuni ichida treyler'},
            {'label': 'Qo‘shimcha', 'value': 'Dron, yorug‘lik jihozlari'},
        ],
        'reviews': [
            {
                'author': 'Nilufar',
                'rating': 5,
                'text': 'Juda sifatli montaj va tez topshirish.',
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Kategoriyalar va namuna vendorlarni bazaga yozadi (qayta ishga tushirish xavfsiz).'

    def handle(self, *args, **options):
        for c in SEED_CATEGORIES:
            cid = c.pop('id')
            Category.objects.update_or_create(id=cid, defaults=c)

        for raw in SEED_VENDORS:
            row = copy.deepcopy(raw)
            cid = row.pop('category_id')
            gallery = row.pop('gallery', [])
            specs = row.pop('specs', [])
            reviews = row.pop('reviews', [])
            badge = row.pop('badge') or None
            vid = row.pop('id')
            cat = Category.objects.get(pk=cid)
            row['category'] = cat
            row['badge'] = badge
            vendor, _ = Vendor.objects.update_or_create(id=vid, defaults=row)

            VendorImage.objects.filter(vendor=vendor).delete()
            for i, url in enumerate(gallery):
                VendorImage.objects.create(vendor=vendor, url=url, sort_order=i)

            VendorSpec.objects.filter(vendor=vendor).delete()
            for i, sp in enumerate(specs):
                VendorSpec.objects.create(
                    vendor=vendor,
                    label=sp['label'],
                    value=sp['value'],
                    sort_order=i,
                )

            Review.objects.filter(vendor=vendor).delete()
            for rv in reviews:
                Review.objects.create(
                    vendor=vendor,
                    author_name=rv['author'],
                    rating=rv['rating'],
                    text=rv['text'],
                )

        self.stdout.write(self.style.SUCCESS(f'{len(SEED_CATEGORIES)} kategoriya, {len(SEED_VENDORS)} vendor yangilandi.'))
