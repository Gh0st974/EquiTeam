// 📄 Fichier : js/activities/activities.js
// 🎯 Rôle : Logique métier des activités et critères — CRUD

const Activities = (() => {

  function getAll()     { return Storage.getActivities(); }
  function getById(id)  { return getAll().find(a => a.id === id) || null; }

  // ── Créer une activité ─────────────────────────────────────────
  function create(name) {
    const list = getAll();
    const activity = {
      id:        Storage.generateId('act'),
      name:      name.trim(),
      criteria:  [],
      createdAt: new Date().toISOString()
    };
    list.push(activity);
    Storage.setActivities(list);
    return activity;
  }

  // ── Mettre à jour une activité ────────────────────────────────
  function update(id, fields) {
    const list = getAll();
    const idx  = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...fields };
    Storage.setActivities(list);
    return list[idx];
  }

  // ── Supprimer une activité ────────────────────────────────────
  function remove(id) {
    Storage.setActivities(getAll().filter(a => a.id !== id));
  }

  // ── Ajouter un critère ────────────────────────────────────────
  function addCriterion(activityId, criterion) {
    const activity = getById(activityId);
    if (!activity) return null;
    const newCrit = {
      id:     Storage.generateId('crit'),
      weight: 1,
      ...criterion
    };
    activity.criteria.push(newCrit);
    update(activityId, { criteria: activity.criteria });
    return newCrit;
  }

  // ── Mettre à jour un critère ──────────────────────────────────
  function updateCriterion(activityId, criterionId, fields) {
    const activity = getById(activityId);
    if (!activity) return;
    const idx = activity.criteria.findIndex(c => c.id === criterionId);
    if (idx === -1) return;
    activity.criteria[idx] = { ...activity.criteria[idx], ...fields };
    update(activityId, { criteria: activity.criteria });
  }

  // ── Supprimer un critère ──────────────────────────────────────
  function removeCriterion(activityId, criterionId) {
    const activity = getById(activityId);
    if (!activity) return;
    activity.criteria = activity.criteria.filter(c => c.id !== criterionId);
    update(activityId, { criteria: activity.criteria });
  }

  return { getAll, getById, create, update, remove,
           addCriterion, updateCriterion, removeCriterion };
})();
