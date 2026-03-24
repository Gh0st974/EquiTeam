// 📄 Fichier : js/groups/groups.js
// 🎯 Rôle : Logique métier des groupes — CRUD groupes

const Groups = (() => {

  // ── Récupérer tous les groupes ─────────────────────────────────
  function getAll() {
    return Storage.getGroups();
  }

  // ── Récupérer un groupe par ID ─────────────────────────────────
  function getById(id) {
    return getAll().find(g => g.id === id) || null;
  }

  // ── Créer un groupe ────────────────────────────────────────────
  function create(name, type) {
    const groups = getAll();
    const newGroup = {
      id:       Storage.generateId('grp'),
      name:     name.trim(),
      type:     type || CONFIG.GROUP_TYPES.CLASS,
      students: [],
      createdAt: new Date().toISOString()
    };
    groups.push(newGroup);
    Storage.setGroups(groups);
    return newGroup;
  }

  // ── Mettre à jour un groupe ────────────────────────────────────
  function update(id, fields) {
    const groups = getAll();
    const idx = groups.findIndex(g => g.id === id);
    if (idx === -1) return null;
    groups[idx] = { ...groups[idx], ...fields };
    Storage.setGroups(groups);
    return groups[idx];
  }

  // ── Supprimer un groupe ────────────────────────────────────────
  function remove(id) {
    const groups = getAll().filter(g => g.id !== id);
    Storage.setGroups(groups);
  }

  // ── Sauvegarder les élèves d'un groupe ────────────────────────
  function saveStudents(groupId, students) {
    return update(groupId, { students });
  }

  return { getAll, getById, create, update, remove, saveStudents };
})();
