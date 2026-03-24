// 📄 Fichier : js/history/history.js
// 🎯 Rôle : Logique métier de l'historique des séances

const History = (() => {

  const KEY = CONFIG.STORAGE_KEYS.HISTORY;

  // ── Lire tout l'historique ────────────────────────────────────
  function getAll() {
    return Storage.get(KEY) || [];
  }

  // ── Ajouter une séance ────────────────────────────────────────
  function add(session) {
    const all = getAll();
    all.unshift(session); // Plus récent en premier
    Storage.set(KEY, all);
  }

  // ── Récupérer une séance par ID ───────────────────────────────
  function getById(id) {
    return getAll().find(s => s.id === id) || null;
  }

  // ── Supprimer une séance ──────────────────────────────────────
  function remove(id) {
    const filtered = getAll().filter(s => s.id !== id);
    Storage.set(KEY, filtered);
  }

  // ── Filtrer par groupe ────────────────────────────────────────
  function getByGroup(groupId) {
    return getAll().filter(s => s.groupId === groupId);
  }

  // ── Statistiques globales ─────────────────────────────────────
  function getStats() {
    const all = getAll();
    return {
      total:      all.length,
      lastDate:   all[0]?.date || null,
      byActivity: groupBy(all, 'activityName'),
      byGroup:    groupBy(all, 'groupName')
    };
  }

  // ── Utilitaire groupBy ────────────────────────────────────────
  function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const k = item[key] || 'Inconnu';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }

  return { getAll, add, getById, remove, getByGroup, getStats };
})();
