/** Dev: vacío; api.js usa import.meta.env (VITE_API_URL o VITE_API_BASE_URL). En Docker se sobrescribe al arrancar. */
window.__ENV__ = window.__ENV__ || {};
