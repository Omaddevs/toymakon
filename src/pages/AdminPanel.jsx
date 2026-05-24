import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminStats,
  fetchAdminVendors,
  createAdminVendor,
  updateAdminVendor,
  deleteAdminVendor,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  fetchAdminPromoPosts,
  createAdminPromoPost,
  updateAdminPromoPost,
  deleteAdminPromoPost,
  fetchAdminUsers,
  patchAdminUser,
  fetchAdminTopVenues,
  saveAdminTopVenues,
  fetchAdminRecommended,
  saveAdminRecommended,
  uploadAdminImage,
} from '../utils/adminApi';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four' },
  { id: 'vendors', label: 'Vendorlar', icon: 'ph-storefront' },
  { id: 'categories', label: 'Kategoriyalar', icon: 'ph-grid-four' },
  { id: 'promo', label: 'Promo postlar', icon: 'ph-megaphone' },
  { id: 'topvenues', label: "Top to'yxonalar", icon: 'ph-trophy' },
  { id: 'recommended', label: 'Tavsiya qilamiz', icon: 'ph-star' },
  { id: 'users', label: 'Foydalanuvchilar', icon: 'ph-users' },
];

const FOOTER_ICONS = [
  { value: '', label: '— tanlanmagan —' },
  { value: 'ph-users', label: 'Odamlar (users)' },
  { value: 'ph-buildings', label: "Bino (to'yxona)" },
  { value: 'ph-camera', label: 'Kamera (foto)' },
  { value: 'ph-dress', label: 'Libos (kiyim)' },
  { value: 'ph-car', label: 'Avtomobil (kartej)' },
  { value: 'ph-microphone-stage', label: 'Mikrofon (MC)' },
  { value: 'ph-flower', label: 'Gul (dekor)' },
  { value: 'ph-heart', label: 'Yurak (marry me)' },
  { value: 'ph-star', label: 'Yulduz' },
  { value: 'ph-map-pin', label: 'Lokatsiya' },
  { value: 'ph-clock', label: 'Soat' },
];

const EMPTY_VENDOR = {
  category: '', name: '', district: '',
  image: '', story_video_url: '',
  price_label: '', price_note: '', badge: '',
  footer_line: '', footer_icon: '',
  phone: '', telegram: '',
  tagline: '', location: '', description: '',
  gallery: [], specs: [],
  is_published: true, sort_order: 0,
  lat: '', lng: '', map_link: '',
};

const EMPTY_CATEGORY = {
  code: '', slug: '', title: '', short_label: '', subtitle: '',
  icon: '', search_hint: '', zone: 'primary', sort_order: 0, is_active: true,
};

