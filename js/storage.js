// 📄 Fichier : js/storage.js
// 🎯 Rôle : Lecture, écriture et export/import des données dans localStorage

const Storage = (() => {

  // ── Lecture générique ──────────────────────────────────────────
  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`[Storage] Erreur lecture ${key}`, e);
      return [];
    }
  }

  // ── Écriture générique ─────────────────────────────────────────
  function set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[Storage] Erreur écriture ${key}`, e);
    }
  }

  // ── Groupes ────────────────────────────────────────────────────
  function getGroups()       { return get(CONFIG.STORAGE_KEYS.GROUPS); }
  function setGroups(data)   { set(CONFIG.STORAGE_KEYS.GROUPS, data); }

  // ── Activités ──────────────────────────────────────────────────
  function getActivities()     { return get(CONFIG.STORAGE_KEYS.ACTIVITIES); }
  function setActivities(data) { set(CONFIG.STORAGE_KEYS.ACTIVITIES, data); }

  // ── Séances ────────────────────────────────────────────────────
  function getSessions()     { return get(CONFIG.STORAGE_KEYS.SESSIONS); }
  function setSessions(data) { set(CONFIG.STORAGE_KEYS.SESSIONS, data); }

  // ── Export JSON complet ────────────────────────────────────────
  function exportAll() {
    const data = {
      version: CONFIG.VERSION,
      exportDate: new Date().toISOString(),
      groups:     getGroups(),
      activities: getActivities(),
      sessions:   getSessions()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `equiteam_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import JSON complet ────────────────────────────────────────
  function importAll(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.groups)     setGroups(data.groups);
        if (data.activities) setActivities(data.activities);
        if (data.sessions)   setSessions(data.sessions);
        callback(null, data);
      } catch (err) {
        callback('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);
  }

  // ── Générateur d'ID unique ─────────────────────────────────────
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  return { 
    get, set,  // ← ajout des 2 fonctions génériques
    getGroups, setGroups, getActivities, setActivities,
    getSessions, setSessions, exportAll, importAll, generateId 
  };
})();
