// Sub-Admin (Vendor) API and helpers
const subadminAPI = {
  getDashboard: async () => api.get('/subadmin/dashboard'),
  getCoupons: async () => api.get('/subadmin/coupons'),
  getCouponStats: async (couponId) => api.get(`/subadmin/coupons/${couponId}/stats`),
  getReferrals: async () => api.get('/subadmin/referrals')
};
try { window.subadminAPI = subadminAPI; } catch(_) {}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text; document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
}