const EMPTY_PROMO = {
  slug: '', category: '', badge: '', title: '', path: '',
  background_url: '', sort_order: 0, is_active: true,
};

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function genCode(name) {
  const base = slugify(name).slice(0, 36) || 'vendor';
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

function Toast({ msg, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return <div className="admin-toast">{msg}</div>;
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-confirm-icon">
          <i className="ph ph-warning" />
        </div>
        <p className="admin-modal-msg">{msg}</p>
        <div className="admin-modal-actions">
          <button className="admin-btn admin-btn--danger" onClick={onConfirm}>
            <i className="ph ph-trash" /> Ha, o'chirish
          </button>
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>Bekor qilish</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────── DASHBOARD ───────────── */
function Dashboard({ stats, loading, onTabChange }) {
  if (loading) return <div className="admin-loading"><i className="ph ph-spinner" /> Yuklanmoqda…</div>;
  if (!stats) return <div className="admin-empty">Ma'lumot yo'q</div>;

  const statCards = [
    { num: stats.vendor_total, label: 'Jami vendorlar', bg: '#f0fdf4', color: '#16a34a', icon: 'ph-storefront', tab: 'vendors' },
    { num: stats.vendor_published, label: 'Nashr qilingan', bg: '#eff6ff', color: '#2563eb', icon: 'ph-eye', tab: 'vendors' },
    { num: stats.category_total, label: 'Kategoriyalar', bg: '#fdf4ff', color: '#9333ea', icon: 'ph-grid-four', tab: 'categories' },
    { num: stats.promo_total, label: 'Promo bannerlar', bg: '#fff7ed', color: '#ea580c', icon: 'ph-megaphone', tab: 'promo' },
    { num: stats.user_total, label: 'Foydalanuvchilar', bg: '#fef2f2', color: '#dc2626', icon: 'ph-users', tab: 'users' },
    { num: stats.review_total, label: 'Sharhlar', bg: '#f0f9ff', color: '#0284c7', icon: 'ph-chat-circle-text', tab: null },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`admin-stat-card ${c.tab ? 'admin-stat-card--clickable' : ''}`}
            onClick={() => c.tab && onTabChange(c.tab)}
          >
            <div className="admin-stat-icon" style={{ background: c.bg, color: c.color }}>
              <i className={`ph ${c.icon}`} />
            </div>
            <div>
              <div className="admin-stat-num">{c.num}</div>
              <div className="admin-stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="admin-section-title">Kategoriya bo'yicha e'lonlar</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Kategoriya</th><th>E'lonlar soni</th><th></th></tr>
          </thead>
          <tbody>
            {(stats.by_category || []).map((c) => (
              <tr key={c.code} style={{ cursor: 'pointer' }} onClick={() => onTabChange('vendors')}>
                <td><span className="admin-cell-main">{c.title}</span></td>
                <td><span className="admin-badge">{c.cnt} ta</span></td>
                <td><i className="ph ph-arrow-right" style={{ color: 'var(--text-muted)', fontSize: 14 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────── GALLERY EDITOR ───────────── */
function GalleryEditor({ value = [], onChange, onUpload }) {
  const [urlInput, setUrlInput] = useState('');

  const add = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...value, url]);
    setUrlInput('');
  };

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="admin-gallery-editor">
      <div className="admin-gallery-add-row">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Rasm URL manzilini kiriting…"
        />
        <button type="button" className="admin-btn admin-btn--ghost" onClick={add}>
          <i className="ph ph-plus" /> Qo'shish
        </button>
        {onUpload && (
          <label className="admin-upload-btn">
            <i className="ph ph-upload-simple" /> Yuklash
            <input type="file" accept="image/*" multiple hidden onChange={async (e) => {
              for (const file of Array.from(e.target.files || [])) {
                try {
                  const res = await onUpload(file);
                  onChange((prev) => [...prev, res.url]);
                } catch { /* ignore */ }
              }
            }} />
          </label>
        )}
      </div>
      {value.length > 0 && (
        <div className="admin-gallery-list">
          {value.map((url, i) => (
            <div key={i} className="admin-gallery-item">
              <img src={url} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="admin-gallery-item-url">{url}</div>
              <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => remove(i)}>
                <i className="ph ph-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── SPECS EDITOR ───────────── */
function SpecsEditor({ value = [], onChange }) {
  const add = () => onChange([...value, { label: '', value: '' }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i, k, v) => onChange(value.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  return (
    <div className="admin-specs-editor">
      {value.map((row, i) => (
        <div key={i} className="admin-specs-row">
          <input
            value={row.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            placeholder="Xususiyat (masalan: Sig'im)"
          />
          <input
            value={row.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            placeholder="Qiymat (masalan: 300 kishi)"
          />
          <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => remove(i)}>
            <i className="ph ph-trash" />
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--ghost admin-specs-add" onClick={add}>
        <i className="ph ph-plus" /> Xususiyat qo'shish
      </button>
    </div>
  );
}

/* ───────────── VENDOR FORM ───────────── */
function VendorForm({ initial, categories, onSave, onCancel, uploading, onUpload }) {
  const isEdit = !!initial?.code;
  const [form, setForm] = useState(initial || EMPTY_VENDOR);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleUploadMain = async (file) => {
    try {
      const res = await onUpload(file);
      set('image', res.url);
    } catch (ex) {
      alert("Rasm yuklashda xato: " + ex.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.category) { setErr("Kategoriyani tanlang."); return; }
    if (!form.name.trim()) { setErr("Nom kiritilishi shart."); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isEdit) payload.code = genCode(form.name);
      if (!payload.slug) payload.slug = slugify(payload.name);
      await onSave(payload, isEdit);
    } catch (ex) {
      const d = ex?.data || {};
      const first = Object.entries(d)[0];
      const msg = first
        ? `${first[0] === 'non_field_errors' ? '' : first[0] + ': '}${Array.isArray(first[1]) ? first[1][0] : first[1]}`
        : (ex?.message || "Xato yuz berdi. Qayta urinib ko'ring.");
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form vendor-form" onSubmit={handleSubmit}>

      {/* Asosiy ma'lumotlar */}
      <div className="admin-form-section">
        <div className="admin-form-section-title">Asosiy ma'lumotlar</div>
        <div className="admin-form-grid">
          <div className="admin-form-group admin-form-group--full">
            <label>Xizmat nomi <span className="admin-req">*</span></label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Masalan: Versal Banquet Hall"
              required
            />
          </div>
          <div className="admin-form-group">
            <label>Kategoriya <span className="admin-req">*</span></label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              <option value="">— Kategoriyani tanlang —</option>
              {categories.map((c) => (
                <option key={c.id || c.code} value={c.id || c.code}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Joylashuv (tuman/shahar)</label>
            <input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="Yunusobod, Chilonzor…" />
          </div>
          <div className="admin-form-group">
            <label>Telefon raqami</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+998 90 123 45 67" type="tel" />
          </div>
          <div className="admin-form-group">
            <label>Telegram</label>
            <input value={form.telegram} onChange={(e) => set('telegram', e.target.value)} placeholder="@username (@ belgisisiz ham bo'ladi)" />
          </div>
          <div className="admin-form-group">
            <label>Aniq manzil</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ko'cha nomi, mahalla, mo'ljal…" />
          </div>
        </div>
      </div>

      {/* Narx va ko'rinish */}
      <div className="admin-form-section">
        <div className="admin-form-section-title">Narx va ko'rinish</div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>Narx</label>
            <input value={form.price_label} onChange={(e) => set('price_label', e.target.value)} placeholder="500 000 so'm" />
          </div>
          <div className="admin-form-group">
            <label>Narx izohi</label>
            <input value={form.price_note} onChange={(e) => set('price_note', e.target.value)} placeholder="kishi boshiga, soatiga…" />
          </div>
          <div className="admin-form-group">
            <label>Badge (yorliq)</label>
            <input value={form.badge || ''} onChange={(e) => set('badge', e.target.value)} placeholder="Top, Yangi, Chegirma…" />
          </div>
          <div className="admin-form-group">
            <label>Qo'shimcha ma'lumot (kartochka pastki qismi)</label>
            <input value={form.footer_line} onChange={(e) => set('footer_line', e.target.value)} placeholder="500+ mehmon, 8 soat…" />
          </div>
          <div className="admin-form-group">
            <label>Qo'shimcha ma'lumot belgisi</label>
            <select value={form.footer_icon} onChange={(e) => set('footer_icon', e.target.value)}>
              {FOOTER_ICONS.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Qisqa tavsif (tagline)</label>
            <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Bir qatorda eng muhim narsani yozing…" />
          </div>
          <div className="admin-form-group">
            <label>Tartib raqami (kichikroq = oldinda)</label>
            <input type="number" min={0} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
          </div>
          <div className="admin-form-group admin-form-group--flex">
            <label className="admin-checkbox-label">
              <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} />
              Saytda ko'rinsin (nashr qilingan)
            </label>
          </div>
        </div>

        <div className="admin-form-group" style={{ marginTop: 12 }}>
          <label>Batafsil tavsif</label>
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Xizmat haqida batafsil ma'lumot yozing…" />
        </div>
      </div>

      {/* Rasm va media */}
      <div className="admin-form-section">
        <div className="admin-form-section-title">Rasm va media</div>

        <div className="admin-form-group">
          <label>Asosiy rasm</label>
          <div className="admin-upload-row">
            <input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="Rasm URL manzilini kiriting…" />
            <label className="admin-upload-btn">
              <i className="ph ph-upload-simple" /> Yuklash
              <input type="file" accept="image/*" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadMain(file);
              }} />
            </label>
          </div>
          {form.image && (
            <div className="admin-img-preview-wrap">
              <img src={form.image} alt="" className="admin-img-preview" />
              <button type="button" className="admin-img-remove" onClick={() => set('image', '')}>
                <i className="ph ph-x" />
              </button>
            </div>
          )}
        </div>

        <div className="admin-form-group">
          <label>Story video (YouTube havolasi)</label>
          <input value={form.story_video_url} onChange={(e) => set('story_video_url', e.target.value)} placeholder="https://youtube.com/watch?v=… yoki https://youtu.be/…" />
          <span className="admin-form-hint">Top to'yxonalar qatorida story sifatida ko'rinadi</span>
        </div>

        <div className="admin-form-group">
          <label>Galereya rasmlari</label>
          <GalleryEditor
            value={form.gallery}
            onChange={(g) => set('gallery', g)}
            onUpload={onUpload ? async (file) => {
              const res = await onUpload(file);
              return res;
            } : null}
          />
        </div>
      </div>

      {/* Lokatsiya */}
      <div className="admin-form-section">
        <div className="admin-form-section-title">Lokatsiya (xarita)</div>
        <span className="admin-form-hint" style={{ marginBottom: 12, display: 'block' }}>
          Koordinatalarni yoki Yandex/Google Maps havolasini kiriting. Ikkalasini ham kiritish shart emas.
        </span>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>Kenglik (Latitude)</label>
            <input
              type="number"
              step="any"
              value={form.lat ?? ''}
              onChange={(e) => set('lat', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="41.2995"
            />
          </div>
          <div className="admin-form-group">
            <label>Uzunlik (Longitude)</label>
            <input
              type="number"
              step="any"
              value={form.lng ?? ''}
              onChange={(e) => set('lng', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="69.2401"
            />
          </div>
        </div>
        <div className="admin-form-group">
          <label>Yandex Maps / Google Maps havolasi</label>
          <input
            value={form.map_link || ''}
            onChange={(e) => set('map_link', e.target.value)}
            placeholder="https://yandex.uz/maps/... yoki https://maps.google.com/..."
          />
          <span className="admin-form-hint">
            Havoladan <b>lat/lng</b> avtomatik ajratiladi (agar koordinatalar kiritilmagan bo'lsa)
          </span>
        </div>
      </div>

      {/* Texnik xususiyatlar */}
      <div className="admin-form-section">
        <div className="admin-form-section-title">Texnik xususiyatlar (jadval)</div>
        <span className="admin-form-hint" style={{ marginBottom: 10, display: 'block' }}>
          Masalan: Sig'im → 300 kishi, Maydon → 500 m², Soatlar → 08:00–24:00
        </span>
        <SpecsEditor value={form.specs} onChange={(s) => set('specs', s)} />
      </div>

      {err && (
        <div className="admin-form-error">
          <i className="ph ph-warning-circle" /> {err}
        </div>
      )}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving || uploading}>
          {saving ? (
            <><i className="ph ph-spinner" /> Saqlanmoqda…</>
          ) : isEdit ? (
            <><i className="ph ph-floppy-disk" /> Saqlash</>
          ) : (
            <><i className="ph ph-plus" /> E'lon qo'shish</>
          )}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={saving}>
          Bekor qilish
        </button>
      </div>
    </form>
  );
}

/* ───────────── VENDORS TAB ───────────── */
function VendorsTab({ categories, showToast }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef(null);

  const catMap = Object.fromEntries(
    categories.map((c) => [c.id || c.code, c.title])
  );

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminVendors({ category: catFilter, search })
      .then(setVendors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catFilter, search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollTop = 0;
    }
  }, [showForm]);

  const handleSave = async (data, isEdit) => {
    if (isEdit) {
      await updateAdminVendor(data.code, data);
      showToast("E'lon yangilandi!");
    } else {
      await createAdminVendor(data);
      showToast("E'lon qo'shildi!");
    }
    setShowForm(false);
    setEditVendor(null);
    load();
  };

  const handleDelete = async (code) => {
    try {
      await deleteAdminVendor(code);
      showToast("E'lon o'chirildi.");
    } catch {
      showToast("O'chirishda xato yuz berdi.");
    }
    setConfirmDelete(null);
    load();
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try { return await uploadAdminImage(file); }
    finally { setUploading(false); }
  };

  const openEdit = (v) => {
    setEditVendor({
      code: v.id,
      category: v.categoryId,
      slug: v.slug || '',
      name: v.name,
      district: v.district || '',
      image: v.image || '',
      story_video_url: v.storyVideoUrl || '',
      gallery: v.gallery || [],
      price_label: v.priceLabel || '',
      price_note: v.priceNote || '',
      badge: v.badge || '',
      footer_line: v.footerLine || '',
      footer_icon: v.footerIcon || '',
      phone: v.phone || '',
      telegram: v.telegram || '',
      tagline: v.tagline || '',
      location: v.location || '',
      description: v.description || '',
      specs: v.specs || [],
      is_published: v.is_published !== false,
      sort_order: v.sort_order || 0,
      lat: v.lat ?? '',
      lng: v.lng ?? '',
      map_link: v.map_link || '',
    });
    setShowForm(true);
  };

  const openAdd = () => { setEditVendor(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditVendor(null); };

  if (showForm) {
    return (
      <div className="admin-form-page" ref={formRef}>
        <div className="admin-form-page-header">
          <button className="admin-btn admin-btn--ghost" onClick={closeForm}>
            <i className="ph ph-arrow-left" /> Ro'yxatga qaytish
          </button>
          <h2 className="admin-form-page-title">
            {editVendor ? "E'lonni tahrirlash" : "Yangi e'lon qo'shish"}
          </h2>
        </div>
        <VendorForm
          initial={editVendor}
          categories={categories}
          onSave={handleSave}
          onCancel={closeForm}
          uploading={uploading}
          onUpload={handleUpload}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-filters">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">Barcha kategoriyalar</option>
            {categories.map((c) => (
              <option key={c.id || c.code} value={c.id || c.code}>{c.title}</option>
            ))}
          </select>
          <div className="admin-search-wrap">
            <i className="ph ph-magnifying-glass" />
            <input
              placeholder="Nom, tuman bo'yicha qidirish…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <i className="ph ph-plus" /> E'lon qo'shish
        </button>
      </div>

      <div className="admin-table-meta">
        Jami: <strong>{vendors.length}</strong> ta e'lon
      </div>

      {loading ? (
        <div className="admin-loading"><i className="ph ph-spinner" /> Yuklanmoqda…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rasm</th>
                <th>Nomi</th>
                <th>Kategoriya</th>
                <th>Tuman</th>
                <th>Narx</th>
                <th>Holat</th>
                <th style={{ width: 90 }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty-row">
                    <i className="ph ph-storefront" style={{ fontSize: 32, display: 'block', margin: '0 auto 8px' }} />
                    E'lonlar topilmadi
                  </td>
                </tr>
              ) : vendors.map((v) => (
                <tr key={v.id || v.code}>
                  <td>
                    {v.image
                      ? <img src={v.image} alt={v.name} className="admin-thumb" />
                      : <div className="admin-thumb-placeholder"><i className="ph ph-image" /></div>}
                  </td>
                  <td>
                    <div className="admin-cell-main">{v.name}</div>
                    {v.phone && <div className="admin-cell-sub"><i className="ph ph-phone" /> {v.phone}</div>}
                  </td>
                  <td>
                    <span className="admin-cat-badge">{catMap[v.categoryId] || v.categoryId}</span>
                  </td>
                  <td>{v.district || <span className="admin-muted">—</span>}</td>
                  <td>
                    {v.priceLabel
                      ? <><span className="admin-price">{v.priceLabel}</span>{v.priceNote && <span className="admin-muted"> {v.priceNote}</span>}</>
                      : <span className="admin-muted">—</span>}
                  </td>
                  <td>
                    <span className={`admin-status ${v.is_published !== false ? 'admin-status--on' : 'admin-status--off'}`}>
                      {v.is_published !== false ? 'Faol' : 'Yashirin'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        className="admin-icon-btn"
                        title="Tahrirlash"
                        onClick={() => openEdit(v)}
                      >
                        <i className="ph ph-pencil" />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        title="O'chirish"
                        onClick={() => setConfirmDelete({ code: v.id, name: v.name })}
                      >
                        <i className="ph ph-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          msg={`"${confirmDelete.name}" e'lonini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
          onConfirm={() => handleDelete(confirmDelete.code)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ───────────── CATEGORIES TAB ───────────── */
function CategoriesTab({ onCategoriesChange, showToast }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = () => {
    setLoading(true);
    fetchAdminCategories().then((data) => {
      const list = Array.isArray(data) ? data : (data?.results || []);
      setCats(list);
      onCategoriesChange(list);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_CATEGORY);
    setEditCat(null);
    setFormErr('');
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      code: c.code || c.id,
      slug: c.slug || '',
      title: c.title || '',
      short_label: c.shortLabel || c.short_label || '',
      subtitle: c.subtitle || '',
      icon: c.icon || '',
      search_hint: c.searchHint || c.search_hint || '',
      zone: c.zone || 'primary',
      sort_order: c.sort_order ?? 0,
      is_active: c.is_active !== false,
    });
    setEditCat(c);
    setFormErr('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErr('');
    try {
      const payload = { ...form };
      if (!payload.slug) payload.slug = slugify(payload.title);
      if (!payload.code) payload.code = slugify(payload.title).replace(/-/g, '_').slice(0, 32);
      if (editCat) {
        await updateAdminCategory(form.code, payload);
        showToast('Kategoriya yangilandi!');
      } else {
        await createAdminCategory(payload);
        showToast("Kategoriya qo'shildi!");
      }
      setShowForm(false);
      load();
    } catch (ex) {
      const d = ex?.data || {};
      const first = Object.entries(d)[0];
      setFormErr(first
        ? `${first[0] !== 'non_field_errors' ? first[0] + ': ' : ''}${Array.isArray(first[1]) ? first[1][0] : first[1]}`
        : ex?.message || 'Xato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    try {
      await deleteAdminCategory(code);
      showToast("Kategoriya o'chirildi.");
    } catch {
      showToast("O'chirishda xato. Kategoriyada vendorlar bo'lishi mumkin.");
    }
    setConfirmDelete(null);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Kategoriyalar</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Xizmat turlari — to'yxona, fotostudio, dekor va boshqalar
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <i className="ph ph-plus" /> Kategoriya qo'shish
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Yuklanmoqda…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Qisqa nom</th>
                <th>Zona</th>
                <th>Tartib</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {cats.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty-row">Kategoriya yo'q</td></tr>
              ) : cats.map((c) => (
                <tr key={c.code || c.id}>
                  <td>
                    <div className="admin-cell-main">{c.title}</div>
                    <div className="admin-cell-sub">{c.subtitle}</div>
                  </td>
                  <td>{c.shortLabel || c.short_label}</td>
                  <td>
                    <span className="admin-badge">
                      {c.zone === 'primary' ? 'Asosiy' : "Qo'shimcha"}
                    </span>
                  </td>
                  <td>{c.sort_order}</td>
                  <td>
                    <span className={`admin-status ${c.is_active !== false ? 'admin-status--on' : 'admin-status--off'}`}>
                      {c.is_active !== false ? 'Faol' : 'Yashirin'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button className="admin-icon-btn" onClick={() => openEdit(c)}>
                        <i className="ph ph-pencil" />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => setConfirmDelete({ code: c.code || c.id, name: c.title })}
                      >
                        <i className="ph ph-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editCat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
              <button className="admin-icon-btn" onClick={() => setShowForm(false)}>
                <i className="ph ph-x" />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Sarlavha <span className="admin-req">*</span></label>
                  <input
                    value={form.title}
                    onChange={(e) => setF('title', e.target.value)}
                    onBlur={() => {
                      if (!form.slug) setF('slug', slugify(form.title));
                      if (!form.code) setF('code', slugify(form.title).replace(/-/g, '_').slice(0, 32));
                    }}
                    placeholder="To'yxonalar"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Qisqa nom <span className="admin-req">*</span></label>
                  <input value={form.short_label} onChange={(e) => setF('short_label', e.target.value)} placeholder="To'yxona" required />
                </div>
                <div className="admin-form-group">
                  <label>Zona</label>
                  <select value={form.zone} onChange={(e) => setF('zone', e.target.value)}>
                    <option value="primary">Asosiy (1-qator)</option>
                    <option value="extra">Qo'shimcha (2-qator)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Tartib raqami</label>
                  <input type="number" min={0} value={form.sort_order} onChange={(e) => setF('sort_order', Number(e.target.value))} />
                </div>
                <div className="admin-form-group">
                  <label>Ikonka (Phosphor Icons nomi)</label>
                  <input value={form.icon} onChange={(e) => setF('icon', e.target.value)} placeholder="ph-buildings" />
                </div>
                <div className="admin-form-group admin-form-group--flex">
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setF('is_active', e.target.checked)} />
                    Faol (saytda ko'rinsin)
                  </label>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Tagline (qisqa tavsif)</label>
                <input value={form.subtitle} onChange={(e) => setF('subtitle', e.target.value)} placeholder="Eng yaxshi to'yxonalar…" />
              </div>
              <div className="admin-form-group">
                <label>Qidiruv yordam matni</label>
                <input value={form.search_hint} onChange={(e) => setF('search_hint', e.target.value)} placeholder="To'yxona qidirish…" />
              </div>
              {formErr && (
                <div className="admin-form-error">
                  <i className="ph ph-warning-circle" /> {formErr}
                </div>
              )}
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? 'Saqlanmoqda…' : editCat ? 'Saqlash' : "Qo'shish"}
                </button>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          msg={`"${confirmDelete.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`}
          onConfirm={() => handleDelete(confirmDelete.code)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ───────────── PROMO POSTS TAB ───────────── */
function PromoPostsTab({ categories, showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState(EMPTY_PROMO);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formErr, setFormErr] = useState('');

  const load = () => {
    setLoading(true);
    fetchAdminPromoPosts()
      .then((d) => setPosts(Array.isArray(d) ? d : (d?.results || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm(EMPTY_PROMO);
    setEditPost(null);
    setFormErr('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      slug: p.slug,
      category: p.categoryId || p.category || '',
      badge: p.badge || '',
      title: p.title,
      path: p.path,
      background_url: p.background_url,
      sort_order: p.sort_order ?? 0,
      is_active: p.is_active !== false,
    });
    setEditPost(p);
    setFormErr('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.background_url.trim()) {
      setFormErr("Fon rasm URL si yoki yuklangan rasm talab qilinadi.");
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      const payload = { ...form };
      if (!payload.slug) payload.slug = slugify(payload.title);
      if (editPost) {
        await updateAdminPromoPost(editPost.slug, payload);
        showToast('Promo banner yangilandi!');
      } else {
        await createAdminPromoPost(payload);
        showToast("Promo banner qo'shildi!");
      }
      setShowForm(false);
      load();
    } catch (ex) {
      const d = ex?.data || {};
      const first = Object.entries(d)[0];
      setFormErr(first
        ? `${first[0] !== 'non_field_errors' ? first[0] + ': ' : ''}${Array.isArray(first[1]) ? first[1][0] : first[1]}`
        : ex?.message || 'Xato');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await deleteAdminPromoPost(slug);
      showToast("Promo banner o'chirildi.");
    } catch {
      showToast("O'chirishda xato yuz berdi.");
    }
    setConfirmDelete(null);
    load();
  };

  const handleUploadBg = async (file) => {
    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      setF('background_url', res.url);
    } catch (ex) {
      showToast("Rasm yuklashda xato: " + (ex.message || "Noma'lum xato"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Promo bannerlar</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Bosh sahifa karuselida ko'rinadigan reklamalar
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={openAdd}>
          <i className="ph ph-plus" /> Banner qo'shish
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Yuklanmoqda…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Rasm</th>
                <th>Sarlavha</th>
                <th>Kategoriya</th>
                <th>Yo'nalish</th>
                <th>Tartib</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty-row">Promo bannerlar yo'q</td></tr>
              ) : posts.map((p) => (
                <tr key={p.slug}>
                  <td>
                    {p.background_url
                      ? <img src={p.background_url} alt={p.title} className="admin-thumb" />
                      : <div className="admin-thumb-placeholder"><i className="ph ph-image" /></div>}
                  </td>
                  <td>
                    <div className="admin-cell-main">{p.title}</div>
                    {p.badge && <span className="admin-badge admin-badge--accent">{p.badge}</span>}
                  </td>
                  <td>{p.categoryId || p.category}</td>
                  <td><code style={{ fontSize: 12 }}>{p.path}</code></td>
                  <td>{p.sort_order}</td>
                  <td>
                    <span className={`admin-status ${p.is_active !== false ? 'admin-status--on' : 'admin-status--off'}`}>
                      {p.is_active !== false ? 'Faol' : 'Yashirin'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button className="admin-icon-btn" onClick={() => openEdit(p)}>
                        <i className="ph ph-pencil" />
                      </button>
                      <button
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => setConfirmDelete({ slug: p.slug, name: p.title })}
                      >
                        <i className="ph ph-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editPost ? 'Banner tahrirlash' : 'Yangi promo banner'}</h3>
              <button className="admin-icon-btn" onClick={() => setShowForm(false)}>
                <i className="ph ph-x" />
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Sarlavha <span className="admin-req">*</span></label>
                  <input value={form.title} onChange={(e) => setF('title', e.target.value)} required placeholder="To'y mavsumi chegirmalari" />
                </div>
                <div className="admin-form-group">
                  <label>Kategoriya <span className="admin-req">*</span></label>
                  <select value={form.category} onChange={(e) => setF('category', e.target.value)} required>
                    <option value="">— tanlang —</option>
                    {categories.map((c) => (
                      <option key={c.id || c.code} value={c.id || c.code}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Badge (yorliq)</label>
                  <input value={form.badge} onChange={(e) => setF('badge', e.target.value)} placeholder="Yangi, Chegirma…" />
                </div>
                <div className="admin-form-group">
                  <label>
                    Havola yo'li <span className="admin-req">*</span>
                    <span className="admin-form-hint"> (masalan: /category/venue)</span>
                  </label>
                  <input value={form.path} onChange={(e) => setF('path', e.target.value)} required placeholder="/category/venue" />
                </div>
                <div className="admin-form-group">
                  <label>Tartib raqami</label>
                  <input type="number" min={0} value={form.sort_order} onChange={(e) => setF('sort_order', Number(e.target.value))} />
                </div>
                <div className="admin-form-group admin-form-group--flex">
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setF('is_active', e.target.checked)} />
                    Faol (saytda ko'rinsin)
                  </label>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Fon rasm <span className="admin-req">*</span></label>
                <div className="admin-upload-row">
                  <input
                    value={form.background_url}
                    onChange={(e) => setF('background_url', e.target.value)}
                    placeholder="Rasm URL kiriting yoki fayldan yuklang…"
                  />
                  <label className={`admin-upload-btn${uploading ? ' admin-upload-btn--loading' : ''}`}>
                    <i className={`ph ${uploading ? 'ph-spinner' : 'ph-upload-simple'}`} />
                    {uploading ? ' Yuklanmoqda…' : ' Yuklash'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { handleUploadBg(file); e.target.value = ''; }
                      }}
                    />
                  </label>
                </div>
                {form.background_url && (
                  <div className="admin-img-preview-wrap" style={{ marginTop: 8 }}>
                    <img
                      src={form.background_url}
                      alt=""
                      className="admin-img-preview"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      className="admin-img-remove"
                      onClick={() => setF('background_url', '')}
                    >
                      <i className="ph ph-x" />
                    </button>
                  </div>
                )}
              </div>
              {formErr && (
                <div className="admin-form-error">
                  <i className="ph ph-warning-circle" /> {formErr}
                </div>
              )}
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving || uploading}>
                  {saving ? 'Saqlanmoqda…' : editPost ? 'Saqlash' : "Qo'shish"}
                </button>
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)} disabled={saving || uploading}>
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          msg={`"${confirmDelete.name}" bannerini o'chirishni tasdiqlaysizmi?`}
          onConfirm={() => handleDelete(confirmDelete.slug)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ───────────── TOP VENUES TAB ───────────── */
function TopVenuesTab({ showToast }) {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAdminTopVenues()
      .then((d) => { setData(d); setItems(d.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addVenue = (code) => {
    if (!code || items.find((i) => i.vendor_code === code)) return;
    const opt = data?.venue_options?.find((v) => v.code === code);
    setItems((prev) => [...prev, {
      vendor_code: code,
      vendor_name: opt?.name || code,
      sort_order: prev.length,
      story_video_url: '',
    }]);
  };

  const removeVenue = (code) => setItems((prev) => prev.filter((i) => i.vendor_code !== code));
  const setVideoUrl = (code, url) => setItems((prev) => prev.map((i) => i.vendor_code === code ? { ...i, story_video_url: url } : i));

  const moveUp = (idx) => setItems((prev) => {
    if (idx === 0) return prev;
    const arr = [...prev];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    return arr;
  });
  const moveDown = (idx) => setItems((prev) => {
    if (idx >= prev.length - 1) return prev;
    const arr = [...prev];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    return arr;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminTopVenues(items.map((it, i) => ({ ...it, sort_order: i })));
      showToast("Top to'yxonalar saqlandi!");
      load();
    } catch (e) {
      showToast('Xato: ' + (e?.message || 'Saqlashda muammo'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Yuklanmoqda…</div>;

  const availableOptions = (data?.venue_options || []).filter(
    (v) => !items.find((i) => i.vendor_code === v.code)
  );

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Top to'yxonalar</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Bosh sahifada story doiralarda ko'rinadigan to'yxonalar
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
          <i className="ph ph-floppy-disk" /> {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>

      <div className="admin-top-venues">
        <div className="admin-tv-add">
          <label>To'yxona qo'shish:</label>
          <select
            defaultValue=""
            onChange={(e) => { addVenue(e.target.value); e.target.value = ''; }}
          >
            <option value="">— ro'yxatdan tanlang —</option>
            {availableOptions.map((v) => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty">
            <i className="ph ph-trophy" style={{ fontSize: 40, display: 'block', margin: '0 auto 8px' }} />
            <p>Hozircha top to'yxonalar yo'q. Yuqoridagi ro'yxatdan qo'shing.</p>
          </div>
        ) : (
          <div className="admin-tv-list">
            {items.map((item, idx) => (
              <div key={item.vendor_code} className="admin-tv-item">
                <div className="admin-tv-order">#{idx + 1}</div>
                <div className="admin-tv-info">
                  <div className="admin-tv-name">{item.vendor_name || item.vendor_code}</div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    Story uchun YouTube video:
                  </label>
                  <input
                    className="admin-tv-video"
                    value={item.story_video_url || ''}
                    onChange={(e) => setVideoUrl(item.vendor_code, e.target.value)}
                    placeholder="https://youtu.be/… (ixtiyoriy)"
                  />
                </div>
                <div className="admin-tv-controls">
                  <button className="admin-icon-btn" onClick={() => moveUp(idx)} disabled={idx === 0} title="Yuqoriga">
                    <i className="ph ph-arrow-up" />
                  </button>
                  <button className="admin-icon-btn" onClick={() => moveDown(idx)} disabled={idx === items.length - 1} title="Pastga">
                    <i className="ph ph-arrow-down" />
                  </button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => removeVenue(item.vendor_code)} title="Olib tashlash">
                    <i className="ph ph-x" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── RECOMMENDED TAB ───────────── */
function RecommendedTab({ showToast }) {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAdminRecommended()
      .then((d) => { setData(d); setItems(d.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const addVendor = (code) => {
    if (!code || items.find((i) => i.vendor_code === code)) return;
    const opt = data?.vendor_options?.find((v) => v.code === code);
    setItems((prev) => [...prev, {
      vendor_code: code,
      vendor_name: opt?.name || code,
      vendor_category: opt?.category || '',
      sort_order: prev.length,
    }]);
  };

  const removeVendor = (code) => setItems((prev) => prev.filter((i) => i.vendor_code !== code));

  const moveUp = (idx) => setItems((prev) => {
    if (idx === 0) return prev;
    const arr = [...prev];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    return arr;
  });
  const moveDown = (idx) => setItems((prev) => {
    if (idx >= prev.length - 1) return prev;
    const arr = [...prev];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    return arr;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminRecommended(items.map((it, i) => ({ ...it, sort_order: i })));
      showToast("Tavsiya qilamiz saqlandi!");
      load();
    } catch (e) {
      showToast('Xato: ' + (e?.message || 'Saqlashda muammo'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Yuklanmoqda…</div>;

  const availableOptions = (data?.vendor_options || []).filter(
    (v) => !items.find((i) => i.vendor_code === v.code)
  );

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Tavsiya qilamiz</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Bosh sahifada "Tavsiya qilamiz" bo'limida ko'rinadigan vendorlar
          </p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
          <i className="ph ph-floppy-disk" /> {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>

      <div className="admin-top-venues">
        <div className="admin-tv-add">
          <label>Vendor qo'shish:</label>
          <select
            defaultValue=""
            onChange={(e) => { addVendor(e.target.value); e.target.value = ''; }}
          >
            <option value="">— ro'yxatdan tanlang —</option>
            {availableOptions.map((v) => (
              <option key={v.code} value={v.code}>{v.name} ({v.category})</option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty">
            <i className="ph ph-star" style={{ fontSize: 40, display: 'block', margin: '0 auto 8px' }} />
            <p>Hozircha tavsiya qilingan vendorlar yo'q.</p>
          </div>
        ) : (
          <div className="admin-tv-list">
            {items.map((item, idx) => (
              <div key={item.vendor_code} className="admin-tv-item">
                <div className="admin-tv-order">#{idx + 1}</div>
                <div className="admin-tv-info">
                  <div className="admin-tv-name">{item.vendor_name || item.vendor_code}</div>
                  {item.vendor_category && (
                    <span className="admin-cat-badge" style={{ fontSize: 12, marginTop: 4 }}>
                      {item.vendor_category}
                    </span>
                  )}
                </div>
                <div className="admin-tv-controls">
                  <button className="admin-icon-btn" onClick={() => moveUp(idx)} disabled={idx === 0}>
                    <i className="ph ph-arrow-up" />
                  </button>
                  <button className="admin-icon-btn" onClick={() => moveDown(idx)} disabled={idx === items.length - 1}>
                    <i className="ph ph-arrow-down" />
                  </button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => removeVendor(item.vendor_code)}>
                    <i className="ph ph-x" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── USERS TAB ───────────── */
function UsersTab({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetchAdminUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleStaff = async (user) => {
    try {
      const updated = await patchAdminUser(user.id, { is_staff: !user.is_staff });
      setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
      showToast(
        !user.is_staff
          ? `${user.username} — admin huquqi berildi`
          : `${user.username} — admin huquqi olib tashlandi`
      );
    } catch (e) {
      showToast('Xato: ' + e.message);
    }
  };

  const filtered = users.filter((u) =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <h3 style={{ margin: 0 }}>Foydalanuvchilar</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {users.length} ta foydalanuvchi
          </p>
        </div>
        <div className="admin-search-wrap">
          <i className="ph ph-magnifying-glass" />
          <input
            placeholder="Ism, email bo'yicha qidirish…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Yuklanmoqda…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Ro'yxatdan o'tgan</th>
                <th>Holat</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="admin-empty-row">Foydalanuvchi topilmadi</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-cell-main">{u.username}</div>
                    {u.full_name && <div className="admin-cell-sub">{u.full_name}</div>}
                  </td>
                  <td>{u.email || <span className="admin-muted">—</span>}</td>
                  <td>{u.phone || <span className="admin-muted">—</span>}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {u.date_joined ? new Date(u.date_joined).toLocaleDateString('uz') : '—'}
                  </td>
                  <td>
                    <span className={`admin-status ${u.is_active ? 'admin-status--on' : 'admin-status--off'}`}>
                      {u.is_active ? 'Faol' : 'Bloklangan'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`admin-toggle-btn ${u.is_staff ? 'admin-toggle-btn--on' : ''}`}
                      onClick={() => toggleStaff(u)}
                    >
                      {u.is_staff
                        ? <><i className="ph ph-shield-check" /> Admin</>
                        : <><i className="ph ph-shield" /> Oddiy</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────── MAIN ADMIN PANEL ───────────── */
export default function AdminPanel() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState('');
  const contentRef = useRef(null);

  const showToast = useCallback((msg) => setToast(msg), []);

  useEffect(() => {
    if (!ready) return;
    if (!user || !user.is_staff) navigate('/profile');
  }, [user, ready, navigate]);

  useEffect(() => {
    setStatsLoading(true);
    fetchAdminStats().then(setStats).catch(() => {}).finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    fetchAdminCategories()
      .then((d) => setCategories(Array.isArray(d) ? d : (d?.results || [])))
      .catch(() => {});
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeTab]);

  if (!ready) {
    return <div className="admin-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yuklanmoqda…</div>;
  }

  if (!user?.is_staff) {
    return (
      <div className="admin-access-denied">
        <i className="ph ph-lock" />
        <p>Kirish huquqi yo'q</p>
        <button className="admin-btn admin-btn--ghost" onClick={() => navigate('/profile')}>
          Profilga qaytish
        </button>
      </div>
    );
  }

  return (
    <>
      <Toast msg={toast} onClose={() => setToast('')} />
      <div className="admin-panel">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-icon-btn" onClick={() => navigate('/')} title="Asosiy saytga qaytish">
              <i className="ph ph-arrow-left" />
            </button>
            <div className="admin-header-logo">
              <img src="/logo-rings.png" alt="ToyMakon" className="admin-logo-img" />
              <span>ToyMakon Admin</span>
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-header-user">
              <i className="ph ph-user-circle" />
              <span>{user.username}</span>
              <span className="admin-header-badge">Admin</span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="admin-layout">
          {/* Sidebar */}
          <nav className="admin-sidebar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <i className={`ph ${tab.icon}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <main className="admin-content" ref={contentRef}>
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} loading={statsLoading} onTabChange={setActiveTab} />
            )}
            {activeTab === 'vendors' && (
              <VendorsTab categories={categories} showToast={showToast} />
            )}
            {activeTab === 'categories' && (
              <CategoriesTab onCategoriesChange={setCategories} showToast={showToast} />
            )}
            {activeTab === 'promo' && (
              <PromoPostsTab categories={categories} showToast={showToast} />
            )}
            {activeTab === 'topvenues' && (
              <TopVenuesTab showToast={showToast} />
            )}
            {activeTab === 'recommended' && (
              <RecommendedTab showToast={showToast} />
            )}
            {activeTab === 'users' && (
              <UsersTab showToast={showToast} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
