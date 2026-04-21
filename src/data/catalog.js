/**
 * Katalog ma’lumotlari faqat backenddan (admin panel) keladi.
 * Bu faylda faqat yordamchi funksiyalar.
 */

function truncateDetailText(s, max) {
  if (!s || typeof s !== 'string') return '';
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/**
 * Detail sahifa uchun: manzil, xarita havolasi, reyting, katalogdan kelgan sharhlar.
 * @param {object} vendor — API vendor (camelCase)
 */
export function enrichVendorForDetail(vendor) {
  if (!vendor) return null;
  const locSpec = vendor.specs?.find((x) => x.label === 'Joylashuv')?.value;
  const displayLocation =
    vendor.location ??
    locSpec ??
    (vendor.district ? `${vendor.district} tumani, Toshkent` : 'Toshkent');
  const q = encodeURIComponent(`${vendor.name}, ${displayLocation}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const displayRating = typeof vendor.rating === 'number' ? vendor.rating : Number(vendor.rating) || 4.5;
  const displayReviewCount =
    typeof vendor.reviewCount === 'number'
      ? vendor.reviewCount
      : 12 + ((vendor.name?.length ?? 0) + (vendor.id?.length ?? 0)) % 40;
  const displayTagline = vendor.tagline ?? truncateDetailText(vendor.description, 115);
  const catalogReviews = Array.isArray(vendor.reviews) ? vendor.reviews : [];

  return {
    ...vendor,
    displayLocation,
    mapsUrl,
    displayRating,
    displayReviewCount,
    displayTagline,
    catalogReviews,
  };
}

export function getCategoryBySlug(slug, categories) {
  if (!slug || !Array.isArray(categories)) return null;
  return categories.find((c) => c.slug === slug) ?? null;
}

export function searchVendors(query, vendors, categories) {
  const list = Array.isArray(vendors) ? vendors : [];
  const cats = Array.isArray(categories) ? categories : [];
  const q = (query || '').trim().toLowerCase();
  if (!q) return list;
  return list.filter((v) => {
    const cat = cats.find((c) => c.id === v.categoryId);
    const hay = `${v.name} ${v.district} ${cat?.title ?? ''} ${cat?.searchHint ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}
