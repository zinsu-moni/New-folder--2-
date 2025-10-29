// Auto-generated config to point frontend to deployed backend
// WARNING: If you need a different backend for local dev, clear localStorage key 'affluence_api_base'
(function(){
    try {
        // Set explicit API base used by js/api.js detection logic
        window.AFFLUENCE_API_BASE = 'https://affluence-backend-1wme.vercel.app/api';
        console.log('[affluence-config] Set window.AFFLUENCE_API_BASE ->', window.AFFLUENCE_API_BASE);
    } catch (e) {
        console.warn('[affluence-config] Failed to set API base:', e);
    }
})();
