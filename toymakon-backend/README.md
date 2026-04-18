# Toymakon API (Django REST Framework)

MySQL + JWT. Admin: **login `toymakon`**, **parol `toymakon8`** (`python manage.py init_admin` orqali yaratiladi).

## Talablar

- Python 3.11+
- MySQL 8+ (Workbench: `127.0.0.1:3306`, foydalanuvchi odatda `root`)

## MySQL bazani yaratish

Workbench yoki konsolda:

```sql
CREATE DATABASE toymakon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

`root` uchun parol bo‘lsa, loyiha ildizida `.env` yarating (`.env.example`dan nusxa):

```env
MYSQL_PASSWORD=sizning_parolingiz
```

## O‘rnatish

```bash
cd toymakon-backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # MYSQL_PASSWORD ni to‘ldiring
python manage.py migrate
python manage.py init_admin
python manage.py seed_catalog
python manage.py runserver
```

- Admin panel: http://127.0.0.1:8000/admin/
- API: http://127.0.0.1:8000/api/

## Asosiy endpointlar

| Usul | Yo‘l | Tavsif |
|------|------|--------|
| POST | `/api/auth/register/` | `username`, `password`, `password_confirm` |
| POST | `/api/auth/token/` | JWT olish: `username`, `password` |
| POST | `/api/auth/token/refresh/` | `refresh` |
| GET | `/api/categories/` | Kategoriyalar |
| GET | `/api/vendors/` | Vendorlar (`?category_id=venue`, `?search=`) |
| GET | `/api/vendors/{id}/` | Batafsil (rasmlar, specs, sharhlar, `maps_url`) |
| GET/POST | `/api/vendors/{id}/reviews/` | Sharhlar ro‘yxati / qo‘shish (JWT shart emas) |
| GET/POST/DELETE | `/api/favorites/` | Sevimlilar (JWT) |
| GET/POST | `/api/contact-requests/` | So‘rovlar (JWT) |

**JWT** bilan so‘rovlar: header `Authorization: Bearer <access>`.

## Eslatma

Parollar serverda xeshlanadi (SHA-256 + tuz). Ishlab chiqarishda HTTPS va kuchli `DJANGO_SECRET_KEY` ishlating.

PyMySQL MySQL uchun ishlatiladi (`toymakon/__init__.py`). Ishlab chiqarishda `mysqlclient` ham mumkin.
