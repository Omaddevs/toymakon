import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTopVenuesManage, saveTopVenuesManage } from '../utils/topVenuesAdminApi';

function emptyRow() {
  return { vendor_code: '', story_video_url: '' };
}

export default function TopVenuesManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState([]);

  const optionMap = useMemo(() => {
    const m = {};
    for (const o of options) m[o.code] = o.name;
    return m;
  }, [options]);

  useEffect(() => {
    if (!user) return;
    if (!user.is_staff) return;
    setLoading(true);
    fetchTopVenuesManage()
      .then((data) => {
        const loaded = (data.items || []).map((it) => ({
          vendor_code: it.vendor_code || '',
          story_video_url: it.story_video_url || '',
        }));
        setRows(loaded.length ? loaded : [emptyRow()]);
        setOptions(data.venue_options || []);
      })
      .catch(() => setError('Ma’lumotni yuklashda xatolik.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <section className="home-section">
        <p className="muted-text">Bu sahifa uchun avval tizimga kiring.</p>
      </section>
    );
  }
  if (!user.is_staff) {
    return (
      <section className="home-section">
        <p className="muted-text">Bu bo‘lim faqat admin (staff) uchun.</p>
      </section>
    );
  }

  const setRow = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (idx) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [emptyRow()];
    });
  };

  const moveRow = (idx, dir) => {
    setRows((prev) => {
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[to];
      copy[to] = temp;
      return copy;
    });
  };

  const onSave = async () => {
    setError('');
    setOk('');
    const cleaned = rows
      .map((r) => ({
        vendor_code: r.vendor_code.trim(),
        story_video_url: r.story_video_url.trim(),
      }))
      .filter((r) => r.vendor_code);
    if (!cleaned.length) {
      setError('Kamida bitta to‘yxona tanlang.');
      return;
    }
    setSaving(true);
    try {
      const data = await saveTopVenuesManage(cleaned);
      const reloaded = (data.items || []).map((it) => ({
        vendor_code: it.vendor_code || '',
        story_video_url: it.story_video_url || '',
      }));
      setRows(reloaded.length ? reloaded : [emptyRow()]);
      setOptions(data.venue_options || []);
      setOk('Saqlandi.');
    } catch (e) {
      setError(e?.message || 'Saqlashda xatolik.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="mobile-header mobile-only">
        <div className="header-location">
          <i className="ph ph-sliders"></i>
          <span>Top to‘yxonalarni boshqarish</span>
        </div>
      </header>
      <section className="home-section top-venues-admin last-section">
        <div className="auth-card">
          <h3 className="share-sheet-title" style={{ marginBottom: 12 }}>Top to‘yxonalar</h3>
          <p className="auth-welcome-hint" style={{ textAlign: 'left', marginTop: 0, marginBottom: 14 }}>
            Har bir qator uchun to‘yxona tanlang va ixtiyoriy YouTube story link kiriting.
          </p>

          {loading ? <p className="muted-text">Yuklanmoqda…</p> : null}
          {error ? <p className="auth-error" role="alert"><span>{error}</span></p> : null}
          {ok ? <p className="top-venues-admin-ok">{ok}</p> : null}

          {!loading ? (
            <div className="top-venues-admin-list">
              {rows.map((row, idx) => (
                <div className="top-venues-admin-row" key={`${idx}-${row.vendor_code}`}>
                  <div className="top-venues-admin-row-head">
                    <strong>{idx + 1}-o‘rin</strong>
                    <div className="top-venues-admin-row-actions">
                      <button type="button" className="btn-outline" onClick={() => moveRow(idx, -1)}>Yuqoriga</button>
                      <button type="button" className="btn-outline" onClick={() => moveRow(idx, 1)}>Pastga</button>
                      <button type="button" className="btn-outline" onClick={() => removeRow(idx)}>O‘chirish</button>
                    </div>
                  </div>

                  <label className="auth-field">
                    <span className="auth-label">To‘yxona</span>
                    <select
                      className="auth-input"
                      value={row.vendor_code}
                      onChange={(e) => setRow(idx, { vendor_code: e.target.value })}
                    >
                      <option value="">Tanlang...</option>
                      {options.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-field">
                    <span className="auth-label">YouTube story link (ixtiyoriy)</span>
                    <input
                      className="auth-input"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={row.story_video_url}
                      onChange={(e) => setRow(idx, { story_video_url: e.target.value })}
                    />
                  </label>
                  {row.vendor_code ? <p className="muted-text">{optionMap[row.vendor_code] || row.vendor_code}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="top-venues-admin-footer">
            <button type="button" className="btn-outline" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
              + Qator qo‘shish
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate('/profile')}>
              Orqaga
            </button>
            <button type="button" className="btn-primary" disabled={saving || loading} onClick={onSave}>
              {saving ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
